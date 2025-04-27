// src/modules/auth/register/register.schema.ts
import { createUserRequestDtoSchema } from '@/modules/user/commands/create-user/create-user.schema';
import { Static, Type } from '@sinclair/typebox';

export const registerRequestSchema = Type.Intersect([
  createUserRequestDtoSchema,
  Type.Object({
    recaptchaToken: Type.String({
      description: 'reCAPTCHA v3 token from client',
      minLength: 1,
      example: '03AGdBq25…',
    }),
  }),
] as const);

export type RegisterRequest = Static<typeof registerRequestSchema>;
