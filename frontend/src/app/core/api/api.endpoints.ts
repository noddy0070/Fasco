import { environment } from "../../../environments/environments";

const API_PREFIX = `${environment.apiUrl}/api`;
const AUTH_PREFIX = `${API_PREFIX}/auth`;
const ADMIN_PREFIX = `${API_PREFIX}/admin`;
const PRODUCTS_PREFIX = `${API_PREFIX}/products`;

export const API_ENDPOINTS = {
    auth: {
        signup: `${AUTH_PREFIX}/signup`,
        login: `${AUTH_PREFIX}/login`,
        resendVerification: `${AUTH_PREFIX}/verify/resend`,
        google: `${AUTH_PREFIX}/google`,
        forgotPassword: `${AUTH_PREFIX}/forgot-password`,
        resetPassword: `${AUTH_PREFIX}/reset-password`,
        me: `${AUTH_PREFIX}/me`,
        verifyEmail: (token: string) => `${AUTH_PREFIX}/verify/${token}`,
        logout: `${AUTH_PREFIX}/logout`,
        refresh: `${AUTH_PREFIX}/refresh`,
    },
    admin: {
        auth: {
            login: `${ADMIN_PREFIX}/auth/login`,
            logout: `${ADMIN_PREFIX}/auth/logout`,
        },
        users: {
            list: `${ADMIN_PREFIX}/users`,
            get: (id: string) => `${ADMIN_PREFIX}/users/${id}`,
            create: `${ADMIN_PREFIX}/users`,
            update: (id: string) => `${ADMIN_PREFIX}/users/${id}`,
            delete: (id: string) => `${ADMIN_PREFIX}/users/${id}`,
        },
        products: {
            list: `${ADMIN_PREFIX}/products`,
            get: (id: string) => `${ADMIN_PREFIX}/products/${id}`,
            create: `${ADMIN_PREFIX}/products`,
            update: (id: string) => `${ADMIN_PREFIX}/products/${id}`,
            delete: (id: string) => `${ADMIN_PREFIX}/products/${id}`,
            restore: (id: string) => `${ADMIN_PREFIX}/products/${id}/restore`,
        },
        orders: {
            list: `${ADMIN_PREFIX}/orders`,
            get: (id: string) => `${ADMIN_PREFIX}/orders/${id}`,
            updateStatus: (id: string) => `${ADMIN_PREFIX}/orders/${id}/status`,
        },
        analytics: {
            overview: `${ADMIN_PREFIX}/analytics/overview`,
            revenue: `${ADMIN_PREFIX}/analytics/revenue`,
            orderStatusBreakdown: `${ADMIN_PREFIX}/analytics/order-status-breakdown`,
            topProducts: `${ADMIN_PREFIX}/analytics/top-products`,
        },
    },
    products: {
        list: PRODUCTS_PREFIX,
        getById: (id: string) => `${PRODUCTS_PREFIX}/${id}`,
        getBySlug: (slug: string) => `${PRODUCTS_PREFIX}/slug/${slug}`,
    },
} as const;