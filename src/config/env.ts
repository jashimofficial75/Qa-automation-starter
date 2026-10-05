import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

/**
 * Environment loading:
 *   TEST_ENV=staging npx playwright test  -> loads .env.staging, then .env
 * Real shell / CI variables always win over files.
 *
 * Defaults point at public demo apps (saucedemo.com + dummyjson.com) so the
 * starter runs out of the box. For a real project set every value in .env or
 * CI secrets — never commit real credentials.
 */
const testEnv = process.env.TEST_ENV;
if (testEnv) dotenv.config({ path: path.resolve(process.cwd(), `.env.${testEnv}`), quiet: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true });

const bool = z
  .string()
  .optional()
  .transform((v) => v === 'true' || v === '1');

const EnvSchema = z.object({
  BASE_URL: z.url().default('https://www.saucedemo.com'),
  API_URL: z.url().default('https://dummyjson.com'),
  TEST_ID_ATTRIBUTE: z.string().default('data-test'),

  UI_USERNAME: z.string().min(1).default('standard_user'),
  UI_PASSWORD: z.string().min(1).default('secret_sauce'),

  API_USERNAME: z.string().min(1).default('emilys'),
  API_PASSWORD: z.string().min(1).default('emilyspass'),

  CI: bool,
  CROSS_BROWSER: bool,
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // Fail fast with a readable message instead of 50 confusing test failures
  console.error('Invalid test environment configuration:\n' + z.prettifyError(parsed.error));
  throw new Error('Invalid environment variables — check your .env file');
}

export const env = parsed.data;

/** True when running against the bundled demo API (used to flag its known bugs). */
export const isDemoApi = new URL(env.API_URL).hostname === 'dummyjson.com';
