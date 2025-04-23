import userDomain from './user.domain';
import { UserRoles } from './user.types';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

describe('userDomain()', () => {
  it('should return a new user entity', async () => {
    const user = await userDomain().createUser({
      email: 'test@test.it',
      password: 'securepassword123',
      country: 'Italy',
      postalCode: '12345',
      street: 'Via Roma',
    });

    assert.equal(user.role, UserRoles.guest);
    assert.strictEqual(user.isVerified, false);
    assert.ok(user.password); // ensure password is hashed
    assert.notEqual(user.password, 'securepassword123'); // should be hashed, not raw
  });
});
