import { generateStack } from './generate-stack.handler';
import { FastifyInstance } from 'fastify';

interface GenerateStackRequest {
  Body: {
    description: string;
    osInfo?: { platform: string; arch: string };
    ignoreList?: string[];
  };
}

export default async function generateStackRoute(fastify: FastifyInstance) {
  fastify.post<GenerateStackRequest>(
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
          required: ['description'],
          properties: {
            description: { type: 'string' },
            osInfo: {
              type: 'object',
              nullable: true,
              properties: {
                platform: { type: 'string' },
                arch: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { description, osInfo, ignoreList } = request.body;

      try {
        const resultJson = await generateStack(description, osInfo, ignoreList);
        const payload = JSON.parse(resultJson);
        return reply.code(200).send(payload);
      } catch (error: any) {
        fastify.log.error(`generate-stack error: ${error.message}`);
        return reply
          .code(500)
          .send({ error: 'AI API call failed', details: error.message });
      }
    },
  );
}
