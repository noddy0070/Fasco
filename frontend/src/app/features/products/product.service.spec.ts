import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { API_ENDPOINTS } from '../../core/api/api.endpoints';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockProduct = {
    _id: 'p1',
    title: 'Test Shirt',
    gender: 'men' as const,
    category: 'tops',
    subCategory: 't-shirts',
    variants: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getProducts()', () => {
    it('should GET the products list endpoint', () => {
      service.getProducts().subscribe();
      const req = httpMock.expectOne((r) => r.url === API_ENDPOINTS.products.list);
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'ok', data: [mockProduct] });
    });

    it('should pass "gender" query param when provided', () => {
      service.getProducts({ gender: 'women' }).subscribe();
      const req = httpMock.expectOne((r) => r.url === API_ENDPOINTS.products.list);
      expect(req.request.params.get('gender')).toBe('women');
      req.flush({ message: 'ok', data: [] });
    });

    it('should pass "isTrending" query param when provided', () => {
      service.getProducts({ isTrending: true }).subscribe();
      const req = httpMock.expectOne((r) => r.url === API_ENDPOINTS.products.list);
      expect(req.request.params.get('isTrending')).toBe('true');
      req.flush({ message: 'ok', data: [] });
    });

    it('should pass "isLimitedOffer" query param when provided', () => {
      service.getProducts({ isLimitedOffer: false }).subscribe();
      const req = httpMock.expectOne((r) => r.url === API_ENDPOINTS.products.list);
      expect(req.request.params.get('isLimitedOffer')).toBe('false');
      req.flush({ message: 'ok', data: [] });
    });

    it('should not add query params when none are provided', () => {
      service.getProducts().subscribe();
      const req = httpMock.expectOne((r) => r.url === API_ENDPOINTS.products.list);
      expect(req.request.params.keys().length).toBe(0);
      req.flush({ message: 'ok', data: [] });
    });
  });

  describe('getProductById()', () => {
    it('should GET the product by id endpoint', () => {
      service.getProductById('p1').subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.products.getById('p1'));
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'ok', data: mockProduct });
    });
  });

  describe('getProductBySlug()', () => {
    it('should GET the product by slug endpoint', () => {
      service.getProductBySlug('test-shirt').subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.products.getBySlug('test-shirt'));
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'ok', data: mockProduct });
    });
  });
});
