import type { Page } from '@playwright/test';

/**
 * Base for all page objects.
 * Rules: page objects hold locators + actions. Assertions stay in the tests.
 */
export abstract class BasePage {
  /** Path relative to baseURL, e.g. '/inventory.html' */
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }
}
