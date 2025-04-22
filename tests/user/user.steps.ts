import { ICustomWorld } from '../support/custom-world';
import { UserModel } from '@/modules/user/database/user.repository';
import { Paginated } from '@/shared/db/repository.port';
import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert';

Before({ tags: '@user' }, async function (this: ICustomWorld) {
  await this.db`TRUNCATE "users"`;
});

Given(/^user profile data$/, function (this: ICustomWorld, table) {
  this.context.createUserDto = table.hashes()[0];
});

When('I send a request to create a user', async function (this: ICustomWorld) {
  this.context.latestResponse = await this.server.inject({
    method: 'POST',
    url: '/v1/users',
    body: this.context.createUserDto,
  });
});

Then('I receive my user ID', function (this: ICustomWorld) {
  assert.deepStrictEqual(
    typeof this.context.latestResponse.json().id,
    'string',
  );
});

Then(
  'I can see my user in a list of all users',
  async function (this: ICustomWorld) {
    const response = await this.server.inject({
      method: 'GET',
      url: '/v1/users',
    });
    const users = response.json<Paginated<UserModel>>();
    assert.strictEqual(
      users.data.some(
        (item) => item.id === this.context.latestResponse.json().id,
      ),
      true,
    );
  },
);

Then('I send a request to delete my user', async function (this: ICustomWorld) {
  const response = await this.server.inject({
    method: 'DELETE',
    url: `/v1/users/${this.context.latestResponse.json().id}`,
  });
  assert.strictEqual(response.statusCode, 204);
});

Then(
  'I cannot see my user in a list of all users',
  async function (this: ICustomWorld) {
    const response = await this.server.inject({
      method: 'GET',
      url: '/v1/users',
    });
    const users = response.json<Paginated<UserModel>>();
    assert.strictEqual(
      users.data.some(
        (item) => item.id === this.context.latestResponse.json().id,
      ),
      false,
    );
  },
);
