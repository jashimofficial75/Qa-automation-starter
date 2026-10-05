import { test, expect } from '../../src/fixtures';
import { env } from '../../src/config/env';
import { uiUsers } from '../../src/data/factories';

// Login tests must start logged out
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('valid user lands on the product list @smoke', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.login(env.UI_USERNAME, env.UI_PASSWORD);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('wrong credentials show an error and stay on login', async ({ page, loginPage }) => {
    await loginPage.login(uiUsers.invalid.username, uiUsers.invalid.password);

    await expect(loginPage.error).toContainText('Username and password do not match');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('locked-out user is blocked with a clear message', async ({ loginPage }) => {
    await loginPage.login(uiUsers.lockedOut.username, uiUsers.lockedOut.password);

    await expect(loginPage.error).toContainText('this user has been locked out');
  });

  // Data-driven: one behaviour, several inputs, one readable test each
  const requiredFieldCases = [
    { name: 'empty username', username: '', password: 'secret', message: 'Username is required' },
    { name: 'empty password', username: 'user', password: '', message: 'Password is required' },
  ];

  for (const c of requiredFieldCases) {
    test(`validation: ${c.name}`, async ({ loginPage }) => {
      await loginPage.login(c.username, c.password);
      await expect(loginPage.error).toContainText(c.message);
    });
  }
});
