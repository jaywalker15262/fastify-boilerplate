// src/modules/auth/login/login.handler.ts
import { authActionCreator } from '../index';
import { signAccessToken, signRefreshToken } from '../token';
import { Unauthorized } from '@/shared/exceptions';
import bcrypt from 'bcrypt';

export type LoginCommandPayload = {
  email: string;
  password: string;
};

export type LoginCommandResult = {
  accessToken: string;
  refreshToken: string;
};

export const loginCommand = authActionCreator<LoginCommandPayload>('login');

export default function makeLoginHandler({
  userRepository,
  commandBus,
}: Dependencies) {
  return {
    async handler({
      payload,
    }: ReturnType<typeof loginCommand>): Promise<LoginCommandResult> {
      const user = await userRepository.findOneByEmail(payload.email);

      if (!user || !(await bcrypt.compare(payload.password, user.password))) {
        throw new Unauthorized('Invalid credentials');
      }

      if (!user.isVerified) {
        throw new Unauthorized(
          'Email not verified — check your inbox for the verification link.',
        );
      }

      const { password: _, ...userSafe } = user;

      return {
        accessToken: signAccessToken({
          id: userSafe.id,
          email: userSafe.email,
        }),
        refreshToken: signRefreshToken({
          id: userSafe.id,
          email: userSafe.email,
        }),
      };
    },

    init() {
      commandBus.register(loginCommand.type, this.handler);
    },
  };
}
