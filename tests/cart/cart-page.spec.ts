// spec: specs/add-to-cart.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../src/fixtures/test';
import { allProducts, products } from '../../src/data/products';
import { expectCartToContain, expectInventoryButtons } from '../../src/assertions/cartAssertions';

test.describe('Cart - cart page', () => {
  test('cart lines match the inventory data', async ({
    page,
    loggedIn: inventoryPage,
    cartPage,
  }) => {
    const selected = [products.backpack, products.fleeceJacket, products.onesie];

    const descriptions: string[] = [];
    await test.step('Read descriptions from the inventory', async () => {
      for (const product of selected) {
        descriptions.push((await inventoryPage.itemDescription(product).textContent()) ?? '');
      }
    });

    await test.step('Add the products and open the cart', async () => {
      await inventoryPage.addProductsToCart(selected);
      await inventoryPage.header.openCart();
      await expect(page).toHaveURL(cartPage.url);
      await expect(cartPage.title).toHaveText('Your Cart');
    });

    await test.step('Verify lines are in insertion order', async () => {
      await expect(cartPage.itemNames).toHaveText(selected.map((p) => p.name));
    });

    await test.step('Verify quantity, description and price of each line', async () => {
      for (const [index, product] of selected.entries()) {
        await expect(cartPage.itemQuantity(product)).toHaveText('1');
        await expect(cartPage.itemDescription(product)).toHaveText(descriptions[index]);
        await expect(cartPage.itemPrice(product)).toHaveText(product.price);
        await expect(cartPage.removeButton(product)).toHaveText('Remove');
      }
    });

    await test.step('Verify navigation buttons are visible', async () => {
      await expect(cartPage.continueShoppingButton).toBeVisible();
      await expect(cartPage.checkoutButton).toBeVisible();
    });
  });

  test('remove a product from the cart and continue shopping', async ({
    page,
    loggedIn: inventoryPage,
    cartPage,
  }) => {
    const removed = products.bikeLight;
    const remaining = allProducts.filter((p) => p !== removed);

    await test.step('Add all products and open the cart', async () => {
      await inventoryPage.addProductsToCart(allProducts);
      await inventoryPage.header.openCart();
      await expect(page).toHaveURL(cartPage.url);
    });

    await test.step(`Remove "${removed.name}" from the cart`, async () => {
      await cartPage.removeFromCart(removed);
      await expect(cartPage.items).toHaveCount(5);
      await expect(cartPage.item(removed)).toHaveCount(0);
      await expectCartToContain(page, cartPage.header, remaining);
    });

    await test.step('Continue shopping and verify the inventory is in sync', async () => {
      await cartPage.continueShopping();
      await expect(page).toHaveURL(inventoryPage.url);
      await expectInventoryButtons(inventoryPage, allProducts, remaining);
      await expectCartToContain(page, inventoryPage.header, remaining);
    });
  });
});
