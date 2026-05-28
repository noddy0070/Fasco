/**
 * Tests for recalculateCartTotals utility.
 * Product model is mocked via jest.unstable_mockModule (ESM-safe).
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// ── Mock setup ────────────────────────────────────────────────────────────────
// Must define mock fn BEFORE unstable_mockModule so factory closes over it.
const mockFind = jest.fn();

jest.unstable_mockModule('../model/product.model', () => ({
    default: { find: mockFind },
    Product: { find: mockFind },
}));

// Dynamic import AFTER mock registration.
const { recalculateCartTotals } = await import('../utils/cart-totals.util');

// ── Helpers ───────────────────────────────────────────────────────────────────
/** Wraps an array in a chainable { lean() } object, matching Mongoose query API. */
const mockFindReturning = (items: unknown[]) =>
    mockFind.mockReturnValueOnce({ lean: jest.fn().mockResolvedValueOnce(items) });

const makeProduct = (variants: { sku: string; price: number; discount: number }[]) => ({
    _id: { toString: () => 'prod1' },
    variants,
});

beforeEach(() => {
    mockFind.mockReset();
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('recalculateCartTotals', () => {
    it('sets totals to 0 when cart is empty', async () => {
        const cart = { items: [], totalItems: 5, totalAmount: 100 };
        await recalculateCartTotals(cart);
        expect(cart.totalItems).toBe(0);
        expect(cart.totalAmount).toBe(0);
        // No DB call for empty cart.
        expect(mockFind).not.toHaveBeenCalled();
    });

    it('uses a single batch query regardless of item count (no N+1)', async () => {
        mockFindReturning([makeProduct([{ sku: 'SKU1', price: 100, discount: 0 }])]);

        const cart = {
            items: [
                { product: { toString: () => 'prod1' }, variantSku: 'SKU1', quantity: 2 },
                { product: { toString: () => 'prod1' }, variantSku: 'SKU1', quantity: 3 },
            ],
            totalItems: 0,
            totalAmount: 0,
        };

        await recalculateCartTotals(cart);
        expect(mockFind).toHaveBeenCalledTimes(1);
    });

    it('calculates totals correctly with no discount', async () => {
        mockFindReturning([makeProduct([{ sku: 'SKU1', price: 200, discount: 0 }])]);

        const cart = {
            items: [{ product: { toString: () => 'prod1' }, variantSku: 'SKU1', quantity: 3 }],
            totalItems: 0,
            totalAmount: 0,
        };

        await recalculateCartTotals(cart);
        expect(cart.totalItems).toBe(3);
        expect(cart.totalAmount).toBe(600); // 200 * 3
    });

    it('applies variant discount correctly (price=100, discount=20% → 80 per unit)', async () => {
        mockFindReturning([makeProduct([{ sku: 'SKU1', price: 100, discount: 20 }])]);

        const cart = {
            items: [{ product: { toString: () => 'prod1' }, variantSku: 'SKU1', quantity: 2 }],
            totalItems: 0,
            totalAmount: 0,
        };

        await recalculateCartTotals(cart);
        expect(cart.totalItems).toBe(2);
        expect(cart.totalAmount).toBe(160); // 80 * 2
    });

    it('handles 100% discount correctly (free item)', async () => {
        mockFindReturning([makeProduct([{ sku: 'SKU1', price: 100, discount: 100 }])]);

        const cart = {
            items: [{ product: { toString: () => 'prod1' }, variantSku: 'SKU1', quantity: 1 }],
            totalItems: 0,
            totalAmount: 0,
        };

        await recalculateCartTotals(cart);
        expect(cart.totalItems).toBe(1);
        expect(cart.totalAmount).toBe(0);
    });

    it('skips items whose product is not returned by the batch query', async () => {
        mockFindReturning([]); // No products returned

        const cart = {
            items: [{ product: { toString: () => 'missing-id' }, variantSku: 'SKU1', quantity: 1 }],
            totalItems: 5,
            totalAmount: 500,
        };

        await recalculateCartTotals(cart);
        expect(cart.totalItems).toBe(0);
        expect(cart.totalAmount).toBe(0);
    });

    it('skips items whose variant SKU does not exist on the product', async () => {
        mockFindReturning([makeProduct([{ sku: 'DIFFERENT_SKU', price: 100, discount: 0 }])]);

        const cart = {
            items: [{ product: { toString: () => 'prod1' }, variantSku: 'SKU_MISSING', quantity: 1 }],
            totalItems: 5,
            totalAmount: 500,
        };

        await recalculateCartTotals(cart);
        expect(cart.totalItems).toBe(0);
        expect(cart.totalAmount).toBe(0);
    });

    it('accumulates totals correctly across multiple distinct items', async () => {
        mockFindReturning([
            { _id: { toString: () => 'prod1' }, variants: [{ sku: 'A', price: 100, discount: 0 }] },
            { _id: { toString: () => 'prod2' }, variants: [{ sku: 'B', price: 50, discount: 50 }] },
        ]);

        const cart = {
            items: [
                { product: { toString: () => 'prod1' }, variantSku: 'A', quantity: 2 }, // 200
                { product: { toString: () => 'prod2' }, variantSku: 'B', quantity: 4 }, // 25*4=100
            ],
            totalItems: 0,
            totalAmount: 0,
        };

        await recalculateCartTotals(cart);
        expect(cart.totalItems).toBe(6);
        expect(cart.totalAmount).toBe(300);
    });
});

