import { UserRepository } from '@/modules/user/database/user.repository.port';
import { UserEntity, UserRoles } from '@/modules/user/domain/user.types';
import { Static, Type } from '@sinclair/typebox';

export const userSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 }),
  country: Type.String({ minLength: 1, maxLength: 255 }),
  postalCode: Type.String({ minLength: 1, maxLength: 20 }),
  street: Type.String({ minLength: 1, maxLength: 255 }),
  role: Type.Enum(UserRoles),
  isVerified: Type.Boolean(),
});
export type UserModel = Static<typeof userSchema>;

export default function userRepository({
  db,
  userMapper,
  repositoryBase,
}: Dependencies): UserRepository {
  const tableName = 'users';
  return {
    ...repositoryBase({ tableName, mapper: userMapper }),
    async findOneByEmail(email: string): Promise<UserEntity | undefined> {
      const [user]: [UserModel?] =
        await db`SELECT * FROM "users" WHERE email = ${email} LIMIT 1`;
      return user ? userMapper.toDomain(user) : undefined;
    },
  };
}
