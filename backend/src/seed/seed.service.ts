import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Person, PersonDocument } from '../database/schemas/person.schema';
import { Site, SiteDocument } from '../database/schemas/site.schema';
import { BrowserSession, BrowserSessionDocument } from '../database/schemas/browser-session.schema';
import { Visit, VisitDocument } from '../database/schemas/visit.schema';
import { SEED_PEOPLE, SEED_SITES } from './seed.data';
import { AddressCanonicalizer } from '../common/utils/address.util';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Person.name) private readonly personModel: Model<PersonDocument>,
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
    @InjectModel(BrowserSession.name) private readonly sessionModel: Model<BrowserSessionDocument>,
    @InjectModel(Visit.name) private readonly visitModel: Model<VisitDocument>,
  ) {}

  /**
   * Helper to strip HTML tags into plain searchable text
   */
  private extractSearchableText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Idempotently seeds the database. Safe to run multiple times with zero duplicates.
   */
  async seed(): Promise<{ peopleCount: number; sitesCount: number; sessionsCount: number; visitsCount: number }> {
    this.logger.log('🌱 Starting deterministic seed process...');

    // 1. Seed People (Upsert by fixed _id)
    for (const p of SEED_PEOPLE) {
      await this.personModel.updateOne(
        { _id: p._id },
        { $set: { name: p.name, createdAt: new Date('2026-11-01T08:00:00Z') } },
        { upsert: true },
      );
    }
    this.logger.log(`✓ Seeded ${SEED_PEOPLE.length} browsing personas.`);

    // 2. Seed Sites (Upsert by fixed _id and canonical address)
    for (const s of SEED_SITES) {
      const canonicalAddress = AddressCanonicalizer.validateAndCanonicalize(s.address);
      const searchableText = this.extractSearchableText(s.html);

      await this.siteModel.updateOne(
        { _id: s._id },
        {
          $set: {
            address: canonicalAddress,
            title: s.title,
            html: s.html.trim(),
            searchableText,
            authorId: s.authorId,
            updatedAt: new Date('2026-11-01T09:00:00Z'),
          },
          $setOnInsert: {
            createdAt: new Date('2026-11-01T08:30:00Z'),
          },
        },
        { upsert: true },
      );
    }
    this.logger.log(`✓ Seeded ${SEED_SITES.length} interconnected .zz sites.`);

    // 3. Seed Browser Sessions & 1 hour of realistic activity for Alice, Bob, and Charlie
    const baseTime = new Date('2026-11-04T16:00:00Z').getTime();

    // Alice: Started at tidepool.zz -> followed coral-reef.zz -> followed starfish.zz
    const aliceSessionEntries = [
      {
        entryId: 'entry-alice-01',
        destination: { type: 'site' as const, address: 'tidepool.zz' },
        title: 'Tidepool Ecosystem Hub',
        status: 'loaded' as const,
        scrollPosition: 0,
        createdAt: new Date(baseTime),
      },
      {
        entryId: 'entry-alice-02',
        destination: { type: 'site' as const, address: 'coral-reef.zz' },
        title: 'Coral Reef Sanctuary',
        status: 'loaded' as const,
        scrollPosition: 120,
        createdAt: new Date(baseTime + 15 * 60000),
      },
      {
        entryId: 'entry-alice-03',
        destination: { type: 'site' as const, address: 'starfish.zz' },
        title: 'Echinoderm & Starfish Field Guide',
        status: 'loaded' as const,
        scrollPosition: 45,
        createdAt: new Date(baseTime + 30 * 60000),
      },
    ];

    await this.sessionModel.updateOne(
      { personId: SEED_PEOPLE[0]._id },
      {
        $set: {
          entries: aliceSessionEntries,
          currentIndex: 2,
          version: 3,
          updatedAt: new Date(baseTime + 30 * 60000),
        },
      },
      { upsert: true },
    );

    // Bob: Started at deep-trench.zz -> abyss.zz -> nautilus.zz
    const bobSessionEntries = [
      {
        entryId: 'entry-bob-01',
        destination: { type: 'site' as const, address: 'deep-trench.zz' },
        title: 'Mariana Abyss Deep Trench',
        status: 'loaded' as const,
        scrollPosition: 0,
        createdAt: new Date(baseTime + 5 * 60000),
      },
      {
        entryId: 'entry-bob-02',
        destination: { type: 'site' as const, address: 'abyss.zz' },
        title: 'Abyssal Plain Research Station',
        status: 'loaded' as const,
        scrollPosition: 300,
        createdAt: new Date(baseTime + 25 * 60000),
      },
      {
        entryId: 'entry-bob-03',
        destination: { type: 'site' as const, address: 'nautilus.zz' },
        title: 'Research Vessel Nautilus Expedition',
        status: 'loaded' as const,
        scrollPosition: 0,
        createdAt: new Date(baseTime + 40 * 60000),
      },
    ];

    await this.sessionModel.updateOne(
      { personId: SEED_PEOPLE[1]._id },
      {
        $set: {
          entries: bobSessionEntries,
          currentIndex: 2,
          version: 3,
          updatedAt: new Date(baseTime + 40 * 60000),
        },
      },
      { upsert: true },
    );

    // Charlie: Started at lighthouse.zz -> driftwood.zz -> clicked broken link sunken-ruins.zz
    const charlieSessionEntries = [
      {
        entryId: 'entry-charlie-01',
        destination: { type: 'site' as const, address: 'lighthouse.zz' },
        title: 'Cape Horn Lighthouse Observations',
        status: 'loaded' as const,
        scrollPosition: 50,
        createdAt: new Date(baseTime + 10 * 60000),
      },
      {
        entryId: 'entry-charlie-02',
        destination: { type: 'site' as const, address: 'driftwood.zz' },
        title: 'Driftwood Coastal Museum',
        status: 'loaded' as const,
        scrollPosition: 0,
        createdAt: new Date(baseTime + 28 * 60000),
      },
      {
        entryId: 'entry-charlie-03',
        destination: { type: 'site' as const, address: 'sunken-ruins.zz' },
        title: 'Address Not Found',
        status: 'not-found' as const,
        scrollPosition: 0,
        createdAt: new Date(baseTime + 50 * 60000),
      },
    ];

    await this.sessionModel.updateOne(
      { personId: SEED_PEOPLE[2]._id },
      {
        $set: {
          entries: charlieSessionEntries,
          currentIndex: 2,
          version: 3,
          updatedAt: new Date(baseTime + 50 * 60000),
        },
      },
      { upsert: true },
    );

    // 4. Seed Historical Visits (Chronological audit records across the 1 hour)
    // Clear existing visits for seed people to maintain deterministic idempotency
    await this.visitModel.deleteMany({
      personId: { $in: SEED_PEOPLE.map((p) => p._id) },
    });

    const historicalVisits = [
      // Alice's timeline
      {
        personId: SEED_PEOPLE[0]._id,
        address: 'tidepool.zz',
        siteId: '663675f3a093a1d9426f0101',
        destination: { type: 'site', address: 'tidepool.zz' },
        transition: 'typed' as const,
        outcome: 'loaded' as const,
        visitedAt: new Date(baseTime),
      },
      {
        personId: SEED_PEOPLE[0]._id,
        address: 'coral-reef.zz',
        siteId: '663675f3a093a1d9426f0102',
        destination: { type: 'site', address: 'coral-reef.zz' },
        transition: 'link' as const,
        outcome: 'loaded' as const,
        visitedAt: new Date(baseTime + 15 * 60000),
      },
      {
        personId: SEED_PEOPLE[0]._id,
        address: 'starfish.zz',
        siteId: '663675f3a093a1d9426f0109',
        destination: { type: 'site', address: 'starfish.zz' },
        transition: 'link' as const,
        outcome: 'loaded' as const,
        visitedAt: new Date(baseTime + 30 * 60000),
      },

      // Bob's timeline
      {
        personId: SEED_PEOPLE[1]._id,
        address: 'deep-trench.zz',
        siteId: '663675f3a093a1d9426f0103',
        destination: { type: 'site', address: 'deep-trench.zz' },
        transition: 'typed' as const,
        outcome: 'loaded' as const,
        visitedAt: new Date(baseTime + 5 * 60000),
      },
      {
        personId: SEED_PEOPLE[1]._id,
        address: 'abyss.zz',
        siteId: '663675f3a093a1d9426f0105',
        destination: { type: 'site', address: 'abyss.zz' },
        transition: 'link' as const,
        outcome: 'loaded' as const,
        visitedAt: new Date(baseTime + 25 * 60000),
      },
      {
        personId: SEED_PEOPLE[1]._id,
        address: 'nautilus.zz',
        siteId: '663675f3a093a1d9426f0108',
        destination: { type: 'site', address: 'nautilus.zz' },
        transition: 'link' as const,
        outcome: 'loaded' as const,
        visitedAt: new Date(baseTime + 40 * 60000),
      },

      // Charlie's timeline (including 404 broken link visit)
      {
        personId: SEED_PEOPLE[2]._id,
        address: 'lighthouse.zz',
        siteId: '663675f3a093a1d9426f0104',
        destination: { type: 'site', address: 'lighthouse.zz' },
        transition: 'typed' as const,
        outcome: 'loaded' as const,
        visitedAt: new Date(baseTime + 10 * 60000),
      },
      {
        personId: SEED_PEOPLE[2]._id,
        address: 'driftwood.zz',
        siteId: '663675f3a093a1d9426f0106',
        destination: { type: 'site', address: 'driftwood.zz' },
        transition: 'link' as const,
        outcome: 'loaded' as const,
        visitedAt: new Date(baseTime + 28 * 60000),
      },
      {
        personId: SEED_PEOPLE[2]._id,
        address: 'sunken-ruins.zz',
        destination: { type: 'site', address: 'sunken-ruins.zz' },
        transition: 'link' as const,
        outcome: 'not-found' as const,
        visitedAt: new Date(baseTime + 50 * 60000),
      },
    ];

    await this.visitModel.insertMany(historicalVisits);
    this.logger.log(`✓ Seeded ${historicalVisits.length} historical audit visit records.`);

    return {
      peopleCount: SEED_PEOPLE.length,
      sitesCount: SEED_SITES.length,
      sessionsCount: 3,
      visitsCount: historicalVisits.length,
    };
  }
}
