export interface Product {
  /** Id used by the site in URLs and links, e.g. inventory-item.html?id=<id>, item-<id>-title-link */
  id: number;
  name: string;
  /** Slug used by the site in data-test ids, e.g. add-to-cart-<slug> */
  slug: string;
  price: string;
}

export const products = {
  backpack: {
    id: 4,
    name: 'Sauce Labs Backpack',
    slug: 'sauce-labs-backpack',
    price: '$29.99',
  },
  bikeLight: {
    id: 0,
    name: 'Sauce Labs Bike Light',
    slug: 'sauce-labs-bike-light',
    price: '$9.99',
  },
  boltTShirt: {
    id: 1,
    name: 'Sauce Labs Bolt T-Shirt',
    slug: 'sauce-labs-bolt-t-shirt',
    price: '$15.99',
  },
  fleeceJacket: {
    id: 5,
    name: 'Sauce Labs Fleece Jacket',
    slug: 'sauce-labs-fleece-jacket',
    price: '$49.99',
  },
  onesie: {
    id: 2,
    name: 'Sauce Labs Onesie',
    slug: 'sauce-labs-onesie',
    price: '$7.99',
  },
  redTShirt: {
    id: 3,
    name: 'Test.allTheThings() T-Shirt (Red)',
    slug: 'test.allthethings()-t-shirt-(red)',
    price: '$15.99',
  },
} satisfies Record<string, Product>;

/** All products in the inventory's default order (Name A to Z). */
export const allProducts: readonly Product[] = [
  products.backpack,
  products.bikeLight,
  products.boltTShirt,
  products.fleeceJacket,
  products.onesie,
  products.redTShirt,
];
