import { validateFallbackDownloadHandler } from './validate-fallback-download.handler';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export default async function validateFallbackDownloadRoute(
  server: FastifyInstance,
) {
  server.post<{
    Body: {
      softwareName: string;
      platform: string;
      fallbackUrl: string;
      referrer: string;
    };
  }>(
    '/',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 minute',
        },
      },
      schema: {
        body: {
          type: 'object',
          required: ['softwareName', 'platform', 'fallbackUrl', 'referrer'],
          properties: {
            softwareName: { type: 'string' },
            platform: { type: 'string' },
            fallbackUrl: { type: 'string', format: 'uri' },
            referrer: { type: 'string', format: 'uri' },
          },
        },
      },
    },
    // now request.body will be typed correctly for the handler:
    async (
      request: FastifyRequest<{
        Body: {
          softwareName: string;
          platform: string;
          fallbackUrl: string;
          referrer: string;
        };
      }>,
      reply: FastifyReply,
    ) => {
      return validateFallbackDownloadHandler(request, reply);
    },
  );
}
