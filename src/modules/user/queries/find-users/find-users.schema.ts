import { paginatedQueryRequestDtoSchema } from '@/shared/api/paginated-query.request.dto';
import { Type } from '@sinclair/typebox';

export const findUsersRequestDtoSchema = Type.Composite([
  paginatedQueryRequestDtoSchema,
  Type.Object({
    country: Type.Optional(
      Type.String({
        example: 'France',
        description: 'Country of residence',
        maxLength: 50,
        pattern: '/^[ A-Za-z]*$/',
      }),
    ),
    postalCode: Type.Optional(
      Type.String({
        example: '10000',
        description: 'Postal code',
        maxLength: 10,
      }),
    ),
    street: Type.Optional(
      Type.String({
        example: 'Grande Rue',
        description: 'Street',
        maxLength: 50,
        pattern: '/^[ A-Za-z]*$/',
      }),
    ),
  }),
]);
