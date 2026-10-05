import { test, expect } from '../../src/fixtures';
import { ApiClient } from '../../src/api/ApiClient';
import { ErrorSchema, LoginResponseSchema } from '../../src/api/schemas';
import { env } from '../../src/config/env';

test.describe('Auth API', () => {
  test('valid credentials return a JWT and the user @smoke', async ({ api }) => {
    const res = await api.post('/auth/login', {
      username: env.API_USERNAME,
      password: env.API_PASSWORD,
    });

    expect(res.status()).toBe(200);
    const body = await ApiClient.parse(res, LoginResponseSchema);
    expect(body.username).toBe(env.API_USERNAME);
  });

  test('wrong password is rejected with 400', async ({ api }) => {
    const res = await api.post('/auth/login', { username: env.API_USERNAME, password: 'wrong' });

    expect(res.status()).toBe(400);
    const err = await ApiClient.parse(res, ErrorSchema);
    expect(err.message).toBe('Invalid credentials');
  });

  test('missing fields are rejected with a validation message', async ({ api }) => {
    const res = await api.post('/auth/login', {});

    expect(res.status()).toBe(400);
    const err = await ApiClient.parse(res, ErrorSchema);
    expect(err.message).toContain('required');
  });

  test('a valid token returns the current user', async ({ authedApi }) => {
    const res = await authedApi.get('/auth/me');

    expect(res.status()).toBe(200);
    expect((await res.json()).username).toBe(env.API_USERNAME);
  });
});
