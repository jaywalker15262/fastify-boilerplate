import { OfficialSiteCache } from './cache.entity';
import { RepositoryPort } from '@/shared/db/repository.port';

export interface CacheRepository extends RepositoryPort<OfficialSiteCache> {
  findOneBySoftwareName(name: string): Promise<OfficialSiteCache | undefined>;
}
