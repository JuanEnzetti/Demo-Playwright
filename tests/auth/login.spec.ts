import { test, expect } from '../../src/fixtures/test';
import { users, type User } from '../../src/data/users';
import { loginErrors } from '../../src/data/messages';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user logs in successfully', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.login(users.standard);

    await expect(page).toHaveURL(inventoryPage.url);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  const invalidLogins: { scenario: string; user: User; error: string }[] = [
    {
      scenario: 'locked out user cannot log in',
      user: users.lockedOut,
      error: loginErrors.lockedOut,
    },
    {
      scenario: 'user with wrong password cannot log in',
      user: users.invalidPassword,
      error: loginErrors.invalidCredentials,
    },
  ];

  for (const { scenario, user, error } of invalidLogins) {
    test(scenario, async ({ page, loginPage }) => {
      await loginPage.login(user);

      await expect(loginPage.errorMessage).toHaveText(error);
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  }
});
