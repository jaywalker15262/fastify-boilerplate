// src/modules/auth/login/login.schema.ts
import { Type, Static } from '@sinclair/typebox';

export const loginSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 }),
});

export const loginResponseSchema = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.String(),
  expiresIn: Type.Number(),
});

export type LoginSchema = Static<typeof loginSchema>;
