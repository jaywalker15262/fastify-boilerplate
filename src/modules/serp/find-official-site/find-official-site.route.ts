import { findOfficialSiteHandler } from './find-official-site.handler';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

type Query = { softwareName: string };

export default async function findOfficialSiteRoute(server: FastifyInstance) {
  server.get(
    '/',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 minute',
        },
      },
      schema: {
        querystring: {
          type: 'object',
          required: ['softwareName'],
          properties: {
            softwareName: { type: 'string' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Querystring: Query }>,
      reply: FastifyReply,
    ) => {
      return findOfficialSiteHandler(request, reply);
    },
  );
}
