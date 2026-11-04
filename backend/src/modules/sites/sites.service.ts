import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Site, SiteDocument } from '../../database/schemas/site.schema';
import { Person, PersonDocument } from '../../database/schemas/person.schema';
import { PublishSiteDto } from '../../common/dto/navigation.dto';
import { AddressCanonicalizer } from '../../common/utils/address.util';
import { HtmlSanitizerService } from './security/html-sanitizer.service';
import { Site as SiteInterface } from '../../common/types/navigation.types';

@Injectable()
export class SitesService {
  private readonly logger = new Logger(SitesService.name);

  constructor(
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
    @InjectModel(Person.name) private readonly personModel: Model<PersonDocument>,
    private readonly sanitizer: HtmlSanitizerService,
  ) {}

  /**
   * Resolves a site by canonical .zz address.
   */
  async resolveByAddress(rawAddress: string): Promise<SiteInterface> {
    const canonicalAddress = AddressCanonicalizer.validateAndCanonicalize(rawAddress);
    const site = await this.siteModel.findOne({ address: canonicalAddress }).lean();

    if (!site) {
      throw new NotFoundException(`Site with address "${canonicalAddress}" was not found.`);
    }

    const author = await this.personModel.findById(site.authorId).lean();

    return {
      _id: site._id.toString(),
      address: site.address,
      title: site.title,
      html: site.html,
      searchableText: site.searchableText,
      authorId: site.authorId,
      authorName: author ? author.name : 'Unknown Author',
      createdAt: site.createdAt,
      updatedAt: site.updatedAt,
    };
  }

  /**
   * Validates, sanitizes, indexes, and publishes a new web page.
   */
  async publishSite(dto: PublishSiteDto): Promise<SiteInterface> {
    const canonicalAddress = AddressCanonicalizer.validateAndCanonicalize(dto.address);

    // Check for duplicate address conflict
    const existing = await this.siteModel.findOne({ address: canonicalAddress });
    if (existing) {
      throw new ConflictException(
        `Address "${canonicalAddress}" is already registered. Internal addresses must be unique.`,
      );
    }

    // Verify author exists
    const author = await this.personModel.findById(dto.authorId);
    if (!author) {
      throw new NotFoundException(`Author with ID "${dto.authorId}" does not exist.`);
    }

    // Defense-in-depth HTML sanitization & plain-text extraction
    const sanitizedHtml = this.sanitizer.sanitize(dto.html);
    const searchableText = this.sanitizer.extractSearchableText(dto.html);

    const newSite = await this.siteModel.create({
      address: canonicalAddress,
      title: dto.title.trim(),
      html: sanitizedHtml,
      searchableText,
      authorId: dto.authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.logger.log(`✓ Published new site: ${canonicalAddress} by ${author.name}`);

    return {
      _id: newSite._id.toString(),
      address: newSite.address,
      title: newSite.title,
      html: newSite.html,
      searchableText: newSite.searchableText,
      authorId: newSite.authorId,
      authorName: author.name,
      createdAt: newSite.createdAt,
      updatedAt: newSite.updatedAt,
    };
  }

  /**
   * Lists all published sites.
   */
  async listAllSites(): Promise<SiteInterface[]> {
    const sites = await this.siteModel.find().sort({ createdAt: -1 }).lean();
    return sites.map((s) => ({
      _id: s._id.toString(),
      address: s.address,
      title: s.title,
      html: s.html,
      searchableText: s.searchableText,
      authorId: s.authorId,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }
}
