import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAllProducts, fetchAllCategories, normalizeProduct, formatPrice } from './woo';

beforeEach(() => {
  vi.restoreAllMocks();
});

const sampleRawProduct = {
  id: 556,
  name: 'Oczyszczająco-balansujący szampon',
  slug: 'oczyszczajaco-balansujacy-szampon',
  permalink: 'https://www.feelmyself.pl/produkt/oczyszczajaco-balansujacy-szampon/',
  description: '<p>Long description.</p>',
  short_description: '<p>Short.</p>',
  sku: '',
  prices: {
    price: '8800',
    regular_price: '9800',
    sale_price: '8800',
    currency_code: 'PLN',
    currency_symbol: 'zł',
    currency_minor_unit: 2,
  },
  on_sale: true,
  is_in_stock: false,
  images: [
    { src: 'https://www.feelmyself.pl/wp-content/uploads/x.jpg', alt: 'X' },
  ],
  categories: [{ id: 47, name: 'Kosmetyki', slug: 'kosmetyki' }],
};

describe('normalizeProduct', () => {
  it('extracts core fields from a Woo Store API product', () => {
    const p = normalizeProduct(sampleRawProduct);
    expect(p.id).toBe(556);
    expect(p.slug).toBe('oczyszczajaco-balansujacy-szampon');
    expect(p.permalink).toBe('https://www.feelmyself.pl/produkt/oczyszczajaco-balansujacy-szampon/');
    expect(p.priceMinor).toBe(8800);
    expect(p.regularPriceMinor).toBe(9800);
    expect(p.currency).toBe('PLN');
    expect(p.currencySymbol).toBe('zł');
    expect(p.onSale).toBe(true);
    expect(p.inStock).toBe(false);
    expect(p.images).toHaveLength(1);
    expect(p.categories[0].slug).toBe('kosmetyki');
  });
});

describe('formatPrice', () => {
  it('formats Polish złoty with comma decimal separator', () => {
    expect(formatPrice({ priceMinor: 8800, currencySymbol: 'zł' })).toBe('88,00 zł');
  });

  it('handles zero', () => {
    expect(formatPrice({ priceMinor: 0, currencySymbol: 'zł' })).toBe('0,00 zł');
  });
});

describe('fetchAllProducts', () => {
  it('returns normalized products from a single (partial) page', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([sampleRawProduct]), { status: 200 }));

    vi.stubGlobal('fetch', fetchMock);

    const products = await fetchAllProducts('https://www.feelmyself.pl/wp-json/wc/store/v1');
    expect(products).toHaveLength(1);
    expect(products[0].slug).toBe('oczyszczajaco-balansujacy-szampon');
    // Short-circuits after the first page when items < per_page (100)
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('paginates when the first page is full', async () => {
    const fullPage = Array(100).fill(0).map((_, i) => ({ ...sampleRawProduct, id: i + 1, slug: `p${i}` }));
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(fullPage), { status: 200 }))
      .mockResolvedValueOnce(new Response('[]', { status: 200 }));

    vi.stubGlobal('fetch', fetchMock);

    const products = await fetchAllProducts('https://example.com/api');
    expect(products).toHaveLength(100);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('throws on non-OK response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('Server error', { status: 500 })));

    await expect(fetchAllProducts('https://example.com/api')).rejects.toThrow(/500/);
  });
});

describe('fetchAllCategories', () => {
  it('returns normalized categories', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify([
        { id: 47, name: 'Kosmetyki', slug: 'kosmetyki', description: '<p>Hi</p>', count: 5, image: null },
      ]), { status: 200 })
    ));

    const cats = await fetchAllCategories('https://www.feelmyself.pl/wp-json/wc/store/v1');
    expect(cats).toHaveLength(1);
    expect(cats[0].slug).toBe('kosmetyki');
    expect(cats[0].count).toBe(5);
    expect(cats[0].image).toBeUndefined();
  });
});
