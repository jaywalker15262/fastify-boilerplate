import { deleteUserCommand } from '@/modules/user/commands/delete-user/delete-user.handler';
import type { FastifyReply, FastifyRequest } from 'fastify';

export function makeDeleteAccountHandler(fastify: FastifyRouteInstance) {
  return async function deleteAccountHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const user = request.user;
    if (!user?.id) {
      throw fastify.httpErrors.unauthorized('Not authenticated');
    }

    await fastify.commandBus.execute(deleteUserCommand({ id: user.id }));

    return reply.status(204).send();
  };
}
