import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { AdminService } from '../../features/admin/admin.service';
import type {
    AdminUserModel,
    AdminProductModel,
    AdminOrderModel,
    AnalyticsOverviewModel,
    RevenueDayModel,
    OrderStatusBreakdownModel,
    TopProductModel,
    CreateUserPayload,
    UpdateUserPayload,
    UpdateOrderStatusPayload,
    CreateProductPayload,
} from '../../features/admin/admin.models';

// ─── State shape ─────────────────────────────────────────────────────────────

type AdminState = {
    // Users
    users: AdminUserModel[];
    userTotal: number;
    userPage: number;

    // Products
    products: AdminProductModel[];
    productTotal: number;
    productPage: number;

    // Orders
    orders: AdminOrderModel[];
    orderTotal: number;
    orderPage: number;
    orderStatusFilter: string;

    // Analytics
    overview: AnalyticsOverviewModel | null;
    revenueChart: RevenueDayModel[];
    orderStatusBreakdown: OrderStatusBreakdownModel[];
    topProducts: TopProductModel[];

    // Global UI
    isLoading: boolean;
    error: string | null;
};

const httpErrorMessage = (err: unknown): string => {
    const e = err as { error?: { message?: string }; message?: string };
    return e.error?.message ?? e.message ?? 'Request failed';
};

