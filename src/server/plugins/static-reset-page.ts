import fastifyStatic from '@fastify/static';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import path from 'node:path';

async function staticResetPagePlugin(fastify: FastifyInstance) {
  // serve everything in /public at the root
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../../public'),
    prefix: '/',
    decorateReply: true,
  });

  // when someone hits /redirect?token=…, give them reset.html
  fastify.get('/redirect', (_, reply) => {
    // this will send public/reset.html
    return reply.sendFile('reset.html');
  });
}

export default fp(staticResetPagePlugin, {
  name: 'staticResetPage',
});
