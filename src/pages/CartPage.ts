import { type Locator, type Page } from '@playwright/test';
import { type Product } from '../data/products';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly path = '/cart.html';
  readonly url = /\/cart\.html$/;
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('cart-list').getByTestId('inventory-item');
    this.itemNames = this.items.getByTestId('inventory-item-name');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  item(product: Product): Locator {
    return this.items.filter({ has: this.page.getByTestId(`item-${product.id}-title-link`) });
  }

  itemQuantity(product: Product): Locator {
    return this.item(product).getByTestId('item-quantity');
  }

  itemPrice(product: Product): Locator {
    return this.item(product).getByTestId('inventory-item-price');
  }

  itemDescription(product: Product): Locator {
    return this.item(product).getByTestId('inventory-item-desc');
  }

  removeButton(product: Product): Locator {
    return this.page.getByTestId(`remove-${product.slug}`);
  }

  async removeFromCart(product: Product): Promise<void> {
    await this.removeButton(product).click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

}
