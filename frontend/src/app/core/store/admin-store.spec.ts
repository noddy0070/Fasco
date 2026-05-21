import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
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
    variants: [{ sku: 'SKU01', price: 999, discount: 0, stock: 50 }],
    averageRating: 4.2,
    totalReviews: 8,
    deletedAt: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
};

const adminServiceStub = {
    getUsers: vi.fn().mockReturnValue(
        of({ message: 'ok', data: { users: [mockUser], total: 1, page: 1, limit: 20 } }),
    ),
    createUser: vi.fn().mockReturnValue(
        of({ message: 'ok', data: mockUser }),
    ),
    updateUser: vi.fn().mockReturnValue(
        of({ message: 'ok', data: { ...mockUser, firstName: 'Updated' } }),
    ),
    deleteUser: vi.fn().mockReturnValue(
        of({ message: 'deleted' }),
    ),
    getProducts: vi.fn().mockReturnValue(
        of({ message: 'ok', data: { products: [mockProduct], total: 1, page: 1, limit: 20 } }),
    ),
    createProduct: vi.fn().mockReturnValue(
        of({ message: 'ok', data: mockProduct }),
    ),
    updateProduct: vi.fn().mockReturnValue(
        of({ message: 'ok', data: { ...mockProduct, title: 'Updated Shirt' } }),
    ),
    deleteProduct: vi.fn().mockReturnValue(
        of({ message: 'deleted' }),
    ),
    getOrders: vi.fn().mockReturnValue(
        of({ message: 'ok', data: { orders: [], total: 0, page: 1, limit: 20 } }),
    ),
    updateOrderStatus: vi.fn().mockReturnValue(throwError(() => new Error('server error'))),
    getOverview: vi.fn().mockReturnValue(
        of({ message: 'ok', data: { totalUsers: 10, totalProducts: 5, totalOrders: 20, totalRevenue: 50000 } }),
    ),
    getRevenueChart: vi.fn().mockReturnValue(of({ message: 'ok', data: [] })),
    getOrderStatusBreakdown: vi.fn().mockReturnValue(of({ message: 'ok', data: [] })),
    getTopProducts: vi.fn().mockReturnValue(of({ message: 'ok', data: [] })),
    logout: vi.fn().mockReturnValue(of({ message: 'ok' })),
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
        vi.useRealTimers();
    });

    describe('initial state', () => {
        it('starts with empty arrays and no error', () => {
            expect(store.users()).toEqual([]);
            expect(store.products()).toEqual([]);
            expect(store.orders()).toEqual([]);
            expect(store.overview()).toBeNull();
            expect(store.isLoading()).toBe(false);
            expect(store.error()).toBeNull();
        });
    });

    describe('loadUsers()', () => {
        it('populates users and total on success', async () => {
            await store.loadUsers();
            expect(store.users().length).toBe(1);
            expect(store.userTotal()).toBe(1);
            expect(store.isLoading()).toBe(false);
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
            expect(result).toBe(true);
            expect(store.userTotal()).toBe(2);
        });
    });

    describe('updateUser()', () => {
        it('replaces the user in state and returns true', async () => {
            await store.loadUsers();
            const result = await store.updateUser('u1', { firstName: 'Updated' });
            expect(result).toBe(true);
            expect(store.users()[0].firstName).toBe('Updated');
        });
    });

    describe('deleteUser()', () => {
        it('removes the user from state and returns true', async () => {
            await store.loadUsers();
            const result = await store.deleteUser('u1');
            expect(result).toBe(true);
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
            expect(result).toBe(false);
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
