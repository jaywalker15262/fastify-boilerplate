import env from '@/config/env';
import { FastifyRequest, FastifyReply } from 'fastify';
import { GoogleSearch } from 'google-search-results-nodejs';

interface SiteRequest
  extends FastifyRequest<{ Querystring: { softwareName: string } }> {}

export const findOfficialSiteHandler = async (
  request: SiteRequest,
  reply: FastifyReply,
) => {
  const { softwareName } = request.query;

  if (!softwareName || softwareName.length < 2) {
    return reply
      .code(400)
      .send({ url: 'Not found', reason: 'Invalid software name' });
  }

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

          // console.log('[findOfficialSiteHandler] SERP Results:')
          // results.forEach(r => console.log(`- ${r.title} | ${r.link}`))

          const targetHost = softwareName
            .toLowerCase()
            .match(/[a-z0-9-]+\.[a-z]{2,}/)?.[0];

          // Type-guard filter so TS knows r.link is string
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

          // console.log('[findOfficialSiteHandler] Scored results:')
          // scored.forEach(r => console.log(`- ${r.url} (score: ${r.score})`))

          const best = scored.find((r) => r.score >= 10);
          if (best) {
            // console.log(`[findOfficialSiteHandler] Picked: ${best.url} (score: ${best.score})`)
            resolve(best.url);
          } else if (scored[0]) {
            // console.warn(`[findOfficialSiteHandler] Fallback to low-score result: ${scored[0].url}`)
            resolve(scored[0].url);
          } else {
            // console.warn(`[findOfficialSiteHandler] No valid results for "${softwareName}"`)
            resolve('Not found');
          }
        },
      );
    });

    return reply.code(200).send({ url: result });
  } catch (error: any) {
    request.log.error(`SerpAPI error: ${error.message}`);
    return reply.code(500).send({ url: 'Not found', error: error.message });
  }
};
