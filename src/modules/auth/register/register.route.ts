import { registerHandler } from './register.handler';
import { registerRequestSchema } from './register.schema';
import { idDtoSchema } from '@/shared/api/id.response.dto';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

export default async function registerRoute(fastify: FastifyRouteInstance) {
  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: 'POST',
    url: '/',
    config: {
      rateLimit: {
        max: 30,
        timeWindow: '1h',
      },
    },
    schema: {
      tags: ['auth'],
      summary: 'Register a new user',
      body: registerRequestSchema,
      response: {
        201: idDtoSchema,
      },
    },
    handler: async (req, res) => {
      const { id } = await registerHandler(fastify, req.body);
      return res.status(201).send({ id });
    },
  });
}
