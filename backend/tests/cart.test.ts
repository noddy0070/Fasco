/**
 * Tests for cart controller (getCart, addToCart, updateCartItem, removeFromCart).
 */
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { jest, describe, it, expect, beforeAll, afterEach } from '@jest/globals';

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockResolveProduct = jest.fn();
const mockRecalculate = jest.fn().mockResolvedValue(undefined);
const mockCartFindOne = jest.fn();
const mockCartCreate = jest.fn();
const mockCartConstructorFn = jest.fn().mockImplementation(() => ({
    items: [] as unknown[],
    save: jest.fn().mockResolvedValue(undefined),
    user: 'uid1',
}));
Object.assign(mockCartConstructorFn, {
    findOne: mockCartFindOne,
    create: mockCartCreate,
});

jest.unstable_mockModule('../model/cart.model', () => ({
    Cart: mockCartConstructorFn,
}));
jest.unstable_mockModule('../utils/resolve-product.util', () => ({
    resolveProduct: mockResolveProduct,
}));
jest.unstable_mockModule('../utils/cart-totals.util', () => ({
    recalculateCartTotals: mockRecalculate,
}));

const { getCart, addToCart, updateCartItem, removeFromCart } = await import(
    '../controller/cart.controller'
);

const JWT_SECRET = 'test-secret';

const makeToken = (userId = 'uid1') =>
    jwt.sign({ userId, email: 'a@b.com', role: 'user' }, JWT_SECRET, { expiresIn: '1h' });

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

    app.get('/cart', getCart as any);
    app.post('/cart', addToCart as any);
    app.patch('/cart', updateCartItem as any);
    app.delete('/cart', removeFromCart as any);
    return app;
};

beforeAll(() => {
    process.env['JWT_SECRET'] = JWT_SECRET;
});

afterEach(() => {
    [mockResolveProduct, mockCartFindOne, mockCartCreate, mockRecalculate].forEach((m) =>
        m.mockReset(),
    );
    mockRecalculate.mockResolvedValue(undefined); // keep as no-op after reset
    Object.assign(mockCartConstructorFn, { findOne: mockCartFindOne, create: mockCartCreate });
});

// ── getCart ───────────────────────────────────────────────────────────────────
describe('GET /cart', () => {
    it('returns existing cart', async () => {
        const fakeCart = { _id: 'c1', items: [] };
        mockCartFindOne.mockReturnValueOnce({
            populate: jest.fn().mockResolvedValue(fakeCart),
        });

        const res = await request(buildApp())
            .get('/cart')
            .set('Cookie', `token=${makeToken()}`);
        expect(res.status).toBe(200);
        expect(res.body.data._id).toBe('c1');
    });

    it('creates a new cart when none exists', async () => {
        mockCartFindOne.mockReturnValueOnce({
            populate: jest.fn().mockResolvedValue(null),
        });
        mockCartCreate.mockResolvedValueOnce({ _id: 'c-new', items: [] });

        const res = await request(buildApp())
            .get('/cart')
            .set('Cookie', `token=${makeToken()}`);
        expect(res.status).toBe(200);
        expect(mockCartCreate).toHaveBeenCalledTimes(1);
    });
});

// ── addToCart ─────────────────────────────────────────────────────────────────
describe('POST /cart', () => {
    it('returns 400 when productId or variantSku is missing', async () => {
        const res = await request(buildApp())
            .post('/cart')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'p1' }); // missing variantSku
        expect(res.status).toBe(400);
    });

    it('returns 404 when product is not found', async () => {
        mockResolveProduct.mockResolvedValueOnce(null);

        const res = await request(buildApp())
            .post('/cart')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'p1', variantSku: 'S1' });
        expect(res.status).toBe(404);
    });

    it('returns 400 when variant is not on the product', async () => {
        mockResolveProduct.mockResolvedValueOnce({
            _id: 'pid1',
            deletedAt: null,
            variants: [{ sku: 'OTHER', stock: 5 }],
        });

        const res = await request(buildApp())
            .post('/cart')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'pid1', variantSku: 'MISSING' });
        expect(res.status).toBe(400);
    });

    it('returns 400 when stock is insufficient', async () => {
        mockResolveProduct.mockResolvedValueOnce({
            _id: 'pid1',
            deletedAt: null,
            variants: [{ sku: 'S1', stock: 1 }],
        });

        const res = await request(buildApp())
            .post('/cart')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'pid1', variantSku: 'S1', quantity: 10 });
        expect(res.status).toBe(400);
    });

    it('adds item and returns 200', async () => {
        const product = {
            _id: { toString: () => 'pid1' },
            title: 'T-Shirt',
            slug: 't-shirt',
            deletedAt: null,
            variants: [{ sku: 'S1', stock: 10, price: 100, discount: 0, images: [] }],
        };
        mockResolveProduct.mockResolvedValueOnce(product);

        const cartDoc = {
            items: [] as unknown[],
            save: jest.fn().mockResolvedValue(undefined),
            push: undefined as unknown,
        };
        cartDoc.push = (item: unknown) => { cartDoc.items.push(item); };

        mockCartFindOne
            .mockResolvedValueOnce(cartDoc)  // plain findOne in addToCart
            .mockReturnValueOnce({ populate: jest.fn().mockResolvedValue({ _id: 'c1', items: [] }) }); // populateCart at end

        const res = await request(buildApp())
            .post('/cart')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'pid1', variantSku: 'S1', quantity: 2 });
        expect(res.status).toBe(200);
    });
});

