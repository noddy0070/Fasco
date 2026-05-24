export type CartProductRef = {
    _id: string;
    title: string;
    slug: string;
    variants: {
        sku: string;
        price: number;
        discount: number;
        stock: number;
        size?: string;
        color?: string;
        images?: string[];
    }[];
};

export type CartItemModel = {
    product: CartProductRef | string;
    variantSku: string;
    quantity: number;
    addedAt?: string;
};

export type CartModel = {
    _id: string;
    items: CartItemModel[];
    totalItems: number;
    totalAmount: number;
};

export type WishlistItemModel = {
    product: CartProductRef | string;
    variantSku: string;
    addedAt?: string;
};

export type WishlistModel = {
    _id: string;
    items: WishlistItemModel[];
};

export type ShippingAddressPayload = {
    fullName: string;
    phone: string;
    pincode: string;
    state: string;
    city: string;
    addressLine1: string;
    addressLine2?: string;
};

export type CheckoutPayload = {
    paymentMethod: 'cod' | 'card' | 'upi' | 'netbanking';
    shippingAddress: ShippingAddressPayload;
    items?: { productId: string; variantSku: string; quantity: number }[];
    useCart?: boolean;
};

export type UserOrderModel = {
    _id: string;
    items: {
        title?: string;
        variantSku?: string;
        quantity: number;
        finalPrice: number;
        image?: string[];
        color?: string;
        size?: string;
    }[];
    orderStatus: string;
    payment: { method: string; status: string };
    totalAmount: number;
    totalItems: number;
    shippingCharges?: number;
    subtotal?: number;
    shippingAddress?: ShippingAddressPayload;
    createdAt: string;
};
