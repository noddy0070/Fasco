/**
 * Tests for public order controller (getMyOrders, checkout).
 */
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { jest, describe, it, expect, beforeAll, afterEach } from '@jest/globals';

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockOrderFind = jest.fn();
const mockOrderCreate = jest.fn();
const mockOrderCountDocuments = jest.fn();
const mockCartFindOne = jest.fn();
const mockCartFindOneAndUpdate = jest.fn();
const mockUserFindByIdAndUpdate = jest.fn();
const mockProductFind = jest.fn();
const mockProductBulkWrite = jest.fn().mockResolvedValue({});

jest.unstable_mockModule('../model/orders.model', () => ({
    Order: {
        find: mockOrderFind,
        create: mockOrderCreate,
        countDocuments: mockOrderCountDocuments,
    },
}));
jest.unstable_mockModule('../model/cart.model', () => ({
    Cart: {
        findOne: mockCartFindOne,
        findOneAndUpdate: mockCartFindOneAndUpdate,
    },
}));
jest.unstable_mockModule('../model/user.model', () => ({
    default: { findByIdAndUpdate: mockUserFindByIdAndUpdate },
}));
jest.unstable_mockModule('../model/product.model', () => ({
    default: {
        find: mockProductFind,
        bulkWrite: mockProductBulkWrite,
    },
}));

const { getMyOrders, checkout } = await import('../controller/order.controller');

const JWT_SECRET = 'test-secret';
const makeToken = (userId = 'uid1') =>
    jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

const buildApp = () => {
    const app = express();
    app.use(express.json());

    app.use((req: any, _res, next) => {
        const cookie = req.headers.cookie as string | undefined;
        if (cookie?.includes('token=')) {
            const token = cookie.split('token=')[1].split(';')[0];
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
                req.user = { userId: decoded.userId };
            } catch { /** ignore */ }
        }
        next();
    });

    app.get('/orders', getMyOrders as any);
    app.post('/orders/checkout', checkout as any);
    return app;
};

beforeAll(() => {
    process.env['JWT_SECRET'] = JWT_SECRET;
});

afterEach(() => {
    [
        mockOrderFind, mockOrderCreate, mockOrderCountDocuments,
        mockCartFindOne, mockCartFindOneAndUpdate,
        mockUserFindByIdAndUpdate, mockProductFind, mockProductBulkWrite,
    ].forEach((m) => m.mockReset());
    mockProductBulkWrite.mockResolvedValue({});
});

// ── getMyOrders ───────────────────────────────────────────────────────────────
describe('GET /orders', () => {
    it('returns 200 with paginated orders', async () => {
        mockOrderFind.mockReturnValueOnce({
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([{ _id: 'o1' }]),
        });
        mockOrderCountDocuments.mockResolvedValueOnce(1);

        const res = await request(buildApp())
            .get('/orders')
            .set('Cookie', `token=${makeToken()}`);
        expect(res.status).toBe(200);
        expect(res.body.data.total).toBe(1);
    });
});

// ── checkout ──────────────────────────────────────────────────────────────────
describe('POST /orders/checkout', () => {
    const validShipping = {
        fullName: 'John Doe',
        phone: '9999999999',
        pincode: '110001',
        state: 'Delhi',
        city: 'New Delhi',
        addressLine1: '123 Street',
    };

    it('returns 400 when paymentMethod is missing', async () => {
        const res = await request(buildApp())
            .post('/orders/checkout')
            .set('Cookie', `token=${makeToken()}`)
            .send({ shippingAddress: validShipping });
        expect(res.status).toBe(400);
    });

    it('returns 400 when paymentMethod is invalid', async () => {
        const res = await request(buildApp())
            .post('/orders/checkout')
            .set('Cookie', `token=${makeToken()}`)
            .send({ paymentMethod: 'bitcoin', shippingAddress: validShipping });
        expect(res.status).toBe(400);
    });

    it('returns 400 when shippingAddress is incomplete', async () => {
        const res = await request(buildApp())
            .post('/orders/checkout')
            .set('Cookie', `token=${makeToken()}`)
            .send({
                paymentMethod: 'cod',
                shippingAddress: { fullName: 'John' }, // missing required fields
            });
        expect(res.status).toBe(400);
    });

    it('returns 400 when neither items nor cart is provided', async () => {
        const res = await request(buildApp())
            .post('/orders/checkout')
            .set('Cookie', `token=${makeToken()}`)
            .send({ paymentMethod: 'cod', shippingAddress: validShipping });
        expect(res.status).toBe(400);
    });

    it('returns 400 when useCart=true and cart is empty', async () => {
        mockCartFindOne.mockResolvedValueOnce({ items: [] });

        const res = await request(buildApp())
            .post('/orders/checkout')
            .set('Cookie', `token=${makeToken()}`)
            .send({ paymentMethod: 'cod', shippingAddress: validShipping, useCart: true });
        expect(res.status).toBe(400);
    });

    it('places order from direct items and returns 201', async () => {
        const product = {
            _id: { toString: () => '507f1f77bcf86cd799439011' },
            title: 'T-Shirt',
            slug: 't-shirt',
            deletedAt: null,
            variants: [{ sku: 'S1', price: 500, discount: 0, stock: 10, images: [] }],
        };
        mockProductFind.mockResolvedValueOnce([product]);

        const order = { _id: 'ord1', totalAmount: 549 };
        mockOrderCreate.mockResolvedValueOnce(order);
        mockUserFindByIdAndUpdate.mockResolvedValueOnce({});

        const res = await request(buildApp())
            .post('/orders/checkout')
            .set('Cookie', `token=${makeToken()}`)
            .send({
                paymentMethod: 'cod',
                shippingAddress: validShipping,
                items: [{ productId: '507f1f77bcf86cd799439011', variantSku: 'S1', quantity: 1 }],
            });
        expect(res.status).toBe(201);
        expect(res.body.data._id).toBe('ord1');
    });
});
