import { test as base, expect } from '@playwright/test';
import { users, type User } from '../data/users';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';

type Options = {
  /** User for the `loggedIn` fixture. Override per file/describe with test.use({ user }). */
  user: User;
};

type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  /** Logs in as `user` and leaves the browser on the inventory page with an empty cart. */
  loggedIn: InventoryPage;
};

export const test = base.extend<Options & Pages>({
  user: [users.standard, { option: true }],
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  loggedIn: async ({ page, user, loginPage, inventoryPage }, use) => {
    await loginPage.goto();
    await loginPage.login(user);
    await expect(page).toHaveURL(inventoryPage.url);
    await expect(inventoryPage.title).toHaveText('Products');
    await use(inventoryPage);
  },
});

export { expect };
