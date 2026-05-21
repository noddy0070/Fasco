import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminStore } from './admin-store';
import { AdminService } from '../../features/admin/admin.service';
import type { AdminUserModel, AdminProductModel } from '../../features/admin/admin.models';

// ── Stubs ─────────────────────────────────────────────────────────────────────

const mockUser: AdminUserModel = {
    _id: 'u1',
    firstName: 'Alice',
    email: 'alice@test.com',
    role: 'user',
    isVerified: true,
    isBlocked: false,
    deletedAt: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockProduct: AdminProductModel = {
    _id: 'p1',
    title: 'Test Shirt',
    slug: 'test-shirt',
    isActive: true,
    isTrending: false,
    isLimitedOffer: false,
    variants: [{ sku: 'SKU01', price: 999, discount: 0, stock: 50, images: [] }],
    averageRating: 4.2,
    totalReviews: 8,
    deletedAt: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
};

const adminServiceStub = {
    getUsers: jasmine.createSpy('getUsers').and.returnValue(
        of({ message: 'ok', data: { users: [mockUser], total: 1, page: 1, limit: 20 } }),
    ),
    createUser: jasmine.createSpy('createUser').and.returnValue(
        of({ message: 'ok', data: mockUser }),
    ),
    updateUser: jasmine.createSpy('updateUser').and.returnValue(
        of({ message: 'ok', data: { ...mockUser, firstName: 'Updated' } }),
    ),
    deleteUser: jasmine.createSpy('deleteUser').and.returnValue(
        of({ message: 'deleted' }),
    ),
    getProducts: jasmine.createSpy('getProducts').and.returnValue(
        of({ message: 'ok', data: { products: [mockProduct], total: 1, page: 1, limit: 20 } }),
    ),
    createProduct: jasmine.createSpy('createProduct').and.returnValue(
        of({ message: 'ok', data: mockProduct }),
    ),
    updateProduct: jasmine.createSpy('updateProduct').and.returnValue(
        of({ message: 'ok', data: { ...mockProduct, title: 'Updated Shirt' } }),
    ),
    deleteProduct: jasmine.createSpy('deleteProduct').and.returnValue(
        of({ message: 'deleted' }),
    ),
    getOrders: jasmine.createSpy('getOrders').and.returnValue(
        of({ message: 'ok', data: { orders: [], total: 0, page: 1, limit: 20 } }),
    ),
    updateOrderStatus: jasmine.createSpy('updateOrderStatus').and.returnValue(throwError(() => new Error('server error'))),
    getOverview: jasmine.createSpy('getOverview').and.returnValue(
        of({ message: 'ok', data: { totalUsers: 10, totalProducts: 5, totalOrders: 20, totalRevenue: 50000 } }),
    ),
    getRevenueChart: jasmine.createSpy('getRevenueChart').and.returnValue(of({ message: 'ok', data: [] })),
    getOrderStatusBreakdown: jasmine.createSpy('getOrderStatusBreakdown').and.returnValue(of({ message: 'ok', data: [] })),
    getTopProducts: jasmine.createSpy('getTopProducts').and.returnValue(of({ message: 'ok', data: [] })),
    logout: jasmine.createSpy('logout').and.returnValue(of({ message: 'ok' })),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AdminStore', () => {
    let store: InstanceType<typeof AdminStore>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AdminStore,
                { provide: AdminService, useValue: adminServiceStub },
            ],
        });
        store = TestBed.inject(AdminStore);
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    describe('initial state', () => {
        it('starts with empty arrays and no error', () => {
            expect(store.users()).toEqual([]);
            expect(store.products()).toEqual([]);
            expect(store.orders()).toEqual([]);
            expect(store.overview()).toBeNull();
            expect(store.isLoading()).toBeFalse();
            expect(store.error()).toBeNull();
        });
    });

    describe('loadUsers()', () => {
        it('populates users and total on success', async () => {
            await store.loadUsers();
            expect(store.users().length).toBe(1);
            expect(store.userTotal()).toBe(1);
            expect(store.isLoading()).toBeFalse();
        });
    });

    describe('createUser()', () => {
        it('appends new user to state and returns true', async () => {
            await store.loadUsers();
            const result = await store.createUser({
                firstName: 'Bob',
                email: 'bob@test.com',
                phone: '1234567890',
                password: 'secret',
            });
            expect(result).toBeTrue();
            expect(store.userTotal()).toBe(2);
        });
    });

    describe('updateUser()', () => {
        it('replaces the user in state and returns true', async () => {
            await store.loadUsers();
            const result = await store.updateUser('u1', { firstName: 'Updated' });
            expect(result).toBeTrue();
            expect(store.users()[0].firstName).toBe('Updated');
        });
    });

    describe('deleteUser()', () => {
        it('removes the user from state and returns true', async () => {
            await store.loadUsers();
            const result = await store.deleteUser('u1');
            expect(result).toBeTrue();
            expect(store.users().length).toBe(0);
            expect(store.userTotal()).toBe(0);
        });
    });

    describe('loadProducts()', () => {
        it('populates products on success', async () => {
            await store.loadProducts();
            expect(store.products().length).toBe(1);
            expect(store.products()[0].title).toBe('Test Shirt');
        });
    });

    describe('loadOrders()', () => {
        it('sets empty orders list when no orders returned', async () => {
            await store.loadOrders();
            expect(store.orders()).toEqual([]);
            expect(store.orderTotal()).toBe(0);
        });
    });

    describe('updateOrderStatus() — error path', () => {
        it('sets error and returns false on API failure', async () => {
            const result = await store.updateOrderStatus('o1', { status: 'shipped' });
            expect(result).toBeFalse();
            expect(store.error()).toBeTruthy();
        });
    });

    describe('loadAnalytics()', () => {
        it('populates overview on success', async () => {
            await store.loadAnalytics();
            expect(store.overview()).toEqual({
                totalUsers: 10,
                totalProducts: 5,
                totalOrders: 20,
                totalRevenue: 50000,
            });
        });
    });

    describe('clearError()', () => {
        it('resets the error signal to null', async () => {
            await store.updateOrderStatus('o1', { status: 'shipped' }); // triggers error
            expect(store.error()).toBeTruthy();
            store.clearError();
            expect(store.error()).toBeNull();
        });
    });
});
