import { type Page } from '@playwright/test';
import { Header } from '../components/Header';

/** Base for pages shown after login: they all share the header and side menu. */
export abstract class BasePage {
  readonly header: Header;

  constructor(protected readonly page: Page) {
    this.header = new Header(page);
  }
}
