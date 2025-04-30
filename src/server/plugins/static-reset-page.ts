// src/server/plugins/reset-page.ts
import fastifyStatic from '@fastify/static';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import path from 'node:path';

export default fp(
  async function resetPagePlugin(fastify: FastifyInstance) {
    const publicDir = path.join(process.cwd(), 'public');
    await fastify.register(fastifyStatic, {
      root: publicDir,
      prefix: '/',
      decorateReply: true, // adds reply.sendFile()
    });

    fastify.get('/redirect', async (_, reply) => {
      return reply.type('text/html').sendFile('reset.html');
    });
  },
  {
    name: 'resetPage',
  },
);
