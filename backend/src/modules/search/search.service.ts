import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Site, SiteDocument } from '../../database/schemas/site.schema';
import { SearchQueryDto } from '../../common/dto/navigation.dto';

export interface SearchResultItem {
  _id: string;
  address: string;
  title: string;
  snippet: string;
  score?: number;
}

export interface SearchResultsResponse {
  query: string;
  page: number;
  total: number;
  results: SearchResultItem[];
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(@InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>) {}

  /**
   * Generates a relevant text snippet around search matches.
   */
  private generateSnippet(text: string, query: string, maxLength = 160): string {
    if (!text) return '';
    const cleanText = text.replace(/\s+/g, ' ').trim();
    const queryIndex = cleanText.toLowerCase().indexOf(query.toLowerCase());

    if (queryIndex === -1) {
      return cleanText.length > maxLength
        ? `${cleanText.substring(0, maxLength)}...`
        : cleanText;
    }

    const start = Math.max(0, queryIndex - 40);
    const end = Math.min(cleanText.length, queryIndex + query.length + 80);
    let snippet = cleanText.substring(start, end);

    if (start > 0) snippet = `...${snippet}`;
    if (end < cleanText.length) snippet = `${snippet}...`;

    return snippet;
  }

  /**
   * Performs full-text search across titles and extracted body content.
   */
  async search(dto: SearchQueryDto): Promise<SearchResultsResponse> {
    const query = dto.q ? dto.q.trim() : '';
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const limit = dto.limit && dto.limit > 0 ? dto.limit : 10;
    const skip = (page - 1) * limit;

    if (!query) {
      return { query: '', page, total: 0, results: [] };
    }

    let sites: any[] = [];
    let total = 0;

    try {
      // 1. Primary strategy: MongoDB full-text search with relevance ranking
      sites = await this.siteModel
        .find(
          { $text: { $search: query } },
          { score: { $meta: 'textScore' } },
        )
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .lean();

      total = await this.siteModel.countDocuments({ $text: { $search: query } });
    } catch (err) {
      this.logger.warn(`Text index query failed, falling back to regex: ${err}`);
      // 2. Resilient fallback: Case-insensitive regex query across title and searchableText
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      sites = await this.siteModel
        .find({
          $or: [{ title: regex }, { searchableText: regex }, { address: regex }],
        })
        .skip(skip)
        .limit(limit)
        .lean();

      total = await this.siteModel.countDocuments({
        $or: [{ title: regex }, { searchableText: regex }, { address: regex }],
      });
    }

    const results: SearchResultItem[] = sites.map((s) => ({
      _id: s._id.toString(),
      address: s.address,
      title: s.title,
      snippet: this.generateSnippet(s.searchableText, query),
      score: s.score,
    }));

    return {
      query,
      page,
      total,
      results,
    };
  }
}

