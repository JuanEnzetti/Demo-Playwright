import { test, expect } from '../../src/fixtures/test';
import { users } from '../../src/data/users';
import { products } from '../../src/data/products';
import { CartPage } from '../../src/pages/CartPage';

test.describe('Cart', () => {
  test('standard user can log in and add a t-shirt to the cart', async ({
    page,
    loginPage,
    inventoryPage,
  }) => {
    const tShirt = products.boltTShirt;

    await test.step('Log in as standard user', async () => {
      await loginPage.goto();
      await loginPage.login(users.standard);
      await expect(page).toHaveURL(inventoryPage.url);
      await expect(inventoryPage.title).toHaveText('Products');
      await expect(await CartPage.isTrue()).toBe(true);  
    });

    await test.step(`Add "${tShirt.name}" to the cart`, async () => {
      await expect(inventoryPage.cartBadge).toBeHidden();
      await inventoryPage.addToCart(tShirt);
    });

    await test.step('Verify the cart contains the t-shirt', async () => {
      await expect(inventoryPage.cartBadge).toHaveText('1');
      await expect(inventoryPage.removeButton(tShirt)).toBeVisible();
      await expect(inventoryPage.addToCartButton(tShirt)).toBeHidden();
    });
  });
});
