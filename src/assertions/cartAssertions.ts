import { expect, type Page } from '@playwright/test';
import { type Header } from '../components/Header';
import { type Product } from '../data/products';
import { type InventoryPage } from '../pages/InventoryPage';
import { getCartContents } from '../utils/cartStorage';

/**
 * Checks the cart state as the user sees it (badge + cart link label) and as the
 * site stores it (localStorage ids, in insertion order).
 */
export async function expectCartToContain(
  page: Page,
  header: Header,
  expected: readonly Product[],
): Promise<void> {
  if (expected.length === 0) {
    await expect(header.cartBadge).toBeHidden();
    await expect(header.cartLink).toHaveAttribute('aria-label', 'Cart, empty');
  } else {
    await expect(header.cartBadge).toHaveText(String(expected.length));
    await expect(header.cartLink).toHaveAttribute('aria-label', `Cart, ${expected.length} items`);
  }
  await expect.poll(() => getCartContents(page)).toEqual(expected.map((p) => p.id));
}

/** Checks every inventory card shows "Remove" if it is in the cart and "Add to cart" otherwise. */
export async function expectInventoryButtons(
  inventoryPage: InventoryPage,
  allProducts: readonly Product[],
  inCart: readonly Product[],
): Promise<void> {
  const inCartIds = new Set(inCart.map((p) => p.id));
  for (const product of allProducts) {
    if (inCartIds.has(product.id)) {
      await expect(inventoryPage.removeButton(product)).toHaveText('Remove');
      await expect(inventoryPage.addToCartButton(product)).toBeHidden();
    } else {
      await expect(inventoryPage.addToCartButton(product)).toHaveText('Add to cart');
      await expect(inventoryPage.removeButton(product)).toBeHidden();
    }
  }
}
