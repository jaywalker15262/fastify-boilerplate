// src/modules/redirect/redirect.route.ts
import { FastifyInstance } from 'fastify';
import fs from 'node:fs/promises';
import path from 'node:path';

export default async function redirectRoute(fastify: FastifyInstance) {
  fastify.get('/redirect', async (_, reply) => {
    const htmlPath = path.join(__dirname, '../../../public/reset/index.html');
    try {
      const html = await fs.readFile(htmlPath, 'utf8');
      return reply.type('text/html').send(html);
    } catch (error) {
      fastify.log.error('Failed to read redirect HTML:', error);
      return reply.internalServerError('Failed to load redirect page');
    }
  });
}
