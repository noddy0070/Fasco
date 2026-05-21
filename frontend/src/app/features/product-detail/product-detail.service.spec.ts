import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ProductDetailService, FALLBACK_PRODUCTS } from './product-detail.service';

describe('ProductDetailService', () => {
  let service: ProductDetailService;
  let httpMock: HttpTestingController;

  const mockProducts = [
    {
      _id: 'p1', title: 'Shirt', slug: 'shirt', isActive: true,
      isTrending: false, isLimitedOffer: false,
      variants: [], averageRating: 4, totalReviews: 10, specifications: [],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductDetailService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductDetailService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('loadProducts()', () => {
    it('should GET /mockData/products.json', () => {
      service.loadProducts().subscribe();
      const req = httpMock.expectOne('/mockData/products.json');
      expect(req.request.method).toBe('GET');
      req.flush({ products: mockProducts });
    });

    it('should return the products from the server', () => {
      let result: unknown;
      service.loadProducts().subscribe(p => (result = p));
      httpMock.expectOne('/mockData/products.json').flush({ products: mockProducts });
      expect(result).toEqual(mockProducts);
    });

    it('should return FALLBACK_PRODUCTS when response has no products array', () => {
      let result: unknown;
      service.loadProducts().subscribe(p => (result = p));
      httpMock.expectOne('/mockData/products.json').flush({ products: [] });
      expect(result).toEqual(FALLBACK_PRODUCTS);
    });

    it('should return FALLBACK_PRODUCTS on HTTP error', () => {
      let result: unknown;
      service.loadProducts().subscribe(p => (result = p));
      httpMock
        .expectOne('/mockData/products.json')
        .flush('Error', { status: 500, statusText: 'Server Error' });
      expect(result).toEqual(FALLBACK_PRODUCTS);
    });
  });
});
