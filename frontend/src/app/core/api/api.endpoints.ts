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
        brands: {
            list: `${ADMIN_PREFIX}/brands`,
            create: `${ADMIN_PREFIX}/brands`,
            update: (id: string) => `${ADMIN_PREFIX}/brands/${id}`,
            delete: (id: string) => `${ADMIN_PREFIX}/brands/${id}`,
        },
        categories: {
            list: `${ADMIN_PREFIX}/categories`,
            create: `${ADMIN_PREFIX}/categories`,
            update: (id: string) => `${ADMIN_PREFIX}/categories/${id}`,
            delete: (id: string) => `${ADMIN_PREFIX}/categories/${id}`,
        },
        collections: {
            list: `${ADMIN_PREFIX}/collections`,
            get: (id: string) => `${ADMIN_PREFIX}/collections/${id}`,
            create: `${ADMIN_PREFIX}/collections`,
            update: (id: string) => `${ADMIN_PREFIX}/collections/${id}`,
            delete: (id: string) => `${ADMIN_PREFIX}/collections/${id}`,
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
    collections: {
        list: `${API_PREFIX}/collections`,
        getBySlug: (slug: string) => `${API_PREFIX}/collections/${slug}`,
    },
    cart: {
        get: `${API_PREFIX}/cart`,
        addItem: `${API_PREFIX}/cart/items`,
        updateItem: `${API_PREFIX}/cart/items`,
        removeItem: `${API_PREFIX}/cart/items`,
    },
    wishlist: {
        get: `${API_PREFIX}/wishlist`,
        addItem: `${API_PREFIX}/wishlist/items`,
        removeItem: `${API_PREFIX}/wishlist/items`,
    },
    orders: {
        list: `${API_PREFIX}/orders`,
        checkout: `${API_PREFIX}/orders/checkout`,
    },
} as const;