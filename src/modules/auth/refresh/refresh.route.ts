import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import { handleRefresh } from './refresh.handler';

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
      schema: {
        body: refreshSchema,
        response: {
          200: refreshResponseSchema,
        },
      },
    },
    handleRefresh
  );
}
