// spec: specs/add-to-cart.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../src/fixtures/test';
import { allProducts, products } from '../../src/data/products';
import { expectCartToContain, expectInventoryButtons } from '../../src/assertions/cartAssertions';

test.describe('Cart - persistence', () => {
  test('Add/Remove state follows the product when the sort order changes', async ({
    page,
    loggedIn: inventoryPage,
  }) => {
    const product = products.onesie;

    await test.step('Sort by price (low to high) and add the Onesie', async () => {
      await inventoryPage.sortBy('lohi');
      await expect(inventoryPage.items.first()).toContainText(product.name);
      await inventoryPage.addToCart(product);
      await expectCartToContain(page, inventoryPage.header, [product]);
    });

    await test.step('Sort by name (Z to A) and verify the state follows the product', async () => {
      await inventoryPage.sortBy('za');
      await expect(inventoryPage.items.nth(1)).toContainText(product.name);
      await expect(inventoryPage.removeButton(product)).toHaveText('Remove');
      await expectInventoryButtons(inventoryPage, allProducts, [product]);
      await expectCartToContain(page, inventoryPage.header, [product]);
    });
  });

  test('cart persists across reload and navigation', async ({
    page,
    loggedIn: inventoryPage,
    cartPage,
  }) => {
    const cart = [products.backpack, products.onesie];

    await test.step('Add two products', async () => {
      await inventoryPage.addProductsToCart(cart);
      await expectCartToContain(page, inventoryPage.header, cart);
    });

    await test.step('Reload the inventory', async () => {
      await page.reload();
      await expectInventoryButtons(inventoryPage, allProducts, cart);
      await expectCartToContain(page, inventoryPage.header, cart);
    });

    await test.step('Open the cart by URL', async () => {
      await cartPage.goto();
      await expect(cartPage.itemNames).toHaveText(cart.map((p) => p.name));
      await expectCartToContain(page, cartPage.header, cart);
    });

    await test.step('Return to the inventory by URL', async () => {
      await inventoryPage.goto();
      await expectInventoryButtons(inventoryPage, allProducts, cart);
      await expectCartToContain(page, inventoryPage.header, cart);
    });
  });

  test('Reset App State empties the cart', async ({ page, loggedIn: inventoryPage }) => {
    const cart = [products.backpack, products.bikeLight, products.boltTShirt];

    await test.step('Add products', async () => {
      await inventoryPage.addProductsToCart(cart);
      await expectCartToContain(page, inventoryPage.header, cart);
    });

    await test.step('Reset the app state', async () => {
      await inventoryPage.header.menu.resetAppState();
      await expect(page).toHaveURL(inventoryPage.url);
      await expectCartToContain(page, inventoryPage.header, []);
    });

    await test.step('Reload and verify all buttons are Add to cart', async () => {
      await page.reload();
      await expectInventoryButtons(inventoryPage, allProducts, []);
      await expectCartToContain(page, inventoryPage.header, []);
    });
  });

  test('Reset App State resets inventory buttons without reloading', async ({
    loggedIn: inventoryPage,
  }) => {
    // KNOWN DEFECT D1: after Reset App State the cart is empty (badge, localStorage) but the
    // inventory buttons keep showing "Remove" until the page is reloaded.
    test.fail();

    const cart = [products.backpack, products.bikeLight, products.boltTShirt];

    await inventoryPage.addProductsToCart(cart);
    await inventoryPage.header.menu.resetAppState();

    await expectInventoryButtons(inventoryPage, allProducts, []);
  });
});
