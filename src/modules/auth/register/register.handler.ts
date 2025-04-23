import { RegisterRequest } from './register.schema';
import {
  createUserCommand,
  CreateUserCommandResult,
} from '@/modules/user/commands/create-user/create-user.handler';

export async function registerHandler(
  fastify: FastifyRouteInstance,
  payload: RegisterRequest,
): Promise<{ id: string }> {
  const id = await fastify.commandBus.execute<CreateUserCommandResult>(
    createUserCommand(payload),
  );
  return { id };
}
