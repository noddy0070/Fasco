// ─── Admin Role ─────────────────────────────────────────────────────────────

export type AdminRole = 'super-admin' | 'user-admin' | 'inventory-management';

// ─── Login ───────────────────────────────────────────────────────────────────

export interface AdminLoginPayload {
    email: string;
    password: string;
}

// ─── User Management ─────────────────────────────────────────────────────────

export type AdminUserModel = {
    _id: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    role: string;
    isVerified: boolean;
    isBlocked: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export interface CreateUserPayload {
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
}

export interface UpdateUserPayload {
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
    isBlocked?: boolean;
    isVerified?: boolean;
    gender?: string;
    avatar?: string;
}

// ─── Product Management ──────────────────────────────────────────────────────

export type AdminProductModel = {
    _id: string;
    title: string;
    slug: string;
    isActive: boolean;
    isTrending: boolean;
    isLimitedOffer: boolean;
    variants: {
        sku: string;
        size?: string;
        color?: string;
        price: number;
        discount: number;
        stock: number;
        images: string[];
    }[];
    averageRating: number;
    totalReviews: number;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

// ─── Order Management ────────────────────────────────────────────────────────

export type AdminOrderModel = {
    _id: string;
    user: { _id: string; firstName: string; lastName?: string; email: string };
    items: {
        product: string;
        title?: string;
        variantSku?: string;
        quantity: number;
        finalPrice: number;
    }[];
    orderStatus: string;
    totalAmount: number;
    payment: { method: string; status: string };
    trackingId?: string;
    createdAt: string;
    updatedAt: string;
};

export interface UpdateOrderStatusPayload {
    status: string;
    trackingId?: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export type AnalyticsOverviewModel = {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
};

export type RevenueDayModel = {
    date: string;
    revenue: number;
    orders: number;
};

export type OrderStatusBreakdownModel = {
    status: string;
    count: number;
};

export type TopProductModel = {
    productId: string;
    title: string;
    totalSold: number;
    revenue: number;
};

// ─── Generic paginated response ──────────────────────────────────────────────

export type PaginatedResponse<T> = {
    items: T[];
    total: number;
    page: number;
    limit: number;
};
