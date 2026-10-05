import { test as base, expect } from '@playwright/test';
import { ApiClient } from '../api/ApiClient';
import { env } from '../config/env';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';

type TestFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  /** Unauthenticated API client */
  api: ApiClient;
  /** API client already carrying a valid bearer token */
  authedApi: ApiClient;
};

type WorkerFixtures = {
  /** One login per worker, not per test — fast and avoids rate limits */
  apiToken: string;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  apiToken: [
    async ({ playwright }, use) => {
      const ctx = await playwright.request.newContext({ baseURL: env.API_URL });
      const { accessToken } = await new ApiClient(ctx).login(env.API_USERNAME, env.API_PASSWORD);
      await use(accessToken);
      await ctx.dispose();
    },
    { scope: 'worker' },
  ],

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),

  api: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({ baseURL: env.API_URL });
    await use(new ApiClient(ctx));
    await ctx.dispose();
  },

  authedApi: async ({ playwright, apiToken }, use) => {
    const ctx = await playwright.request.newContext({ baseURL: env.API_URL });
    await use(new ApiClient(ctx).withToken(apiToken));
    await ctx.dispose();
  },
});

export { expect };
