import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AdminService } from './admin.service';
import { API_ENDPOINTS } from '../../core/api/api.endpoints';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  const mockUser = {
    _id: 'u1', firstName: 'Alice', email: 'alice@test.com',
    role: 'user', isVerified: true, isBlocked: false,
    deletedAt: null, createdAt: '', updatedAt: '',
  };

  const mockProduct = {
    _id: 'p1', title: 'Shirt', slug: 'shirt', isActive: true,
    isTrending: false, isLimitedOffer: false,
    variants: [], averageRating: 4, totalReviews: 2,
    deletedAt: null, createdAt: '', updatedAt: '',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── Auth ────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('should POST admin login endpoint', () => {
      service.login({ email: 'a@b.com', password: 'pass' }).subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.admin.auth.login);
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'ok', data: mockUser });
    });
  });

  describe('logout()', () => {
    it('should GET admin logout endpoint', () => {
      service.logout().subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.admin.auth.logout);
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Logged out' });
    });
  });

  // ── Users ───────────────────────────────────────────────────────────

  describe('getUsers()', () => {
    it('should GET the users list with default pagination', () => {
      service.getUsers().subscribe();
      const req = httpMock.expectOne((r) => r.url === API_ENDPOINTS.admin.users.list);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('limit')).toBe('20');
      req.flush({ message: 'ok', data: { users: [mockUser], total: 1, page: 1, limit: 20 } });
    });

    it('should forward custom page/limit params', () => {
      service.getUsers(3, 5).subscribe();
      const req = httpMock.expectOne((r) => r.url === API_ENDPOINTS.admin.users.list);
      expect(req.request.params.get('page')).toBe('3');
      expect(req.request.params.get('limit')).toBe('5');
      req.flush({ message: 'ok', data: { users: [], total: 0, page: 3, limit: 5 } });
    });
  });

  describe('createUser()', () => {
    it('should POST to the create user endpoint', () => {
      const payload = { firstName: 'Bob', email: 'bob@test.com', phone: '123', password: 'pw' };
      service.createUser(payload).subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.admin.users.create);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ message: 'ok', data: mockUser });
    });
  });

  describe('updateUser()', () => {
    it('should PATCH the user by id', () => {
      service.updateUser('u1', { firstName: 'Updated' }).subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.admin.users.update('u1'));
      expect(req.request.method).toBe('PATCH');
      req.flush({ message: 'ok', data: mockUser });
    });
  });

  describe('deleteUser()', () => {
    it('should DELETE the user by id', () => {
      service.deleteUser('u1').subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.admin.users.delete('u1'));
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Deleted' });
    });
  });

  // ── Products ────────────────────────────────────────────────────────

  describe('getProducts()', () => {
    it('should GET the products list', () => {
      service.getProducts().subscribe();
      const req = httpMock.expectOne((r) => r.url === API_ENDPOINTS.admin.products.list);
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'ok', data: { products: [mockProduct], total: 1, page: 1, limit: 20 } });
    });

    it('should set includeDeleted param', () => {
      service.getProducts(1, 20, true).subscribe();
      const req = httpMock.expectOne((r) => r.url === API_ENDPOINTS.admin.products.list);
      expect(req.request.params.get('includeDeleted')).toBe('true');
      req.flush({ message: 'ok', data: { products: [], total: 0, page: 1, limit: 20 } });
    });
  });

  describe('createProduct()', () => {
    it('should POST to the create product endpoint', () => {
      const payload = { title: 'Jacket' };
      service.createProduct(payload).subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.admin.products.create);
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'ok', data: mockProduct });
    });
  });

  describe('deleteProduct()', () => {
    it('should DELETE the product by id', () => {
      service.deleteProduct('p1').subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.admin.products.delete('p1'));
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Deleted' });
    });
  });

  // ── Orders ──────────────────────────────────────────────────────────

  describe('getOrders()', () => {
    it('should GET the orders list', () => {
      service.getOrders().subscribe();
      const req = httpMock.expectOne((r) => r.url === API_ENDPOINTS.admin.orders.list);
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'ok', data: { orders: [], total: 0, page: 1, limit: 20 } });
    });

    it('should add status filter when provided', () => {
      service.getOrders(1, 20, 'shipped').subscribe();
      const req = httpMock.expectOne((r) => r.url === API_ENDPOINTS.admin.orders.list);
      expect(req.request.params.get('status')).toBe('shipped');
      req.flush({ message: 'ok', data: { orders: [], total: 0, page: 1, limit: 20 } });
    });
  });

  describe('updateOrderStatus()', () => {
    it('should PATCH the order status', () => {
      service.updateOrderStatus('o1', { status: 'delivered' }).subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.admin.orders.updateStatus('o1'));
      expect(req.request.method).toBe('PATCH');
      req.flush({ message: 'ok', data: {} });
    });
  });

  // ── Analytics ───────────────────────────────────────────────────────

  describe('getOverview()', () => {
    it('should GET the analytics overview', () => {
      service.getOverview().subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.admin.analytics.overview);
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'ok', data: { totalUsers: 10, totalProducts: 5, totalOrders: 20, totalRevenue: 50000 } });
    });
  });

  describe('getRevenueChart()', () => {
    it('should GET revenue chart data', () => {
      service.getRevenueChart().subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.admin.analytics.revenue);
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'ok', data: [] });
    });
  });

  describe('getTopProducts()', () => {
    it('should GET top products analytics', () => {
      service.getTopProducts().subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.admin.analytics.topProducts);
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'ok', data: [] });
    });
  });
});
