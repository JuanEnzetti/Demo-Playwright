import { type Locator, type Page } from '@playwright/test';
import { type Product } from '../data/products';
import { BasePage } from './BasePage';

export class ProductDetailPage extends BasePage {
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  /** On the detail page the buttons have no product slug in their data-test. */
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    // Scoped to the detail container: during the SPA transition the inventory list can still
    // be in the DOM and its identical test ids would cause a strict mode violation.
    const details = page.locator('.inventory_details');
    this.name = details.getByTestId('inventory-item-name');
    this.description = details.getByTestId('inventory-item-desc');
    this.price = details.getByTestId('inventory-item-price');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.removeButton = page.getByTestId('remove');
    this.backButton = page.getByTestId('back-to-products');
  }

  url(product: Product): RegExp {
    return new RegExp(`/inventory-item\\.html\\?id=${product.id}$`);
  }

  async goto(product: Product): Promise<void> {
    await this.page.goto(`/inventory-item.html?id=${product.id}`);
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
  }

  async backToProducts(): Promise<void> {
    await this.backButton.click();
  }
}
