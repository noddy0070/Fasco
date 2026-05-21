import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { TrendingProductsService } from './trending-products.service';
import { ProductStore } from '../../../../core/store/product-store';

const mockProducts = [
  {
    _id: 'p1', title: 'Summer Dress', gender: 'women' as const,
    category: 'dresses', subCategory: 'casual',
    isTrending: true, isLimitedOffer: true, isActive: true,
    variants: [
      { sku: 'D1', price: 80, discount: 5, stock: 8, color: 'Pink', size: 'S', images: ['dress.jpg'] },
      { sku: 'D2', price: 80, discount: 0, stock: 4, color: 'White', size: 'M', images: [] },
    ],
  },
  {
    _id: 'p2', title: 'Men Tee', gender: 'men' as const,
    category: 'tops', subCategory: 't-shirts',
    isTrending: false, isLimitedOffer: false, isActive: true,
    variants: [
      { sku: 'T1', price: 30, discount: 0, stock: 20, color: 'Black', size: 'L', images: [] },
    ],
  },
];

const productStoreStub = {
  loadProducts: vi.fn().mockResolvedValue(mockProducts),
};

describe('TrendingProductsService', () => {
  let service: TrendingProductsService;

  beforeEach(() => {
    vi.clearAllMocks();
    productStoreStub.loadProducts.mockResolvedValue(mockProducts);

    TestBed.configureTestingModule({
      providers: [
        TrendingProductsService,
        { provide: ProductStore, useValue: productStoreStub },
      ],
    });
    service = TestBed.inject(TrendingProductsService);
  });

  describe('loadProducts()', () => {
    it('should call ProductStore.loadProducts()', async () => {
      await new Promise<void>((resolve) => {
        service.loadProducts().subscribe(() => {
          expect(productStoreStub.loadProducts).toHaveBeenCalled();
          resolve();
        });
      });
    });

    it('should emit one entry per product variant', async () => {
      const products = await new Promise<ReturnType<typeof service.loadProducts> extends import('rxjs').Observable<infer T> ? T : never>(
        (resolve) => service.loadProducts().subscribe(resolve)
      );
      // p1 has 2 variants, p2 has 1 variant => 3 total
      expect(products.length).toBe(3);
    });

    it('should map variant color and size to the product entry', async () => {
      const products = await new Promise<Awaited<ReturnType<typeof service.loadProducts.prototype.subscribe>>>(
        (resolve) => service.loadProducts().subscribe(resolve as any)
      ) as any[];
      const dress = products.find((p: any) => p.id === 'p1');
      expect(dress).toBeDefined();
      expect(dress.variant).toContain('Pink');
    });

    it('should assign "Women\'s Fashion" category to women products', async () => {
      const products = await new Promise<any[]>((resolve) =>
        service.loadProducts().subscribe(resolve as any)
      );
      const womenProducts = products.filter((p: any) => p.id === 'p1');
      expect(womenProducts.every((p: any) => p.categories.includes("Women's Fashion"))).toBe(true);
    });

    it('should assign "Men\'s Fashion" category to men products', async () => {
      const products = await new Promise<any[]>((resolve) =>
        service.loadProducts().subscribe(resolve as any)
      );
      const menProducts = products.filter((p: any) => p.id === 'p2');
      expect(menProducts.every((p: any) => p.categories.includes("Men's Fashion"))).toBe(true);
    });

    it('should mark sale badge for items with isLimitedOffer', async () => {
      const products = await new Promise<any[]>((resolve) =>
        service.loadProducts().subscribe(resolve as any)
      );
      const saleProduct = products.find((p: any) => p.id === 'p1' && p.variant?.includes('Pink'));
      expect(saleProduct?.badge).toBe('SALE');
    });

    it('should mark NEW badge for items without discount or limitedOffer', async () => {
      const products = await new Promise<any[]>((resolve) =>
        service.loadProducts().subscribe(resolve as any)
      );
      const newProduct = products.find((p: any) => p.id === 'p2');
      expect(newProduct?.badge).toBe('NEW');
    });
  });
});
