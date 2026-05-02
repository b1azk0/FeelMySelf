const DEFAULT_API_BASE =
  import.meta.env.WOO_API_BASE ||
  'https://www.feelmyself.pl/wp-json/wc/store/v1';

export interface ProductImage {
  src: string;
  alt: string;
}

export interface ProductCategoryRef {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  shortDescription: string;
  sku: string;
  priceMinor: number;
  regularPriceMinor: number;
  currency: string;
  currencySymbol: string;
  onSale: boolean;
  inStock: boolean;
  images: ProductImage[];
  categories: ProductCategoryRef[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  image?: ProductImage;
}

interface RawWooImage {
  src?: string;
  alt?: string;
}

interface RawWooCategory {
  id: number;
  name: string;
  slug: string;
}

interface RawWooProductPrices {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
}

interface RawWooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description?: string;
  short_description?: string;
  sku?: string;
  prices: RawWooProductPrices;
  on_sale?: boolean;
  is_in_stock?: boolean;
  images?: RawWooImage[];
  categories?: RawWooCategory[];
}

interface RawWooCategoryFull {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  image?: { src?: string; alt?: string } | null;
}

export function normalizeProduct(raw: RawWooProduct): Product {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    permalink: raw.permalink,
    description: raw.description ?? '',
    shortDescription: raw.short_description ?? '',
    sku: raw.sku ?? '',
    priceMinor: parseInt(raw.prices.price, 10),
    regularPriceMinor: parseInt(raw.prices.regular_price, 10),
    currency: raw.prices.currency_code,
    currencySymbol: raw.prices.currency_symbol,
    onSale: !!raw.on_sale,
    inStock: !!raw.is_in_stock,
    images: (raw.images ?? []).map((img) => ({ src: img.src ?? '', alt: img.alt ?? '' })),
    categories: (raw.categories ?? []).map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
  };
}

function normalizeCategory(raw: RawWooCategoryFull): Category {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? '',
    count: raw.count ?? 0,
    image: raw.image?.src ? { src: raw.image.src, alt: raw.image.alt ?? '' } : undefined,
  };
}

export async function fetchAllProducts(apiBase = DEFAULT_API_BASE): Promise<Product[]> {
  const all: Product[] = [];
  let page = 1;
  while (page <= 100) {
    const url = `${apiBase}/products?per_page=100&page=${page}&orderby=date&order=desc`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Woo API ${res.status} on /products page ${page}`);
    }
    const items = (await res.json()) as RawWooProduct[];
    if (!Array.isArray(items) || items.length === 0) break;
    all.push(...items.map(normalizeProduct));
    if (items.length < 100) break;
    page++;
  }
  return all;
}

export async function fetchAllCategories(apiBase = DEFAULT_API_BASE): Promise<Category[]> {
  const url = `${apiBase}/products/categories?per_page=100&hide_empty=true`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Woo API ${res.status} on /products/categories`);
  }
  const items = (await res.json()) as RawWooCategoryFull[];
  return items.map(normalizeCategory);
}

export function formatPrice(p: { priceMinor: number; currencySymbol: string }): string {
  const major = (p.priceMinor / 100).toFixed(2);
  return `${major.replace('.', ',')} ${p.currencySymbol}`;
}

/**
 * Returns the on-site path for a category (live site has customized URLs:
 * `/<slug>/` instead of `/kategoria-produktu/<slug>/`).
 */
export function categoryPath(slug: string): string {
  return `/${slug}`;
}
