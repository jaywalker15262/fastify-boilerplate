import { makeDeleteAccountHandler } from './delete-account.handler';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

export default async function deleteAccountRoute(
  fastify: FastifyRouteInstance,
) {
  const handler = makeDeleteAccountHandler(fastify);

  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: 'DELETE',
    url: '/',
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1h',
      },
    },
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['auth'],
      summary: `Permanently delete the current user's account`,
      response: {
        204: { type: 'null' },
      },
    },
    handler,
  });
}
