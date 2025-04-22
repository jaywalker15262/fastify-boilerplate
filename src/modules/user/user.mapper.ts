import { UserModel, userSchema } from '@/modules/user/database/user.repository';
import { UserEntity } from '@/modules/user/domain/user.types';
import { UserResponseDto } from '@/modules/user/dtos/user.response.dto';
import { Mapper } from '@/shared/ddd/mapper.interface';
import { ArgumentInvalidException } from '@/shared/exceptions';
import { ajv } from '@/shared/utils/validator.util';

export default function userMapper(): Mapper<
  UserEntity,
  UserModel,
  UserResponseDto
> {
  const persistenceValidator = ajv.compile(userSchema);
  return {
    toDomain(record: UserModel): UserEntity {
      return {
        id: record.id,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
        email: record.email,
        password: record.password,
        role: record.role,
        street: record.street,
        postalCode: record.postalCode,
        country: record.country,
      };
    },
    toResponse(entity: UserEntity): UserResponseDto {
      const {
        password, // Strip this out
        ...safeData
      } = entity;

      return {
        ...safeData,
        updatedAt: entity.updatedAt.toISOString(),
        createdAt: entity.createdAt.toISOString(),
      };
    },
    toPersistence(user: UserEntity): UserModel {
      const record: UserModel = {
        id: user.id,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        email: user.email,
        password: user.password,
        country: user.country,
        postalCode: user.postalCode,
        street: user.street,
        role: user.role,
      };
      const validate = persistenceValidator(record);
      if (!validate) {
        throw new ArgumentInvalidException(
          JSON.stringify(persistenceValidator.errors),
          new Error('Mapper Validation error'),
          record,
        );
      }
      return record;
    },
  };
}
