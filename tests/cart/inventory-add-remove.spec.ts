// spec: specs/add-to-cart.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../src/fixtures/test';
import { allProducts } from '../../src/data/products';
import { expectCartToContain, expectInventoryButtons } from '../../src/assertions/cartAssertions';

test.describe('Cart - inventory', () => {
  for (const product of allProducts) {
    test(`add "${product.name}" individually`, async ({ page, loggedIn: inventoryPage }) => {
      await test.step('Add the product to the cart', async () => {
        await expectCartToContain(page, inventoryPage.header, []);
        await inventoryPage.addToCart(product);
      });

      await test.step('Verify only this product is in the cart', async () => {
        await expectInventoryButtons(inventoryPage, allProducts, [product]);
        await expectCartToContain(page, inventoryPage.header, [product]);
      });

      await test.step('Verify the price on the card is unchanged', async () => {
        await expect(inventoryPage.itemPrice(product)).toHaveText(product.price);
      });
    });
  }

  test('add all products with an incremental badge', async ({ page, loggedIn: inventoryPage }) => {
    // Insertion order in default A-Z order gives storage [4,0,1,5,2,3]
    const added: (typeof allProducts)[number][] = [];

    for (const product of allProducts) {
      await test.step(`Add "${product.name}"`, async () => {
        await inventoryPage.addToCart(product);
        added.push(product);
        await expectCartToContain(page, inventoryPage.header, added);
      });
    }

    await test.step('Verify all buttons show Remove', async () => {
      await expectInventoryButtons(inventoryPage, allProducts, allProducts);
    });
  });

  test('remove all products from the inventory one by one', async ({
    page,
    loggedIn: inventoryPage,
  }) => {
    await test.step('Add all products', async () => {
      await inventoryPage.addProductsToCart(allProducts);
      await expectCartToContain(page, inventoryPage.header, allProducts);
    });

    for (const [i, product] of allProducts.entries()) {
      await test.step(`Remove "${product.name}"`, async () => {
        await inventoryPage.removeFromCart(product);
        await expectCartToContain(page, inventoryPage.header, allProducts.slice(i + 1));
      });
    }

    await test.step('Verify all buttons are back to Add to cart', async () => {
      await expectInventoryButtons(inventoryPage, allProducts, []);
    });
  });
});
