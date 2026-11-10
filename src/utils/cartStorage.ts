import { type Page } from '@playwright/test';

const CART_STORAGE_KEY = 'cart-contents';

/** Product ids stored by the site in localStorage, in insertion order. */
export async function getCartContents(page: Page): Promise<number[]> {
  const raw = await page.evaluate((key) => window.localStorage.getItem(key), CART_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as number[]) : [];
}
