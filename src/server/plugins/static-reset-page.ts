import fastifyStatic from '@fastify/static';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import path from 'node:path';

async function staticResetPagePlugin(fastify: FastifyInstance) {
  // Serve static files from the /public/reset folder under the /reset path
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../../public/reset'),
    prefix: '/reset/',
    decorateReply: false,
  });

  // Optional: Custom 404 only for /reset/ paths
  fastify.setNotFoundHandler((request, reply) => {
    if (request.raw.url?.startsWith('/reset/')) {
      return reply.status(404).type('text/plain').send('Reset page not found');
    }

    // Let other handlers take care of unmatched routes
    throw fastify.httpErrors.notFound();
  });
}

export default fp(staticResetPagePlugin, {
  name: 'staticResetPage',
});
