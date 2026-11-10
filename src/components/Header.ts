import { type Locator, type Page } from '@playwright/test';
import { SideMenu } from './SideMenu';

/** Primary header shared by every authenticated page: cart link, badge and side menu. */
export class Header {
  readonly cartLink: Locator;
  /** Not rendered at all when the cart is empty. */
  readonly cartBadge: Locator;
  readonly menu: SideMenu;

  constructor(page: Page) {
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.menu = new SideMenu(page);
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
