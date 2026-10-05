import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

const AUTH_FILE = 'playwright/.auth/user.json';
const isCI = env.CI;

/**
 * One config, four lanes:
 *   setup        -> logs in once, saves storage state (no login in every test)
 *   e2e-*        -> browser tests, reuse the saved session
 *   api          -> no browser, Playwright APIRequestContext only (fast)
 *   security     -> auth, headers and input-validation checks (API + UI)
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: isCI, // a stray test.only fails the CI build
  retries: isCI ? 2 : 0, // retries surface flakiness in the report; they never hide it locally
  workers: isCI ? '50%' : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: isCI ? [['blob'], ['github'], ['list']] : [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: env.BASE_URL,
    testIdAttribute: env.TEST_ID_ATTRIBUTE,
    // Deterministic environment: same locale/timezone on every machine
    locale: 'en-US',
    timezoneId: 'UTC',
    // Debuggable failures without re-running locally
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'e2e-chromium',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    ...(env.CROSS_BROWSER
      ? [
          {
            name: 'e2e-firefox',
            testDir: './tests/e2e',
            use: { ...devices['Desktop Firefox'], storageState: AUTH_FILE },
            dependencies: ['setup'],
          },
          {
            name: 'e2e-webkit',
            testDir: './tests/e2e',
            use: { ...devices['Desktop Safari'], storageState: AUTH_FILE },
            dependencies: ['setup'],
          },
        ]
      : []),
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: env.API_URL, extraHTTPHeaders: { Accept: 'application/json' } },
    },
    {
      name: 'security',
      testDir: './tests/security',
      use: { ...devices['Desktop Chrome'], baseURL: env.BASE_URL },
    },
  ],
});
