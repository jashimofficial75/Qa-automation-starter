import { test, expect } from '../../src/fixtures';
import { edgeStrings, sqlInjection, xss } from '../../src/data/security-payloads';

/**
 * Injection & input handling (OWASP A03).
 * Expected: clean 4xx / validation message. Never 2xx login, 5xx, or script execution.
 */
test.describe('Security: input validation @security', () => {
  for (const payload of sqlInjection) {
    test(`API login rejects SQL injection: ${payload}`, async ({ api }) => {
      const res = await api.post('/auth/login', { username: payload, password: payload });

      expect(res.status()).toBeGreaterThanOrEqual(400);
      expect(res.status()).toBeLessThan(500);
      expect(await res.text()).not.toMatch(/sql|syntax|stack|exception/i);
    });
  }

  for (const [name, value] of Object.entries(edgeStrings)) {
    test(`API login handles edge input without crashing: ${name}`, async ({ api }) => {
      const res = await api.post('/auth/login', { username: value, password: value });
      expect(res.status()).toBeLessThan(500);
    });
  }

  for (const payload of xss) {
    test(`UI login does not execute XSS: ${payload}`, async ({ page, loginPage }) => {
      let dialogFired = false;
      page.on('dialog', async (dialog) => {
        dialogFired = true;
        await dialog.dismiss();
      });

      await loginPage.goto();
      await loginPage.login(payload, payload);

      await expect(loginPage.error).toBeVisible();
      expect(dialogFired, 'an injected script executed').toBe(false);
      // Payload must render as text, never as live markup
      await expect(page.locator('img[src="x"], svg[onload]')).toHaveCount(0);
    });
  }
});
