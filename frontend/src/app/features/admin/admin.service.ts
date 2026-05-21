import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/api/api.endpoints';
import type {
    AdminLoginPayload,
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
} from './admin.models';
import type { AuthUser } from '../auth/auth.models';

type ApiResponse<T> = { message: string; data: T };
type PaginatedData<T> = { message: string; data: { users?: T[]; products?: T[]; orders?: T[]; total: number; page: number; limit: number } };

@Injectable({ providedIn: 'root' })
export class AdminService {
    private readonly http = inject(HttpClient);

    // ─── Auth ─────────────────────────────────────────────────────────

    login(payload: AdminLoginPayload): Observable<ApiResponse<AuthUser>> {
        return this.http.post<ApiResponse<AuthUser>>(API_ENDPOINTS.admin.auth.login, payload);
    }

    logout(): Observable<{ message: string }> {
        return this.http.get<{ message: string }>(API_ENDPOINTS.admin.auth.logout);
    }

    // ─── Users ────────────────────────────────────────────────────────

    getUsers(page = 1, limit = 20): Observable<PaginatedData<AdminUserModel>> {
        const params = new HttpParams().set('page', page).set('limit', limit);
        return this.http.get<PaginatedData<AdminUserModel>>(API_ENDPOINTS.admin.users.list, { params });
    }

    getUserById(id: string): Observable<ApiResponse<AdminUserModel>> {
        return this.http.get<ApiResponse<AdminUserModel>>(API_ENDPOINTS.admin.users.get(id));
    }

    createUser(payload: CreateUserPayload): Observable<ApiResponse<AdminUserModel>> {
        return this.http.post<ApiResponse<AdminUserModel>>(API_ENDPOINTS.admin.users.create, payload);
    }

    updateUser(id: string, payload: UpdateUserPayload): Observable<ApiResponse<AdminUserModel>> {
        return this.http.patch<ApiResponse<AdminUserModel>>(API_ENDPOINTS.admin.users.update(id), payload);
    }

    deleteUser(id: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(API_ENDPOINTS.admin.users.delete(id));
    }

    // ─── Products ─────────────────────────────────────────────────────

    getProducts(page = 1, limit = 20, includeDeleted = false): Observable<PaginatedData<AdminProductModel>> {
        const params = new HttpParams()
            .set('page', page)
            .set('limit', limit)
            .set('includeDeleted', includeDeleted);
        return this.http.get<PaginatedData<AdminProductModel>>(API_ENDPOINTS.admin.products.list, { params });
    }

    getProductById(id: string): Observable<ApiResponse<AdminProductModel>> {
        return this.http.get<ApiResponse<AdminProductModel>>(API_ENDPOINTS.admin.products.get(id));
    }

    createProduct(payload: Record<string, unknown>): Observable<ApiResponse<AdminProductModel>> {
        return this.http.post<ApiResponse<AdminProductModel>>(API_ENDPOINTS.admin.products.create, payload);
    }

    updateProduct(id: string, payload: Record<string, unknown>): Observable<ApiResponse<AdminProductModel>> {
        return this.http.patch<ApiResponse<AdminProductModel>>(API_ENDPOINTS.admin.products.update(id), payload);
    }

    deleteProduct(id: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(API_ENDPOINTS.admin.products.delete(id));
    }

    restoreProduct(id: string): Observable<ApiResponse<AdminProductModel>> {
        return this.http.patch<ApiResponse<AdminProductModel>>(API_ENDPOINTS.admin.products.restore(id), {});
    }

    // ─── Orders ───────────────────────────────────────────────────────

    getOrders(page = 1, limit = 20, status?: string): Observable<PaginatedData<AdminOrderModel>> {
        let params = new HttpParams().set('page', page).set('limit', limit);
        if (status) params = params.set('status', status);
        return this.http.get<PaginatedData<AdminOrderModel>>(API_ENDPOINTS.admin.orders.list, { params });
    }

    getOrderById(id: string): Observable<ApiResponse<AdminOrderModel>> {
        return this.http.get<ApiResponse<AdminOrderModel>>(API_ENDPOINTS.admin.orders.get(id));
    }

    updateOrderStatus(id: string, payload: UpdateOrderStatusPayload): Observable<ApiResponse<AdminOrderModel>> {
        return this.http.patch<ApiResponse<AdminOrderModel>>(API_ENDPOINTS.admin.orders.updateStatus(id), payload);
    }

    // ─── Analytics ────────────────────────────────────────────────────

    getOverview(): Observable<ApiResponse<AnalyticsOverviewModel>> {
        return this.http.get<ApiResponse<AnalyticsOverviewModel>>(API_ENDPOINTS.admin.analytics.overview);
    }

    getRevenueChart(): Observable<ApiResponse<RevenueDayModel[]>> {
        return this.http.get<ApiResponse<RevenueDayModel[]>>(API_ENDPOINTS.admin.analytics.revenue);
    }

    getOrderStatusBreakdown(): Observable<ApiResponse<OrderStatusBreakdownModel[]>> {
        return this.http.get<ApiResponse<OrderStatusBreakdownModel[]>>(API_ENDPOINTS.admin.analytics.orderStatusBreakdown);
    }

    getTopProducts(): Observable<ApiResponse<TopProductModel[]>> {
        return this.http.get<ApiResponse<TopProductModel[]>>(API_ENDPOINTS.admin.analytics.topProducts);
    }
}
