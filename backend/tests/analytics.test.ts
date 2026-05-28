/**
 * Tests for admin analytics controller.
 * Mocks Order.aggregate, User.countDocuments, Product.countDocuments.
 */
import request from 'supertest';
import express from 'express';
import { jest, describe, it, expect, afterEach } from '@jest/globals';

const mockOrderCountDocuments = jest.fn();
const mockOrderAggregate = jest.fn();
const mockUserCountDocuments = jest.fn();
const mockProductCountDocuments = jest.fn();

jest.unstable_mockModule('../model/orders.model', () => ({
    default: {
        countDocuments: mockOrderCountDocuments,
        aggregate: mockOrderAggregate,
    },
}));
jest.unstable_mockModule('../model/user.model', () => ({
    default: { countDocuments: mockUserCountDocuments },
}));
jest.unstable_mockModule('../model/product.model', () => ({
    default: { countDocuments: mockProductCountDocuments },
}));

const { getOverview, getRevenueChart, getOrderStatusBreakdown, getTopProducts } = await import(
    '../controller/admin/admin-analytics.controller'
);

const buildApp = () => {
    const app = express();
    app.get('/analytics/overview', getOverview);
    app.get('/analytics/revenue', getRevenueChart);
    app.get('/analytics/order-status', getOrderStatusBreakdown);
    app.get('/analytics/top-products', getTopProducts);
    return app;
};

afterEach(() => {
    [
        mockOrderCountDocuments,
        mockOrderAggregate,
        mockUserCountDocuments,
        mockProductCountDocuments,
    ].forEach((m) => m.mockReset());
});

// ── getOverview ───────────────────────────────────────────────────────────────
describe('GET /analytics/overview', () => {
    it('returns 200 with KPI data', async () => {
        mockUserCountDocuments.mockResolvedValueOnce(100);
        mockProductCountDocuments.mockResolvedValueOnce(50);
        mockOrderCountDocuments.mockResolvedValueOnce(200);
        mockOrderAggregate.mockResolvedValueOnce([{ _id: null, total: 99999 }]);

        const res = await request(buildApp()).get('/analytics/overview');
        expect(res.status).toBe(200);
        expect(res.body.data.totalUsers).toBe(100);
        expect(res.body.data.totalRevenue).toBe(99999);
    });

    it('returns totalRevenue 0 when no paid orders exist', async () => {
        mockUserCountDocuments.mockResolvedValueOnce(0);
        mockProductCountDocuments.mockResolvedValueOnce(0);
        mockOrderCountDocuments.mockResolvedValueOnce(0);
        mockOrderAggregate.mockResolvedValueOnce([]); // empty result

        const res = await request(buildApp()).get('/analytics/overview');
        expect(res.status).toBe(200);
        expect(res.body.data.totalRevenue).toBe(0);
    });
});

// ── getRevenueChart ───────────────────────────────────────────────────────────
describe('GET /analytics/revenue', () => {
    it('returns 200 with daily revenue data', async () => {
        const data = [
            { date: '2026-05-01', revenue: 500, orders: 5 },
            { date: '2026-05-02', revenue: 800, orders: 8 },
        ];
        mockOrderAggregate.mockResolvedValueOnce(data);

        const res = await request(buildApp()).get('/analytics/revenue');
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
    });
});

// ── getOrderStatusBreakdown ───────────────────────────────────────────────────
describe('GET /analytics/order-status', () => {
    it('returns 200 with order status breakdown', async () => {
        mockOrderAggregate.mockResolvedValueOnce([
            { status: 'delivered', count: 50 },
            { status: 'pending', count: 10 },
        ]);

        const res = await request(buildApp()).get('/analytics/order-status');
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
    });
});

// ── getTopProducts ────────────────────────────────────────────────────────────
describe('GET /analytics/top-products', () => {
    it('returns 200 with top 10 products', async () => {
        const products = Array.from({ length: 10 }, (_, i) => ({
            productId: `p${i}`,
            title: `Product ${i}`,
            totalSold: 100 - i * 5,
            revenue: 9999,
        }));
        mockOrderAggregate.mockResolvedValueOnce(products);

        const res = await request(buildApp()).get('/analytics/top-products');
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(10);
    });

    it('returns 500 on DB error', async () => {
        mockOrderAggregate.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(buildApp()).get('/analytics/top-products');
        expect(res.status).toBe(500);
    });
});

// ── error paths ───────────────────────────────────────────────────────────────
describe('GET /analytics/overview - error', () => {
    it('returns 500 on DB error', async () => {
        mockUserCountDocuments.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(buildApp()).get('/analytics/overview');
        expect(res.status).toBe(500);
    });
});

describe('GET /analytics/revenue - error', () => {
    it('returns 500 on DB error', async () => {
        mockOrderAggregate.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(buildApp()).get('/analytics/revenue');
        expect(res.status).toBe(500);
    });
});

describe('GET /analytics/order-status - error', () => {
    it('returns 500 on DB error', async () => {
        mockOrderAggregate.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(buildApp()).get('/analytics/order-status');
        expect(res.status).toBe(500);
    });
});
