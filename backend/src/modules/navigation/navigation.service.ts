import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BrowserSession,
  BrowserSessionDocument,
} from '../../database/schemas/browser-session.schema';
import { Visit, VisitDocument } from '../../database/schemas/visit.schema';
import { Site, SiteDocument } from '../../database/schemas/site.schema';
import { Person, PersonDocument } from '../../database/schemas/person.schema';
import {
  NavigateRequestDto,
  StepNavigationDto,
} from '../../common/dto/navigation.dto';
import {
  NavigationEntry,
  NavigationStateResponse,
  VisitRecord,
} from '../../common/types/navigation.types';
import { NavigationStateMachine } from './domain/navigation-state-machine';
import { AddressCanonicalizer } from '../../common/utils/address.util';

@Injectable()
export class NavigationService {
  private readonly logger = new Logger(NavigationService.name);

  constructor(
    @InjectModel(BrowserSession.name)
    private readonly sessionModel: Model<BrowserSessionDocument>,
    @InjectModel(Visit.name)
    private readonly visitModel: Model<VisitDocument>,
    @InjectModel(Site.name)
    private readonly siteModel: Model<SiteDocument>,
    @InjectModel(Person.name)
    private readonly personModel: Model<PersonDocument>,
  ) {}

  /**
   * Helper to format active session into NavigationStateResponse
   */
  private formatStateResponse(session: BrowserSessionDocument): NavigationStateResponse {
    const currentIndex = session.currentIndex;
    const entries = session.entries as unknown as NavigationEntry[];
    const currentEntry =
      currentIndex >= 0 && currentIndex < entries.length ? entries[currentIndex] : null;

    return {
      session: {
        _id: session._id.toString(),
        personId: session.personId,
        entries,
        currentIndex: session.currentIndex,
        version: session.version,
        updatedAt: session.updatedAt,
      },
      currentEntry,
      canGoBack: NavigationStateMachine.canGoBack(currentIndex),
      canGoForward: NavigationStateMachine.canGoForward(currentIndex, entries.length),
    };
  }

  /**
   * Loads or creates a browser session for a specific persona.
   */
  async getOrCreateSession(personId: string): Promise<NavigationStateResponse> {
    const person = await this.personModel.findById(personId);
    if (!person) {
      throw new NotFoundException(`Person with ID "${personId}" not found`);
    }

    let session = await this.sessionModel.findOne({ personId });

    if (!session) {
      // Create fresh session with default home page (tidepool.zz)
      const initialEntry = NavigationStateMachine.createEntry({
        destination: { type: 'site', address: 'tidepool.zz' },
        title: 'Tidepool Ecosystem Hub',
        status: 'loaded',
        scrollPosition: 0,
      });

      session = await this.sessionModel.create({
        personId,
        entries: [initialEntry],
        currentIndex: 0,
        version: 1,
        updatedAt: new Date(),
      });

      // Record first visit
      await this.visitModel.create({
        personId,
        address: 'tidepool.zz',
        destination: { type: 'site', address: 'tidepool.zz' },
        transition: 'typed',
        outcome: 'loaded',
        visitedAt: new Date(),
      });
    }

    return this.formatStateResponse(session);
  }

  /**
   * Executes navigation to a destination with forward path truncation and immutable visit logging.
   */
  async navigate(personId: string, dto: NavigateRequestDto): Promise<NavigationStateResponse> {
    const session = await this.sessionModel.findOne({ personId });
    if (!session) {
      throw new NotFoundException(`Session for person "${personId}" not found`);
    }

    // Optimistic concurrency check
    if (session.version !== dto.expectedVersion) {
      throw new ConflictException(
        `Session state conflict. Expected version ${dto.expectedVersion}, but found version ${session.version}`,
      );
    }

    const entries = session.entries as unknown as NavigationEntry[];
    let title = 'Web Destination';
    let status: 'loaded' | 'not-found' = 'loaded';
    let siteId: string | undefined = undefined;
    let canonicalAddress = '';

    if (dto.destination.type === 'site' && dto.destination.address) {
      canonicalAddress = AddressCanonicalizer.validateAndCanonicalize(dto.destination.address);
      const site = await this.siteModel.findOne({ address: canonicalAddress });

      if (site) {
        title = site.title;
        status = 'loaded';
        siteId = site._id.toString();
      } else {
        title = 'Address Not Found';
        status = 'not-found';
      }
      dto.destination.address = canonicalAddress;
    } else if (dto.destination.type === 'search') {
      title = `Search: ${dto.destination.query || ''}`;
      status = 'loaded';
    }

    const newEntry = NavigationStateMachine.createEntry({
      destination: dto.destination as any,
      title,
      status,
      scrollPosition: 0,
    });

    // Apply pure state transition
    const result = NavigationStateMachine.navigate(
      entries,
      session.currentIndex,
      newEntry,
      dto.currentScrollPosition,
    );

    // Persist updated session
    session.entries = result.entries as any;
    session.currentIndex = result.currentIndex;
    session.version += 1;
    session.updatedAt = new Date();
    await session.save();

    // Persist immutable visit record
    await this.visitModel.create({
      personId,
      address: canonicalAddress || (dto.destination.query ? `search?q=${dto.destination.query}` : 'unknown.zz'),
      siteId,
      destination: dto.destination,
      transition: dto.source,
      outcome: status,
      visitedAt: new Date(),
    });

    return this.formatStateResponse(session);
  }