const initialState: AdminState = {
    users: [],
    userTotal: 0,
    userPage: 1,

    products: [],
    productTotal: 0,
    productPage: 1,

    orders: [],
    orderTotal: 0,
    orderPage: 1,
    orderStatusFilter: '',

    overview: null,
    revenueChart: [],
    orderStatusBreakdown: [],
    topProducts: [],

    isLoading: false,
    error: null,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const AdminStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store, adminService = inject(AdminService)) => ({

        // ── Users ──────────────────────────────────────────────────────────

        async loadUsers(page = 1, limit = 20): Promise<void> {
            patchState(store, { isLoading: true, error: null });
            try {
                const res = await firstValueFrom(adminService.getUsers(page, limit));
                patchState(store, {
                    users: res.data['users'] ?? [],
                    userTotal: res.data.total,
                    userPage: page,
                    isLoading: false,
                });
            } catch (err: unknown) {
                patchState(store, { isLoading: false, error: (err as Error).message });
            }
        },

        async createUser(payload: CreateUserPayload): Promise<boolean> {
            patchState(store, { isLoading: true, error: null });
            try {
                const res = await firstValueFrom(adminService.createUser(payload));
                patchState(store, {
                    users: [...store.users(), res.data],
                    userTotal: store.userTotal() + 1,
                    isLoading: false,
                });
                return true;
            } catch (err: unknown) {
                patchState(store, { isLoading: false, error: (err as Error).message });
                return false;
            }
        },

        async updateUser(id: string, payload: UpdateUserPayload): Promise<boolean> {
            patchState(store, { isLoading: true, error: null });
            try {
                const res = await firstValueFrom(adminService.updateUser(id, payload));
                patchState(store, {
                    users: store.users().map((u) => (u._id === id ? res.data : u)),
                    isLoading: false,
                });
                return true;
            } catch (err: unknown) {
                patchState(store, { isLoading: false, error: (err as Error).message });
                return false;
            }
        },

        async deleteUser(id: string): Promise<boolean> {
            patchState(store, { isLoading: true, error: null });
            try {
                await firstValueFrom(adminService.deleteUser(id));
                patchState(store, {
                    users: store.users().filter((u) => u._id !== id),
                    userTotal: store.userTotal() - 1,
                    isLoading: false,
                });
                return true;
            } catch (err: unknown) {
                patchState(store, { isLoading: false, error: (err as Error).message });
                return false;
            }
        },

        // ── Products ───────────────────────────────────────────────────────

        async loadProducts(page = 1, limit = 20, includeDeleted = false): Promise<void> {
            patchState(store, { isLoading: true, error: null });
            try {
                const res = await firstValueFrom(adminService.getProducts(page, limit, includeDeleted));
                patchState(store, {
                    products: res.data['products'] ?? [],
                    productTotal: res.data.total,
                    productPage: page,
                    isLoading: false,
                });
            } catch (err: unknown) {
                patchState(store, { isLoading: false, error: (err as Error).message });
            }
        },

        async createProduct(payload: CreateProductPayload): Promise<boolean> {
            patchState(store, { isLoading: true, error: null });
            try {
                const res = await firstValueFrom(adminService.createProduct(payload));
                patchState(store, {
                    products: [...store.products(), res.data],
                    productTotal: store.productTotal() + 1,
                    isLoading: false,
                });
                return true;
            } catch (err: unknown) {
                patchState(store, { isLoading: false, error: httpErrorMessage(err) });
                return false;
            }
        },

        async updateProduct(id: string, payload: Partial<CreateProductPayload>): Promise<boolean> {
            patchState(store, { isLoading: true, error: null });
            try {
                const res = await firstValueFrom(adminService.updateProduct(id, payload));
                patchState(store, {
                    products: store.products().map((p) => (p._id === id ? res.data : p)),
                    isLoading: false,
                });
                return true;
            } catch (err: unknown) {
                patchState(store, { isLoading: false, error: httpErrorMessage(err) });
                return false;
            }
        },

        async deleteProduct(id: string): Promise<boolean> {
            patchState(store, { isLoading: true, error: null });
            try {
                await firstValueFrom(adminService.deleteProduct(id));
                patchState(store, {
                    products: store.products().filter((p) => p._id !== id),
                    productTotal: store.productTotal() - 1,
                    isLoading: false,
                });
                return true;
            } catch (err: unknown) {
                patchState(store, { isLoading: false, error: (err as Error).message });
                return false;
            }
        },

        // ── Orders ─────────────────────────────────────────────────────────

        async loadOrders(page = 1, limit = 20, status?: string): Promise<void> {
            patchState(store, { isLoading: true, error: null, orderStatusFilter: status ?? '' });
            try {
                const res = await firstValueFrom(adminService.getOrders(page, limit, status));
                patchState(store, {
                    orders: res.data['orders'] ?? [],
                    orderTotal: res.data.total,
                    orderPage: page,
                    isLoading: false,
                });
            } catch (err: unknown) {
                patchState(store, { isLoading: false, error: (err as Error).message });
            }
        },

        async updateOrderStatus(id: string, payload: UpdateOrderStatusPayload): Promise<boolean> {
            patchState(store, { isLoading: true, error: null });
            try {
                const res = await firstValueFrom(adminService.updateOrderStatus(id, payload));
                patchState(store, {
                    orders: store.orders().map((o) => (o._id === id ? res.data : o)),
                    isLoading: false,
                });
                return true;
            } catch (err: unknown) {
                patchState(store, { isLoading: false, error: (err as Error).message });
                return false;
            }
        },

        // ── Analytics ──────────────────────────────────────────────────────

        async loadAnalytics(): Promise<void> {
            patchState(store, { isLoading: true, error: null });
            try {
                const [overview, revenue, breakdown, topProducts] = await Promise.all([
                    firstValueFrom(adminService.getOverview()),
                    firstValueFrom(adminService.getRevenueChart()),
                    firstValueFrom(adminService.getOrderStatusBreakdown()),
                    firstValueFrom(adminService.getTopProducts()),
                ]);

                patchState(store, {
                    overview: overview.data,
                    revenueChart: revenue.data,
                    orderStatusBreakdown: breakdown.data,
                    topProducts: topProducts.data,
                    isLoading: false,
                });
            } catch (err: unknown) {
                patchState(store, { isLoading: false, error: (err as Error).message });
            }
        },

        clearError(): void {
            patchState(store, { error: null });
        },
    })),
);
