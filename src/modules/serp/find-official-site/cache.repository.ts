import { OfficialSiteCache } from './cache.entity';
import cacheMapper from './cache.mapper';
import { CacheRepository } from './cache.repository.port';
import { RepositoryPort } from '@/shared/db/repository.port';
import { Static, Type } from '@sinclair/typebox';

// (Optional) If you need a TypeBox schema for migrations / validations:
export const cacheSchema = Type.Object({
  software_name: Type.String(),
  url: Type.String(),
  fetched_at: Type.String({ format: 'date-time' }),
});
export type CacheModel = Static<typeof cacheSchema>;

type Deps = {
  db: any; // your postgres client instance (the same you use in other repos)
  cacheMapper: typeof cacheMapper;
  repositoryBase: <T>(opts: {
    tableName: string;
    mapper: any;
  }) => RepositoryPort<T>;
};

export default function makeCacheRepository({
  db,
  cacheMapper,
  repositoryBase,
}: Deps): CacheRepository {
  const tableName = 'official_sites';
  const mapper = cacheMapper();

  return {
    ...repositoryBase<OfficialSiteCache>({
      tableName,
      mapper,
    }),

    async findOneBySoftwareName(
      name: string,
    ): Promise<OfficialSiteCache | undefined> {
      const [row]: [CacheModel?] = await db`
        SELECT * 
          FROM ${db(tableName)} 
         WHERE software_name = ${name} 
         LIMIT 1
      `;
      return row ? mapper.toDomain(row) : undefined;
    },
  };
}
