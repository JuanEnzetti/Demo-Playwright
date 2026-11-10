import { type Locator, type Page } from '@playwright/test';
import { type Product } from '../data/products';
import { BasePage } from './BasePage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  readonly path = '/inventory.html';
  readonly url = /\/inventory\.html$/;
  readonly title: Locator;
  /** Kept for backwards compatibility; same as header.cartBadge. */
  readonly cartBadge: Locator;
  readonly items: Locator;
  readonly sortSelect: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.cartBadge = this.header.cartBadge;
    this.items = page.getByTestId('inventory-item');
    this.sortSelect = page.getByTestId('product-sort-container');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  item(product: Product): Locator {
    return this.items.filter({ has: this.page.getByTestId(`item-${product.id}-title-link`) });
  }

  itemPrice(product: Product): Locator {
    return this.item(product).getByTestId('inventory-item-price');
  }

  itemDescription(product: Product): Locator {
    return this.item(product).getByTestId('inventory-item-desc');
  }

  titleLink(product: Product): Locator {
    return this.page.getByTestId(`item-${product.id}-title-link`);
  }

  imageLink(product: Product): Locator {
    return this.page.getByTestId(`item-${product.id}-img-link`);
  }

  addToCartButton(product: Product): Locator {
    return this.page.getByTestId(`add-to-cart-${product.slug}`);
  }

  removeButton(product: Product): Locator {
    return this.page.getByTestId(`remove-${product.slug}`);
  }

  async addToCart(product: Product): Promise<void> {
    await this.addToCartButton(product).click();
  }

  async removeFromCart(product: Product): Promise<void> {
    await this.removeButton(product).click();
  }

  async addProductsToCart(productList: readonly Product[]): Promise<void> {
    for (const product of productList) {
      await this.addToCart(product);
    }
  }

  async openProductByTitle(product: Product): Promise<void> {
    await this.titleLink(product).click();
  }

  async openProductByImage(product: Product): Promise<void> {
    await this.imageLink(product).click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
  }
}
