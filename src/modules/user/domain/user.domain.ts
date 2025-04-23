import {
  CreateUserProps,
  UserEntity,
  UserRoles,
} from '@/modules/user/domain/user.types';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';

export default function userDomain() {
  return {
    createUser: async (
      create: CreateUserProps & { password: string },
    ): Promise<UserEntity> => {
      const now = new Date();
      const hashedPassword = await bcrypt.hash(create.password, 10); // 10 salt rounds

      return {
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
        email: create.email,
        password: hashedPassword,
        country: create.country,
        postalCode: create.postalCode,
        street: create.street,
        role: UserRoles.guest,
        isVerified: false,
      };
    },

    validatePassword: async (
      user: UserEntity,
      password: string,
    ): Promise<boolean> => {
      return bcrypt.compare(password, user.password);
    },
  };
}
