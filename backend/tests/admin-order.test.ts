/**
 * Tests for admin order controller (listOrders, getOrder, updateOrderStatus).
 */
import request from 'supertest';
import express from 'express';
import { jest, describe, it, expect, afterEach } from '@jest/globals';

const mockFind = jest.fn();
const mockFindById = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockCountDocuments = jest.fn();

jest.unstable_mockModule('../model/orders.model', () => ({
    default: {
        find: mockFind,
        findById: mockFindById,
        findByIdAndUpdate: mockFindByIdAndUpdate,
        countDocuments: mockCountDocuments,
    },
}));

const { listOrders, getOrder, updateOrderStatus } = await import(
    '../controller/admin/admin-order.controller'
);

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.get('/orders', listOrders);
    app.get('/orders/:id', getOrder);
    app.patch('/orders/:id/status', updateOrderStatus);
    return app;
};

afterEach(() => {
    [mockFind, mockFindById, mockFindByIdAndUpdate, mockCountDocuments].forEach((m) =>
        m.mockReset(),
    );
});

// ── listOrders ────────────────────────────────────────────────────────────────
describe('GET /orders', () => {
    it('returns 200 with paginated order list', async () => {
        const fakeOrders = [{ _id: 'o1', orderStatus: 'pending' }];
        mockFind.mockReturnValueOnce({
            populate: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(fakeOrders),
        });
        mockCountDocuments.mockResolvedValueOnce(1);

        const res = await request(buildApp()).get('/orders');
        expect(res.status).toBe(200);
        expect(res.body.data.orders).toHaveLength(1);
    });

    it('applies status filter when a valid status is provided', async () => {
        mockFind.mockReturnValueOnce({
            populate: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([]),
        });
        mockCountDocuments.mockResolvedValueOnce(0);

        const res = await request(buildApp()).get('/orders?status=delivered');
        expect(res.status).toBe(200);
        expect(mockFind).toHaveBeenCalledWith(expect.objectContaining({ orderStatus: 'delivered' }));
    });

    it('ignores invalid status filter', async () => {
        mockFind.mockReturnValueOnce({
            populate: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([]),
        });
        mockCountDocuments.mockResolvedValueOnce(0);

        const res = await request(buildApp()).get('/orders?status=nonexistent');
        expect(res.status).toBe(200);
        // filter should NOT include orderStatus for invalid values
        expect(mockFind).toHaveBeenCalledWith({});
    });

    it('returns 500 on DB error', async () => {
        mockFind.mockReturnValueOnce({
            populate: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockRejectedValue(new Error('DB error')),
        });

        const res = await request(buildApp()).get('/orders');
        expect(res.status).toBe(500);
    });
});

// ── getOrder ──────────────────────────────────────────────────────────────────
describe('GET /orders/:id', () => {
    it('returns 200 with order data', async () => {
        const fakeOrder = { _id: 'o1', orderStatus: 'pending' };
        mockFindById.mockReturnValueOnce({
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(fakeOrder),
        });

        const res = await request(buildApp()).get('/orders/o1');
        expect(res.status).toBe(200);
        expect(res.body.data._id).toBe('o1');
    });

    it('returns 404 when order not found', async () => {
        mockFindById.mockReturnValueOnce({
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(null),
        });

        const res = await request(buildApp()).get('/orders/nonexistent');
        expect(res.status).toBe(404);
    });

    it('returns 500 on DB error', async () => {
        mockFindById.mockReturnValueOnce({
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockRejectedValue(new Error('DB error')),
        });

        const res = await request(buildApp()).get('/orders/o1');
        expect(res.status).toBe(500);
    });
});

// ── updateOrderStatus ─────────────────────────────────────────────────────────
describe('PATCH /orders/:id/status', () => {
    it('returns 400 when status is missing', async () => {
        const res = await request(buildApp())
            .patch('/orders/o1/status')
            .send({});
        expect(res.status).toBe(400);
    });

    it('returns 400 when status is invalid', async () => {
        const res = await request(buildApp())
            .patch('/orders/o1/status')
            .send({ status: 'not-a-real-status' });
        expect(res.status).toBe(400);
    });

    it('returns 404 when order not found', async () => {
        mockFindByIdAndUpdate.mockResolvedValueOnce(null);

        const res = await request(buildApp())
            .patch('/orders/nonexistent/status')
            .send({ status: 'delivered' });
        expect(res.status).toBe(404);
    });

    it('updates status and returns 200', async () => {
        const updated = { _id: 'o1', orderStatus: 'delivered' };
        mockFindByIdAndUpdate.mockResolvedValueOnce(updated);

        const res = await request(buildApp())
            .patch('/orders/o1/status')
            .send({ status: 'delivered', trackingId: 'TRK123' });
        expect(res.status).toBe(200);
        expect(res.body.data.orderStatus).toBe('delivered');
    });

    it('returns 500 on DB error', async () => {
        mockFindByIdAndUpdate.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(buildApp())
            .patch('/orders/o1/status')
            .send({ status: 'delivered' });
        expect(res.status).toBe(500);
    });
});
