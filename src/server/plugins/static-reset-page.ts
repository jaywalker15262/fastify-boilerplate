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
}

export default fp(staticResetPagePlugin, {
  name: 'staticResetPage',
});
