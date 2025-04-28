import { makeRegisterHandler } from './register.handler';
import { createUserCommand } from '@/modules/user/commands/create-user/create-user.handler';
import assert from 'node:assert/strict';
import { test } from 'node:test';

(globalThis as any).fetch = async () => ({
  json: async () => ({ success: true, score: 0.9 }),
});

const mockSql = async (..._: any[]) => {
  return [];
};

test('registerHandler should create a user and return an ID', async () => {
  const mockResend = {
    emails: {
      send: async () => ({ id: 'fake-email-id' }),
    },
  };

  const registerHandler = makeRegisterHandler({
    sql: mockSql,
    resend: mockResend,
  });

  const payload = {
    email: 'test@example.com',
    password: 'securePassword123',
    /*country: 'France',
    postalCode: '75000',
    street: 'Rue de Test',*/
    recaptchaToken: 'dummy-token',
  };

  const mockCommandBus = {
    execute: async (cmd: any) => {
      // ensure we strip recaptchaToken before passing to createUserCommand
      assert.deepEqual(
        cmd,
        createUserCommand({
          email: payload.email,
          password: payload.password,
          /*country: payload.country,
          postalCode: payload.postalCode,
          street: payload.street,*/
        }),
      );
      return 'mock-user-id';
    },
  };

  const fastify = { commandBus: mockCommandBus } as any;

  const result = await registerHandler(fastify, payload);
  assert.deepEqual(result, { id: 'mock-user-id' });
});
