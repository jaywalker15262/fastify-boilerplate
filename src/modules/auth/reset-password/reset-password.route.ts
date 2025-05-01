// src/routes/reset-password/route.ts
import { handleResetPassword } from './reset-password-handler';
import { FastifyInstance, FastifyRequest } from 'fastify';

type ResetBody = { token: string; newPassword: string };

export default async function resetPasswordRoute(server: FastifyInstance) {
  server.post(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['token', 'newPassword'],
          properties: {
            token: { type: 'string' },
            newPassword: { type: 'string', minLength: 8 },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: ResetBody }>, reply) => {
      const { token, newPassword } = request.body;
      try {
        await handleResetPassword(token, newPassword);
        return reply.send({
          success: true,
          message: 'Password has been reset',
        });
      } catch (error: any) {
        if (error.message === 'InvalidOrExpiredToken') {
          return reply.status(400).send({ error: 'Invalid or expired token' });
        }
        // log unexpected error here...
        return reply.status(500).send({ error: 'Server error' });
      }
    },
  );
}