  /**
   * Moves one step backward in the active stack.
   * Does NOT append navigation entry and does NOT erase any visit records.
   */
  async stepBack(personId: string, dto: StepNavigationDto): Promise<NavigationStateResponse> {
    const session = await this.sessionModel.findOne({ personId });
    if (!session) {
      throw new NotFoundException(`Session for person "${personId}" not found`);
    }

    if (session.version !== dto.expectedVersion) {
      throw new ConflictException(
        `Session state conflict. Expected version ${dto.expectedVersion}, but found ${session.version}`,
      );
    }

    const entries = session.entries as unknown as NavigationEntry[];
    const result = NavigationStateMachine.back(
      entries,
      session.currentIndex,
      dto.currentScrollPosition,
    );

    if (result.changed) {
      session.entries = result.entries as any;
      session.currentIndex = result.currentIndex;
      session.version += 1;
      session.updatedAt = new Date();
      await session.save();
    }

    return this.formatStateResponse(session);
  }

  /**
   * Moves one step forward in the active stack.
   */
  async stepForward(personId: string, dto: StepNavigationDto): Promise<NavigationStateResponse> {
    const session = await this.sessionModel.findOne({ personId });
    if (!session) {
      throw new NotFoundException(`Session for person "${personId}" not found`);
    }

    if (session.version !== dto.expectedVersion) {
      throw new ConflictException(
        `Session state conflict. Expected version ${dto.expectedVersion}, but found ${session.version}`,
      );
    }

    const entries = session.entries as unknown as NavigationEntry[];
    const result = NavigationStateMachine.forward(
      entries,
      session.currentIndex,
      dto.currentScrollPosition,
    );

    if (result.changed) {
      session.entries = result.entries as any;
      session.currentIndex = result.currentIndex;
      session.version += 1;
      session.updatedAt = new Date();
      await session.save();
    }

    return this.formatStateResponse(session);
  }

  /**
   * Jumps to a specific entry in the navigation stack by ID.
   */
  async jumpHistoryEntry(
    personId: string,
    entryId: string,
    dto: StepNavigationDto,
  ): Promise<NavigationStateResponse> {
    const session = await this.sessionModel.findOne({ personId });
    if (!session) {
      throw new NotFoundException(`Session for person "${personId}" not found`);
    }

    if (session.version !== dto.expectedVersion) {
      throw new ConflictException(
        `Session state conflict. Expected version ${dto.expectedVersion}, but found ${session.version}`,
      );
    }

    const entries = session.entries as unknown as NavigationEntry[];
    const result = NavigationStateMachine.jumpToEntry(
      entries,
      session.currentIndex,
      entryId,
      dto.currentScrollPosition,
    );

    if (result.changed) {
      session.entries = result.entries as any;
      session.currentIndex = result.currentIndex;
      session.version += 1;
      session.updatedAt = new Date();
      await session.save();
    }

    return this.formatStateResponse(session);
  }

  /**
   * Returns chronological immutable visit history for a person.
   */
  async getVisitHistory(personId: string, limit = 50, skip = 0): Promise<VisitRecord[]> {
    const visits = await this.visitModel
      .find({ personId })
      .sort({ visitedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return visits.map((v) => ({
      _id: v._id.toString(),
      personId: v.personId,
      address: v.address,
      siteId: v.siteId,
      destination: v.destination,
      transition: v.transition,
      outcome: v.outcome,
      visitedAt: v.visitedAt,
    }));
  }
}

