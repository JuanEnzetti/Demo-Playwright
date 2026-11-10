// spec: specs/add-to-cart.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../src/fixtures/test';
import { allProducts, products } from '../../src/data/products';
import { expectCartToContain, expectInventoryButtons } from '../../src/assertions/cartAssertions';

test.describe('Cart - product detail', () => {
  test('add from the detail page syncs with the inventory', async ({
    page,
    loggedIn: inventoryPage,
    productDetailPage,
  }) => {
    const product = products.boltTShirt;

    await test.step('Open the product by its title', async () => {
      await inventoryPage.openProductByTitle(product);
      await expect(page).toHaveURL(productDetailPage.url(product));
      await expect(productDetailPage.name).toHaveText(product.name);
      await expect(productDetailPage.price).toHaveText(product.price);
      await expect(productDetailPage.addToCartButton).toBeVisible();
      await expectCartToContain(page, productDetailPage.header, []);
    });

    await test.step('Add the product from the detail page', async () => {
      await productDetailPage.addToCart();
      await expect(productDetailPage.removeButton).toHaveText('Remove');
      await expectCartToContain(page, productDetailPage.header, [product]);
    });

    await test.step('Go back and verify the inventory is in sync', async () => {
      await productDetailPage.backToProducts();
      await expect(page).toHaveURL(inventoryPage.url);
      await expectInventoryButtons(inventoryPage, allProducts, [product]);
      await expectCartToContain(page, inventoryPage.header, [product]);
    });
  });

  test('remove from the detail page a product added in the inventory', async ({
    page,
    loggedIn: inventoryPage,
    productDetailPage,
  }) => {
    const product = products.onesie;

    await test.step('Add the product in the inventory and open it by its image', async () => {
      await inventoryPage.addToCart(product);
      await inventoryPage.openProductByImage(product);
      await expect(page).toHaveURL(productDetailPage.url(product));
    });

    await test.step('Verify the detail page shows Remove', async () => {
      await expect(productDetailPage.removeButton).toHaveText('Remove');
      await expectCartToContain(page, productDetailPage.header, [product]);
    });

    await test.step('Remove from the detail page and go back', async () => {
      await productDetailPage.removeFromCart();
      await productDetailPage.backToProducts();
    });

    await test.step('Verify the cart is empty in the inventory', async () => {
      await expect(page).toHaveURL(inventoryPage.url);
      await expectInventoryButtons(inventoryPage, allProducts, []);
      await expectCartToContain(page, inventoryPage.header, []);
    });
  });
});
