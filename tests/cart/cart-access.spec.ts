// spec: specs/add-to-cart.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../src/fixtures/test';
import { accessErrors } from '../../src/data/messages';

test.describe('Cart - access without session', () => {
  const protectedRoutes = ['/inventory.html', '/cart.html', '/inventory-item.html?id=1'];

  for (const route of protectedRoutes) {
    test(`${route} redirects to login with an error`, async ({ page, loginPage }) => {
      const path = route.split('?')[0];

      await test.step(`Open ${route} without a session`, async () => {
        await page.goto(route);
      });

      await test.step('Verify redirect to login with the access error', async () => {
        await expect(page).toHaveURL(/\/$/);
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(accessErrors.notLoggedIn(path));
      });
    });
  }
});
