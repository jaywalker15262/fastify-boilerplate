import { userActionCreator } from '@/modules/user';
import { NotFoundException } from '@/shared/exceptions';

export type DeleteUserCommandResult = Promise<boolean>;
export const deleteUserCommand = userActionCreator<{ id: string }>('delete');

export default function makeDeleteUser({
  userRepository,
  commandBus,
}: Dependencies) {
  return {
    async handler({
      payload,
    }: ReturnType<typeof deleteUserCommand>): DeleteUserCommandResult {
      const user = await userRepository.findOneById(payload.id);
      if (!user) {
        throw new NotFoundException();
      }
      const result = await userRepository.delete(payload.id);
      return result;
    },
    init() {
      commandBus.register(deleteUserCommand.type, this.handler);
    },
  };
}
