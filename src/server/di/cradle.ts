import { OfficialSiteCache } from '@/modules/serp/find-official-site/cache.entity';

export interface Cradle {
  officialSiteCacheRepo: {
    findById: (id: string) => Promise<OfficialSiteCache | null>;
    save: (entity: OfficialSiteCache) => Promise<void>;
  };
  // Add other registered services here
}
