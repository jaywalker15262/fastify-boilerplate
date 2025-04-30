import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fs from 'node:fs/promises';
import path from 'node:path';

export default fp(
  async function resetPagePlugin(fastify: FastifyInstance) {
    const publicDir = path.join(__dirname, '../../public');

    // Serve your reset.html on GET /redirect?token=…
    fastify.get('/redirect', async (_, reply) => {
      try {
        const html = await fs.readFile(
          path.join(publicDir, 'reset.html'),
          'utf8',
        );
        reply.type('text/html').send(html);
      } catch (error) {
        fastify.log.error('Could not load reset.html:', error);
        reply.internalServerError('Failed to load reset page');
      }
    });
  },
  {
    name: 'resetPage',
  },
);
