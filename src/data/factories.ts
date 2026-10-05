import { randomUUID } from 'node:crypto';

/**
 * Test data factories. Every test builds its own data (no shared fixtures
 * that another test can mutate). Override only what the test cares about.
 */
export const uniqueId = (prefix = 'qa'): string => `${prefix}-${randomUUID().slice(0, 8)}`;

export type NewProduct = { title: string; price: number; category: string };

export const buildProduct = (overrides: Partial<NewProduct> = {}): NewProduct => ({
  title: uniqueId('product'),
  price: 49.99,
  category: 'qa-automation',
  ...overrides,
});

/** Known users of the demo UI. Replace with your app's personas. */
export const uiUsers = {
  lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
  invalid: { username: 'not_a_user', password: 'wrong_password' },
} as const;
