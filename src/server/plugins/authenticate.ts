// src/server/plugins/authenticate.ts
import { verifyToken } from '@/modules/auth/token';
import type { FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

export default fp(
  async (fastify) => {
    fastify.decorate(
      'authenticate',
      async (request: FastifyRequest, reply: FastifyReply) => {
        const auth = request.headers.authorization;
        if (!auth?.startsWith('Bearer ')) {
          reply.code(401).send({ message: 'Missing or malformed token' });
          return;
        }

        const token = auth.slice(7);
        try {
          const payload = verifyToken(token) as { id: string; email: string };
          request.user = payload;
        } catch (error) {
          fastify.log.error(error);
          reply.code(401).send({ message: 'Invalid or expired token' });
        }
      },
    );
  },
  {
    name: 'authenticate',
  },
);