// ── updateCartItem ────────────────────────────────────────────────────────────
describe('PATCH /cart', () => {
    it('returns 400 when fields are missing', async () => {
        const res = await request(buildApp())
            .patch('/cart')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'p1' });
        expect(res.status).toBe(400);
    });

    it('returns 404 when cart not found', async () => {
        mockCartFindOne.mockResolvedValueOnce(null);

        const res = await request(buildApp())
            .patch('/cart')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'p1', variantSku: 'S1', quantity: 2 });
        expect(res.status).toBe(404);
    });

    it('returns 404 when product not found', async () => {
        mockCartFindOne.mockResolvedValueOnce({ items: [] });
        mockResolveProduct.mockResolvedValueOnce(null);

        const res = await request(buildApp())
            .patch('/cart')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'p1', variantSku: 'S1', quantity: 2 });
        expect(res.status).toBe(404);
    });

    it('returns 400 when variant is not on product', async () => {
        mockCartFindOne.mockResolvedValueOnce({ items: [] });
        mockResolveProduct.mockResolvedValueOnce({
            _id: { toString: () => 'pid1' },
            variants: [{ sku: 'OTHER', stock: 5 }],
        });

        const res = await request(buildApp())
            .patch('/cart')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'pid1', variantSku: 'S1', quantity: 2 });
        expect(res.status).toBe(400);
    });

    it('returns 404 when item not in cart', async () => {
        mockCartFindOne.mockResolvedValueOnce({
            items: [],
            save: jest.fn().mockResolvedValue(undefined),
        });
        mockResolveProduct.mockResolvedValueOnce({
            _id: { toString: () => 'pid1' },
            variants: [{ sku: 'S1', stock: 10 }],
        });

        const res = await request(buildApp())
            .patch('/cart')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'pid1', variantSku: 'S1', quantity: 2 });
        expect(res.status).toBe(404);
    });

    it('removes item from cart when quantity is 0', async () => {
        const product = { _id: { toString: () => 'pid1' }, variants: [{ sku: 'S1', stock: 10 }] };
        const cartDoc = {
            items: [{ product: { toString: () => 'pid1' }, variantSku: 'S1', quantity: 2 }] as unknown[],
            save: jest.fn().mockResolvedValue(undefined),
        };
        mockCartFindOne
            .mockResolvedValueOnce(cartDoc)   // updateCartItem findOne
            .mockReturnValueOnce({ populate: jest.fn().mockResolvedValue({ _id: 'c1', items: [] }) }); // populateCart
        mockResolveProduct.mockResolvedValueOnce(product);

        const res = await request(buildApp())
            .patch('/cart')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'pid1', variantSku: 'S1', quantity: 0 });
        expect(res.status).toBe(200);
    });

    it('updates item quantity and returns 200', async () => {
        const product = { _id: { toString: () => 'pid1' }, variants: [{ sku: 'S1', stock: 10 }] };
        const item = { product: { toString: () => 'pid1' }, variantSku: 'S1', quantity: 1 };
        const cartDoc = {
            items: [item],
            save: jest.fn().mockResolvedValue(undefined),
        };
        mockCartFindOne
            .mockResolvedValueOnce(cartDoc)
            .mockReturnValueOnce({ populate: jest.fn().mockResolvedValue({ _id: 'c1', items: [item] }) });
        mockResolveProduct.mockResolvedValueOnce(product);

        const res = await request(buildApp())
            .patch('/cart')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'pid1', variantSku: 'S1', quantity: 5 });
        expect(res.status).toBe(200);
    });
});

// ── removeFromCart ────────────────────────────────────────────────────────────
describe('DELETE /cart', () => {
    it('returns 400 when fields are missing', async () => {
        const res = await request(buildApp())
            .delete('/cart')
            .set('Cookie', `token=${makeToken()}`)
            .send({});
        expect(res.status).toBe(400);
    });

    it('returns 404 when product not found', async () => {
        mockResolveProduct.mockResolvedValueOnce(null);

        const res = await request(buildApp())
            .delete('/cart')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'p1', variantSku: 'S1' });
        expect(res.status).toBe(404);
    });

    it('returns 404 when cart not found', async () => {
        mockResolveProduct.mockResolvedValueOnce({ _id: { toString: () => 'p1' } });
        mockCartFindOne.mockResolvedValueOnce(null);

        const res = await request(buildApp())
            .delete('/cart')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'p1', variantSku: 'S1' });
        expect(res.status).toBe(404);
    });

    it('removes item and returns 200', async () => {
        const product = { _id: { toString: () => 'pid1' } };
        const cartDoc = {
            items: [{ product: { toString: () => 'pid1' }, variantSku: 'S1' }] as unknown[],
            save: jest.fn().mockResolvedValue(undefined),
        };
        mockResolveProduct.mockResolvedValueOnce(product);
        mockCartFindOne
            .mockResolvedValueOnce(cartDoc)
            .mockReturnValueOnce({ populate: jest.fn().mockResolvedValue({ _id: 'c1', items: [] }) });

        const res = await request(buildApp())
            .delete('/cart')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'pid1', variantSku: 'S1' });
        expect(res.status).toBe(200);
    });
});
