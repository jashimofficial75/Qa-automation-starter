import { test, expect } from '../../src/fixtures';

const ITEM = 'Sauce Labs Backpack';

// Starts authenticated via storageState from tests/setup/auth.setup.ts
test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('adding an item updates the cart badge @smoke', async ({ inventoryPage }) => {
    await expect(inventoryPage.cartBadge).toBeHidden();

    await inventoryPage.addToCart(ITEM);

    // Web-first assertion: retries until true — no sleeps
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('removing the item clears the cart badge', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(ITEM);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.removeFromCart(ITEM);

    await expect(inventoryPage.cartBadge).toBeHidden();
    await expect(inventoryPage.item(ITEM).getByRole('button', { name: 'Add to cart' })).toBeVisible();
  });
});
