import { OfficialSiteCache } from './cache.entity';
import { Mapper } from '@/shared/ddd/mapper.interface';

/**
 * Shape of a row in `official_site_cache`:
 *   software_name      CITEXT PK
 *   url                TEXT
 *   fetched_at         TIMESTAMPTZ
 */
type DbModel = {
  software_name: string;
  url: string;
  fetched_at: string;
};

export const cacheMapper: Mapper<OfficialSiteCache, DbModel> = {
  toDomain(db): OfficialSiteCache {
    return {
      softwareName: db.software_name,
      url: db.url,
      fetchedAt: new Date(db.fetched_at),
    };
  },

  toPersistence(domain): DbModel {
    return {
      software_name: domain.softwareName,
      url: domain.url,
      fetched_at: domain.fetchedAt.toISOString(),
    };
  },

  toResponse(entity): Record<string, any> {
    return {
      softwareName: entity.softwareName,
      url: entity.url,
      cachedAt: entity.fetchedAt.toISOString(),
    };
  },
};
