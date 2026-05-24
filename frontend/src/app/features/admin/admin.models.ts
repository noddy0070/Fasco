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

export type ProductGender = 'men' | 'women' | 'kids' | 'unisex';

export type AdminProductVariant = {
    sku: string;
    price: number;
    discount: number;
    stock: number;
    size?: string;
    color?: string;
    colorCode?: string;
    images?: string[];
};

export type AdminProductSpecification = {
    title: string;
    value: string;
};

export type AdminProductModel = {
    _id: string;
    title: string;
    slug?: string;
    description?: string;
    brand?: string | { _id: string; name?: string };
    gender?: ProductGender;
    category?: string | { _id: string; name?: string };
    subCategory?: string | { _id: string; name?: string };
    isActive: boolean;
    isTrending: boolean;
    isLimitedOffer: boolean;
    variants: AdminProductVariant[];
    specifications?: AdminProductSpecification[];
    tags?: string[];
    metaTitle?: string;
    metaDescription?: string;
    averageRating: number;
    totalReviews: number;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type AdminBrandModel = {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    logo?: string;
    isActive: boolean;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
};

export type AdminCategoryModel = {
    _id: string;
    name: string;
    slug: string;
    level: 'gender' | 'main' | 'sub';
    parent?: string | { _id: string; name: string; slug: string } | null;
    createdAt: string;
    updatedAt: string;
};

export interface CreateBrandPayload {
    title: string;
    slug?: string;
    description?: string;
    logo?: string;
    isActive?: boolean;
    isFeatured?: boolean;
}

export type CollectionProductFilter = 'men' | 'women' | 'sale' | 'featured' | 'all';

export type AdminCollectionTab = { label: string; slug: string };
export type AdminCollectionPromoAction = { label: string; slug: string };

export type AdminCollectionModel = {
    _id: string;
    slug: string;
    eyebrow: string;
    title: string;
    description: string;
    heroImage: string;
    tabs: AdminCollectionTab[];
    sortOptions: string[];
    promo: {
        eyebrow: string;
        title: string;
        description: string;
        actions: AdminCollectionPromoAction[];
    };
    productFilter: CollectionProductFilter;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
};

export interface CreateCollectionPayload {
    slug?: string;
    eyebrow?: string;
    title: string;
    description?: string;
    heroImage?: string;
    tabs?: AdminCollectionTab[];
    sortOptions?: string[] | string;
    promo?: {
        eyebrow?: string;
        title?: string;
        description?: string;
        actions?: AdminCollectionPromoAction[];
    };
    productFilter?: CollectionProductFilter;
    isActive?: boolean;
    displayOrder?: number;
}

export interface CreateCategoryPayload {
    name: string;
    slug?: string;
    level: 'gender' | 'main' | 'sub';
    parent?: string | null;
}

export interface CreateProductPayload {
    title: string;
    slug?: string;
    description?: string;
    brand?: string;
    gender?: ProductGender;
    category?: string;
    subCategory?: string;
    isActive?: boolean;
    isTrending?: boolean;
    isLimitedOffer?: boolean;
    variants: AdminProductVariant[];
    specifications?: AdminProductSpecification[];
    tags?: string[];
    metaTitle?: string;
    metaDescription?: string;
}

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
