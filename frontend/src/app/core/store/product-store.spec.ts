import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ProductStore } from './product-store';
import { ProductService } from '../../features/products/product.service';

const mockProducts = [
  {
    _id: 'p1', title: 'Shirt', gender: 'men' as const,
    category: 'tops', subCategory: 't-shirts',
    isTrending: true, isLimitedOffer: false, isActive: true,
    variants: [{ sku: 'S1', price: 99, discount: 0, stock: 5 }],
  },
  {
    _id: 'p2', title: 'Jacket', gender: 'women' as const,
    category: 'outerwear', subCategory: 'jackets',
    isTrending: false, isLimitedOffer: true, isActive: true,
    variants: [{ sku: 'J1', price: 199, discount: 10, stock: 3 }],
  },
];

const productServiceStub = {
  getProducts: vi.fn().mockReturnValue(of({ message: 'ok', data: mockProducts })),
};

describe('ProductStore', () => {
  let store: InstanceType<typeof ProductStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    productServiceStub.getProducts.mockReturnValue(of({ message: 'ok', data: mockProducts }));

    TestBed.configureTestingModule({
      providers: [
        ProductStore,
        { provide: ProductService, useValue: productServiceStub },
      ],
    });
    store = TestBed.inject(ProductStore);
  });

  describe('initial state', () => {
    it('should start with empty products', () => {
      expect(store.products()).toEqual([]);
    });

    it('should start with isLoaded = false', () => {
      expect(store.isLoaded()).toBe(false);
    });

    it('should start with isLoading = false', () => {
      expect(store.isLoading()).toBe(false);
    });

    it('should start with no error', () => {
      expect(store.error()).toBeNull();
    });
  });

  describe('loadProducts()', () => {
    it('should call ProductService.getProducts()', async () => {
      await store.loadProducts();
      expect(productServiceStub.getProducts).toHaveBeenCalledTimes(1);
    });

    it('should populate products signal', async () => {
      await store.loadProducts();
      expect(store.products().length).toBe(2);
      expect(store.products()[0].title).toBe('Shirt');
    });

    it('should set isLoaded to true after successful load', async () => {
      await store.loadProducts();
      expect(store.isLoaded()).toBe(true);
    });

    it('should NOT call the API a second time when already loaded', async () => {
      await store.loadProducts();
      await store.loadProducts();
      expect(productServiceStub.getProducts).toHaveBeenCalledTimes(1);
    });

    it('should return cached products on second call', async () => {
      const first = await store.loadProducts();
      const second = await store.loadProducts();
      expect(second).toEqual(first);
    });
  });
});
