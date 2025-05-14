import { OfficialSiteCache } from './cache.entity';
import { cacheMapper } from './cache.mapper';
import { RepositoryPort } from '@/shared/db/repository.port';

export function makeOfficialSiteCacheRepo(deps: {
  repositoryBase: <T>(opts: {
    tableName: string;
    mapper: any;
  }) => RepositoryPort<T>;
}): RepositoryPort<OfficialSiteCache> {
  return deps.repositoryBase<OfficialSiteCache>({
    tableName: 'official_sites',
    mapper: cacheMapper,
  });
}
