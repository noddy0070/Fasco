import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { SearchService } from './search.service';
import { ProductStore } from '../../core/store/product-store';

const mockProducts = [
  {
    _id: 'p1', title: 'Blue Denim Jacket', gender: 'men' as const,
    category: 'outerwear', subCategory: 'jackets',
    isTrending: false, isLimitedOffer: true, isActive: true,
    variants: [
      { sku: 'S1', price: 150, discount: 10, stock: 3, color: 'Blue', colorCode: '#0000ff', size: 'M', images: ['img1.jpg'] },
    ],
  },
  {
    _id: 'p2', title: 'Red Sneakers', gender: 'women' as const,
    category: 'footwear', subCategory: 'sneakers',
    isTrending: true, isLimitedOffer: false, isActive: true,
    variants: [
      { sku: 'S2', price: 90, discount: 0, stock: 10, color: 'Red', colorCode: '#ff0000', size: 'L', images: ['img2.jpg'] },
    ],
  },
];

const productStoreStub = {
  loadProducts: vi.fn().mockResolvedValue(mockProducts),
};

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    vi.clearAllMocks();
    productStoreStub.loadProducts.mockResolvedValue(mockProducts);

    TestBed.configureTestingModule({
      providers: [
        SearchService,
        { provide: ProductStore, useValue: productStoreStub },
      ],
    });
    service = TestBed.inject(SearchService);
    await service.loadProducts();
  });

  describe('loadProducts()', () => {
    it('should call ProductStore.loadProducts()', async () => {
      expect(productStoreStub.loadProducts).toHaveBeenCalled();
    });

    it('should NOT call ProductStore again if already loaded', async () => {
      productStoreStub.loadProducts.mockClear();
      await service.loadProducts();
      expect(productStoreStub.loadProducts).not.toHaveBeenCalled();
    });
  });

  describe('search()', () => {
    it('should return empty array for blank query', () => {
      expect(service.search('')).toEqual([]);
      expect(service.search('   ')).toEqual([]);
    });

    it('should find products by name (case-insensitive)', () => {
      const result = service.search('jacket');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe('Blue Denim Jacket');
    });

    it('should find products by color', () => {
      const result = service.search('red');
      expect(result.some(p => p.name === 'Red Sneakers')).toBe(true);
    });

    it('should find products by product type', () => {
      const result = service.search('sneakers');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array when nothing matches', () => {
      expect(service.search('zzznomatch')).toEqual([]);
    });
  });

  describe('getTopSuggestions()', () => {
    it('should return at most "limit" results', () => {
      const result = service.getTopSuggestions('a', 1);
      expect(result.length).toBeLessThanOrEqual(1);
    });

    it('should default limit to 4', () => {
      const result = service.getTopSuggestions('e');
      expect(result.length).toBeLessThanOrEqual(4);
    });
  });
});
