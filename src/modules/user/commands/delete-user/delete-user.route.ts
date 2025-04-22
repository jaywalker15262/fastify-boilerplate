import {
  deleteUserCommand,
  DeleteUserCommandResult,
} from './delete-user.handler';
import { idDtoSchema } from '@/shared/api/id.response.dto';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

export default async function deleteUser(fastify: FastifyRouteInstance) {
  fastify.withTypeProvider<TypeBoxTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      description: 'Delete a user',
      params: idDtoSchema,
      response: {
        204: {
          type: 'null',
          description: 'User Deleted',
        },
      },
      tags: ['users'],
    },
    handler: async (req, res) => {
      await fastify.commandBus.execute<DeleteUserCommandResult>(
        deleteUserCommand({ id: req.params.id }),
      );
      return res.status(204).send();
    },
  });
}
