import { type Locator, type Page } from '@playwright/test';

/** Burger side menu shared by every authenticated page. */
export class SideMenu {
  readonly openButton: Locator;
  readonly allItemsLink: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;

  constructor(page: Page) {
    this.openButton = page.getByRole('button', { name: 'Open Menu' });
    this.allItemsLink = page.getByTestId('inventory-sidebar-link');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.resetAppStateLink = page.getByTestId('reset-sidebar-link');
  }

  private async select(link: Locator): Promise<void> {
    await this.openButton.click();
    await link.click();
  }

  async goToAllItems(): Promise<void> {
    await this.select(this.allItemsLink);
  }

  async logout(): Promise<void> {
    await this.select(this.logoutLink);
  }

  async resetAppState(): Promise<void> {
    await this.select(this.resetAppStateLink);
  }
}
