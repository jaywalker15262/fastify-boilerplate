import { registerHandler } from './register.handler';
import { createUserCommand } from '@/modules/user/commands/create-user/create-user.handler';
import assert from 'node:assert/strict';
import { test } from 'node:test';

test('registerHandler should create a user and return an ID', async () => {
  const mockCommandBus = {
    execute: async (cmd: any) => {
      assert.deepEqual(cmd, createUserCommand(payload));
      return 'mock-user-id';
    },
  };

  const fastify = { commandBus: mockCommandBus } as any;

  const payload = {
    email: 'test@example.com',
    password: 'securePassword123',
    country: 'France',
    postalCode: '75000',
    street: 'Rue de Test',
  };

  const result = await registerHandler(fastify, payload);
  assert.deepEqual(result, { id: 'mock-user-id' });
});
