import { test as setup, expect } from '../../src/fixtures';
import { env } from '../../src/config/env';

const AUTH_FILE = 'playwright/.auth/user.json';

/**
 * Logs in through the UI once and saves cookies/localStorage.
 * Every e2e test starts already authenticated — faster and less flaky.
 * Tip: if your app has a login API, log in via `request` here instead of the UI.
 */
setup('authenticate UI user', async ({ page, loginPage, inventoryPage }) => {
  await loginPage.goto();
  await loginPage.login(env.UI_USERNAME, env.UI_PASSWORD);
  await expect(inventoryPage.title).toHaveText('Products');
  await page.context().storageState({ path: AUTH_FILE });
});
