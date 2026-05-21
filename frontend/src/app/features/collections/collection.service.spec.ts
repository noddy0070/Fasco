import { TestBed } from '@angular/core/testing';
import { CollectionService } from './collection.service';
import type { CollectionProduct } from '../../shared/collection/collection.types';
import type { CollectionFilterParams } from './collection.models';

// ── Helpers ──────────────────────────────────────────────────────────────────

const makeProduct = (overrides: Partial<CollectionProduct> = {}): CollectionProduct => ({
  productId: 'p1',
  variantSku: 'SKU1',
  name: 'Test Product',
  variant: 'Blue',
  price: '$100',
  priceValue: 100,
  image: 'img.png',
  badge: 'NEW',
  moreColors: '+0',
  swatches: [],
  sizes: ['M', 'L'],
  colors: ['Blue'],
  gender: 'men',
  statuses: [],
  category: 'tops',
  subCategory: 't-shirts',
  ...overrides,
});

const emptyFilters: CollectionFilterParams = {
  sizes: [],
  colors: [],
  prices: [],
  categories: [],
  subCategories: [],
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CollectionService (pure methods)', () => {
  let service: CollectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CollectionService],
    });
    service = TestBed.inject(CollectionService);
  });

  // ── filterProducts() ──────────────────────────────────────────────

  describe('filterProducts()', () => {
    const products = [
      makeProduct({ name: 'A', sizes: ['S'], colors: ['Red'], priceValue: 50, category: 'tops', subCategory: 't-shirts' }),
      makeProduct({ name: 'B', sizes: ['M'], colors: ['Blue'], priceValue: 150, category: 'bottoms', subCategory: 'jeans' }),
      makeProduct({ name: 'C', sizes: ['XL'], colors: ['Green'], priceValue: 250, category: 'tops', subCategory: 'shirts' }),
    ];

    it('returns all products when filters are empty', () => {
      expect(service.filterProducts(products, emptyFilters).length).toBe(3);
    });

    it('filters by size', () => {
      const result = service.filterProducts(products, { ...emptyFilters, sizes: ['M'] });
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('B');
    });

    it('filters by color', () => {
      const result = service.filterProducts(products, { ...emptyFilters, colors: ['Green'] });
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('C');
    });

    it('filters by category', () => {
      const result = service.filterProducts(products, { ...emptyFilters, categories: ['tops'] });
      expect(result.length).toBe(2);
    });

    it('filters by subCategory', () => {
      const result = service.filterProducts(products, { ...emptyFilters, subCategories: ['jeans'] });
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('B');
    });

    it('applies multiple filters simultaneously', () => {
      const result = service.filterProducts(products, {
        ...emptyFilters,
        sizes: ['S'],
        colors: ['Red'],
        categories: ['tops'],
      });
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('A');
    });
  });

  // ── sortProducts() ────────────────────────────────────────────────

  describe('sortProducts()', () => {
    const products = [
      makeProduct({ name: 'Cheap', priceValue: 20 }),
      makeProduct({ name: 'Mid', priceValue: 100 }),
      makeProduct({ name: 'Expensive', priceValue: 300 }),
    ];

    it('sorts Price: Low to High', () => {
      const result = service.sortProducts(products, 'Price: Low to High', products);
      expect(result.map(p => p.priceValue)).toEqual([20, 100, 300]);
    });

    it('sorts Price: High to Low', () => {
      const result = service.sortProducts(products, 'Price: High to Low', products);
      expect(result.map(p => p.priceValue)).toEqual([300, 100, 20]);
    });

    it('returns original order for unknown sort label', () => {
      const result = service.sortProducts(products, 'Default', products);
      expect(result.map(p => p.name)).toEqual(['Cheap', 'Mid', 'Expensive']);
    });

    it('does not mutate the original array', () => {
      const original = [...products];
      service.sortProducts(products, 'Price: Low to High', products);
      expect(products.map(p => p.name)).toEqual(original.map(p => p.name));
    });
  });

  // ── getAvailableFilters() ─────────────────────────────────────────

  describe('getAvailableFilters()', () => {
    const products = [
      makeProduct({ sizes: ['S', 'M'], colors: ['Red', 'Blue'], category: 'tops', subCategory: 't-shirts' }),
      makeProduct({ sizes: ['L'], colors: ['Green'], category: 'bottoms', subCategory: 'jeans' }),
    ];

    it('returns a deduplicated sorted list of sizes', () => {
      const { sizes } = service.getAvailableFilters(products);
      expect(sizes).toEqual(['L', 'M', 'S']);
    });

    it('returns a deduplicated sorted list of colors', () => {
      const { colors } = service.getAvailableFilters(products);
      expect(colors).toEqual(['Blue', 'Green', 'Red']);
    });

    it('returns categories as slug/label pairs', () => {
      const { categories } = service.getAvailableFilters(products);
      expect(categories.map(c => c.slug)).toEqual(['bottoms', 'tops']);
    });
  });

  // ── mapCollectionBaseSlug() ───────────────────────────────────────

  describe('mapCollectionBaseSlug()', () => {
    it('maps "mens-fashion" to "mens-new-arrivals"', () => {
      expect(service.mapCollectionBaseSlug('mens-fashion')).toBe('mens-new-arrivals');
    });

    it('maps "womens-fashion" to "womens-new-arrivals"', () => {
      expect(service.mapCollectionBaseSlug('womens-fashion')).toBe('womens-new-arrivals');
    });

    it('passes other slugs through unchanged', () => {
      expect(service.mapCollectionBaseSlug('sale')).toBe('sale');
    });
  });
});
