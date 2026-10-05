import { test, expect } from '../../src/fixtures';
import { forbiddenHeaders, requiredSecurityHeaders } from '../../src/data/security-payloads';

/**
 * Security-header baseline (OWASP Secure Headers).
 * Add your web app's main pages here once its server sets these headers.
 */
test.describe('Security: response headers @security', () => {
  const endpoints = ['/products', '/auth/me'];

  for (const path of endpoints) {
    test(`API ${path} sends required security headers`, async ({ api }) => {
      const headers = (await api.get(path)).headers();

      for (const name of requiredSecurityHeaders) {
        expect.soft(headers, `missing header: ${name}`).toHaveProperty(name);
      }
      expect.soft(headers['x-content-type-options']).toBe('nosniff');
    });

    test(`API ${path} does not leak server technology`, async ({ api }) => {
      const headers = (await api.get(path)).headers();

      for (const name of forbiddenHeaders) {
        expect.soft(headers, `should not expose: ${name}`).not.toHaveProperty(name);
      }
    });
  }
});
