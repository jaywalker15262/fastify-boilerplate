import { handleRefresh } from './refresh.handler';
import { Type } from '@sinclair/typebox';
import { FastifyInstance } from 'fastify';

const refreshSchema = Type.Object({
  refreshToken: Type.String(),
});

const refreshResponseSchema = Type.Object({
  accessToken: Type.String(),
  expiresIn: Type.Number(),
});

export default async function refreshRoute(server: FastifyInstance) {
  server.post(
    '/',
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: '15m',
        },
      },
      schema: {
        body: refreshSchema,
        response: {
          200: refreshResponseSchema,
        },
      },
    },
    handleRefresh,
  );
}
