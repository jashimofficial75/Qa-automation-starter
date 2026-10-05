import { test, expect } from '../../src/fixtures';
import { isDemoApi } from '../../src/config/env';

const base64url = (obj: object): string => Buffer.from(JSON.stringify(obj)).toString('base64url');

/**
 * Broken authentication checks (OWASP API2).
 * A protected endpoint must answer 401/403 for anything but a valid token —
 * never 2xx, and never 5xx (a crash on bad input is a bug and often a leak).
 */
test.describe('Security: API authentication @security', () => {
  const PROTECTED = '/auth/me';

  test('request without a token is rejected with 401', async ({ api }) => {
    const res = await api.get(PROTECTED);
    expect(res.status()).toBe(401);
  });

  test('tampered token signature is rejected with 401/403', async ({ api, apiToken }) => {
    test.fail(isDemoApi, 'Known demo-API bug: returns 500 instead of 401 for a bad signature');

    const [header, payload] = apiToken.split('.');
    const res = await api.withToken(`${header}.${payload}.tampered-signature`).get(PROTECTED);

    expect([401, 403]).toContain(res.status());
  });

  test('"alg: none" unsigned token is rejected with 401/403', async ({ api, apiToken }) => {
    test.fail(isDemoApi, 'Known demo-API bug: returns 500 instead of 401 for alg:none');

    const payload = apiToken.split('.')[1];
    const unsigned = `${base64url({ alg: 'none', typ: 'JWT' })}.${payload}.`;
    const res = await api.withToken(unsigned).get(PROTECTED);

    expect([401, 403]).toContain(res.status());
  });

  test('forged payload (privilege change) is rejected', async ({ api, apiToken }) => {
    const [header, , signature] = apiToken.split('.');
    const forged = `${header}.${base64url({ id: 1, role: 'admin' })}.${signature}`;
    const res = await api.withToken(forged).get(PROTECTED);

    expect(res.ok()).toBe(false);
  });

  test('profile response never exposes the password', async ({ authedApi }) => {
    test.fail(isDemoApi, 'Known demo-API finding: /auth/me returns the plain-text password');

    const body = await (await authedApi.get(PROTECTED)).json();

    expect(body).not.toHaveProperty('password');
  });
});
