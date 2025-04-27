import env from '@/config/env';
import { di } from '@/server/di';
import getGQL from '@/server/plugins/gql';
import AutoLoad from '@fastify/autoload';
import Cors from '@fastify/cors';
import Helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import UnderPressure from '@fastify/under-pressure';
import { FastifyInstance } from 'fastify';
import mercurius from 'mercurius';
import path from 'node:path';

export default async function createServer(fastify: FastifyInstance) {
  // Global rate limit to prevent abuse
  await fastify.register(rateLimit, {
    max: 100, // total requests
    timeWindow: '1 minute',
    allowList: ['127.0.0.1'],
  });

  // bring in fastify.httpErrors, httpCodes, etc.
  await fastify.register(sensible);

  // Graphql
  await fastify.register(mercurius, {
    schema: await getGQL(),
    graphiql: env.isDevelopment,
    defineMutation: true,
  });

  // Set sensible default security headers
  await fastify.register(Helmet, {
    global: true,
    // The following settings are needed for graphiql, see https://github.com/graphql/graphql-playground/issues/1283
    contentSecurityPolicy: !env.isDevelopment,
    crossOriginEmbedderPolicy: !env.isDevelopment,
  });

  // Enables the use of CORS in a Fastify application.
  // https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
  await fastify.register(Cors, {
    origin: false,
  });

  // Auto-load plugins
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    dirNameRoutePrefix: false,
  });

  // Configure Dependency Injection
  await di(fastify);

  // Auto-load routes
  await fastify.register(
    async (instance) => {
      await instance.register(AutoLoad, {
        dir: path.join(__dirname, '../modules'),
        dirNameRoutePrefix: true,
        matchFilter: (path) =>
          ['.route.ts', '.resolver.ts'].some((e) => path.endsWith(e)),
      });
    },
    { prefix: '/api' },
  );

  await fastify.register(UnderPressure);

  return fastify.withTypeProvider<TypeBoxTypeProvider>();
}
