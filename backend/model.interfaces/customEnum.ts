
export const gender = {
  MALE: "male",
  FEMALE: "female",
  KIDS: "kids",
  UNISEX: "unisex"
} as const;

export const level = {
    GENDER: 'gender',
    MAIN: 'main',
    SUB: 'sub'
} as const;

export const offerType = {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed',
    BOGO: 'bogo',
    FREE_SHIPPING: 'freeShipping'
} as const;

export const role = {
    USER: 'user',
    ADMIN: 'admin'
} as const;

export const adminRole = {
    SUPER_ADMIN: 'super-admin',
    USER_ADMIN: 'user-admin',
    INVENTORY_MANAGEMENT: 'inventory-management',
} as const;

export const paymentMethod = {
    COD: 'cod',
    CARD: 'card',
    UPI: 'upi',
    NETBANKING: 'netbanking'
} as const;
export const paymentStatus = {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded'
} as const;
export const orderStatus = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    SHIPPED: 'shipped',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    RETURNED: 'returned'
} as const;
export type gender = typeof gender[keyof typeof gender];
export type level = typeof level[keyof typeof level];
export type offerType = typeof offerType[keyof typeof offerType];
export type role = typeof role[keyof typeof role];
export type adminRole = typeof adminRole[keyof typeof adminRole];
export type paymentMethod = typeof paymentMethod[keyof typeof paymentMethod];
export type paymentStatus = typeof paymentStatus[keyof typeof paymentStatus];
export type orderStatus = typeof orderStatus[keyof typeof orderStatus];
