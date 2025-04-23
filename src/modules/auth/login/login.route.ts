import { parseJwtExpires } from '../token';
import { loginCommand, LoginCommandResult } from './login.handler';
import { loginSchema, loginResponseSchema, LoginSchema } from './login.schema';
import env from '@/config/env';
import { FastifyInstance, FastifyRequest } from 'fastify';

export default async function loginRoute(server: FastifyInstance) {
  server.post(
    '/',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '10m',
        },
      },
      schema: {
        body: loginSchema,
        response: {
          200: loginResponseSchema,
        },
      },
    },
    async (request: FastifyRequest<{ Body: LoginSchema }>, reply) => {
      const { email, password } = request.body;

      const { accessToken, refreshToken }: LoginCommandResult =
        await request.diScope
          .resolve('commandBus')
          .execute(loginCommand({ email, password }));

      const expiresIn = parseJwtExpires(env.jwt.expiresIn);

      return reply.send({
        accessToken,
        refreshToken,
        expiresIn,
      });
    },
  );
}
