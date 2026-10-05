import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  { ignores: ['node_modules', 'playwright-report', 'test-results', 'blob-report', 'playwright/.auth'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Enforce the QA rules in code review, automatically
      'playwright/no-wait-for-timeout': 'error', // no fixed sleeps
      'playwright/no-focused-test': 'error', // no stray test.only
      'playwright/no-skipped-test': 'warn', // skipped = tracked debt
      'playwright/no-force-option': 'warn', // force:true hides real UI bugs
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-conditional-in-test': 'off', // data-driven loops are allowed
      'playwright/expect-expect': 'error', // every test must assert
    },
  },
);
