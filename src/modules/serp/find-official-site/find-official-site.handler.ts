import env from '@/config/env';
import { Cradle } from '@/server/di/cradle';
import { FastifyRequest, FastifyReply } from 'fastify';
import { GoogleSearch } from 'google-search-results-nodejs';

// assuming that's the file

export const findOfficialSiteHandler = async (
  request: FastifyRequest<{ Querystring: { softwareName: string } }>,
  reply: FastifyReply,
) => {
  const { softwareName } = request.query;

  if (!softwareName || softwareName.length < 2) {
    return reply
      .code(400)
      .send({ url: 'Not found', reason: 'Invalid software name' });
  }

  const repo = request.diScope.resolve<Cradle['officialSiteCacheRepo']>(
    'officialSiteCacheRepo',
  );

  // Check cache
  const cached = await repo.findById(softwareName);
  if (cached) {
    return reply.code(200).send({
      url: cached.url,
      cached: true,
    });
  }

  // Fallback to SerpAPI
  const search = new GoogleSearch(env.serpaiApiKey);

  try {
    const result = await new Promise<string>((resolve) => {
      search.json(
        { q: `${softwareName} official site download`, num: 5 },
        (data: {
          organic_results?: {
            link?: string;
            title?: string;
            snippet?: string;
          }[];
        }) => {
          const results = data.organic_results || [];

          const targetHost = softwareName
            .toLowerCase()
            .match(/[a-z0-9-]+\.[a-z]{2,}/)?.[0];

          const withLinks = results.filter(
            (r): r is { link: string; title?: string; snippet?: string } =>
              typeof r.link === 'string' && r.link.startsWith('https'),
          );

          const scored = withLinks
            .map((r) => {
              const text = `${r.title} ${r.snippet}`.toLowerCase();
              const url = new URL(r.link);
              const domainHost = url.hostname.split('.').slice(-2).join('.');

              let score = 0;
              if (/download|installer|\.exe|\.zip|\.dmg|desktop app/.test(text))
                score += 10;
              if (/official site|homepage/.test(text)) score += 5;
              if (targetHost && domainHost === targetHost) score += 10;

              return { url: r.link, score };
            })
            .sort((a, b) => b.score - a.score);

          const best = scored.find((r) => r.score >= 10);
          if (best) {
            resolve(best.url);
          } else if (scored[0]) {
            resolve(scored[0].url);
          } else {
            resolve('Not found');
          }
        },
      );
    });

    // Save to cache
    if (result !== 'Not found') {
      await repo.save({
        softwareName,
        url: result,
        fetchedAt: new Date(),
      });
    }

    return reply.code(200).send({
      url: result,
      cached: false,
    });
  } catch (error: any) {
    request.log.error(`SerpAPI error: ${error.message}`);
    return reply.code(500).send({ url: 'Not found', error: error.message });
  }
};
