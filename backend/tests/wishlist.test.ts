/**
 * Tests for wishlist controller (getWishlist, addToWishlist, removeFromWishlist).
 * Mocks Wishlist model and resolveProduct utility.
 */
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { jest, describe, it, expect, beforeAll, afterEach } from '@jest/globals';

// ── Mock setup ────────────────────────────────────────────────────────────────
const mockResolveProduct = jest.fn();
const mockWishlistFindOne = jest.fn();
const mockWishlistCreate = jest.fn();

// Wishlist constructor mock for `new Wishlist(...)`
const mockWishlistConstructorFn = jest.fn().mockImplementation(() => ({
    items: [] as unknown[],
    save: jest.fn().mockResolvedValue(undefined),
    user: 'uid1',
}));
Object.assign(mockWishlistConstructorFn, {
    findOne: mockWishlistFindOne,
    create: mockWishlistCreate,
});

jest.unstable_mockModule('../model/wishlist.model', () => ({
    Wishlist: mockWishlistConstructorFn,
}));
jest.unstable_mockModule('../utils/resolve-product.util', () => ({
    resolveProduct: mockResolveProduct,
}));

const { getWishlist, addToWishlist, removeFromWishlist } = await import(
    '../controller/wishlist.controller'
);

const JWT_SECRET = 'test-secret';

const makeToken = (userId = 'uid1') =>
    jwt.sign({ userId, email: 'a@b.com', role: 'user' }, JWT_SECRET, { expiresIn: '1h' });

const buildApp = () => {
    const app = express();
    app.use(express.json());

    // Inject req.user like auth.middleware would
    app.use((req: any, _res, next) => {
        const cookie = req.headers.cookie as string | undefined;
        if (cookie?.includes('token=')) {
            const token = cookie.split('token=')[1].split(';')[0];
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
                req.user = { userId: decoded.userId };
            } catch {
                // ignore
            }
        }
        next();
    });

    app.get('/wishlist', getWishlist as any);
    app.post('/wishlist', addToWishlist as any);
    app.delete('/wishlist', removeFromWishlist as any);
    return app;
};

beforeAll(() => {
    process.env['JWT_SECRET'] = JWT_SECRET;
});

afterEach(() => {
    [mockResolveProduct, mockWishlistFindOne, mockWishlistCreate].forEach((m) =>
        m.mockReset(),
    );
    mockWishlistConstructorFn.mockClear();
    mockWishlistConstructorFn.mockImplementation(() => ({
        items: [] as unknown[],
        save: jest.fn().mockResolvedValue(undefined),
        user: 'uid1',
    }));
    // Re-add the static methods after reset
    Object.assign(mockWishlistConstructorFn, {
        findOne: mockWishlistFindOne,
        create: mockWishlistCreate,
    });
});

// ── getWishlist ───────────────────────────────────────────────────────────────
describe('GET /wishlist', () => {
    it('returns existing wishlist when found', async () => {
        const fakeWishlist = { _id: 'wid1', items: [] };
        mockWishlistFindOne.mockReturnValueOnce({
            populate: jest.fn().mockResolvedValue(fakeWishlist),
        });

        const res = await request(buildApp())
            .get('/wishlist')
            .set('Cookie', `token=${makeToken()}`);
        expect(res.status).toBe(200);
        expect(res.body.data._id).toBe('wid1');
    });

    it('creates an empty wishlist when none exists', async () => {
        // First call (populateWishlist) returns null
        mockWishlistFindOne.mockReturnValueOnce({
            populate: jest.fn().mockResolvedValue(null),
        });
        const newWishlist = { _id: 'wid-new', items: [] };
        mockWishlistCreate.mockResolvedValueOnce(newWishlist);

        const res = await request(buildApp())
            .get('/wishlist')
            .set('Cookie', `token=${makeToken()}`);
        expect(res.status).toBe(200);
        expect(mockWishlistCreate).toHaveBeenCalledTimes(1);
    });

    it('returns 500 on DB error', async () => {
        mockWishlistFindOne.mockReturnValueOnce({
            populate: jest.fn().mockRejectedValue(new Error('DB error')),
        });

        const res = await request(buildApp())
            .get('/wishlist')
            .set('Cookie', `token=${makeToken()}`);
        expect(res.status).toBe(500);
    });
});

// ── addToWishlist ─────────────────────────────────────────────────────────────
describe('POST /wishlist', () => {
    it('returns 400 when productId or variantSku is missing', async () => {
        const res = await request(buildApp())
            .post('/wishlist')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'p1' }); // missing variantSku
        expect(res.status).toBe(400);
    });

    it('returns 404 when product is not found', async () => {
        mockResolveProduct.mockResolvedValueOnce(null);

        const res = await request(buildApp())
            .post('/wishlist')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'p1', variantSku: 'SKU1' });
        expect(res.status).toBe(404);
    });

    it('returns 400 when variant SKU does not exist on the product', async () => {
        mockResolveProduct.mockResolvedValueOnce({
            _id: 'pid1',
            deletedAt: null,
            variants: [{ sku: 'OTHER_SKU' }],
        });

        const res = await request(buildApp())
            .post('/wishlist')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'pid1', variantSku: 'MISSING_SKU' });
        expect(res.status).toBe(400);
    });

    it('creates a new Wishlist doc when none exists for the user (addToWishlist branch)', async () => {
        const product = {
            _id: { toString: () => 'pid1' },
            deletedAt: null,
            variants: [{ sku: 'S1' }],
        };
        mockResolveProduct.mockResolvedValueOnce(product);

        // Plain findOne in addToWishlist returns null → triggers new Wishlist(...)
        mockWishlistFindOne
            .mockResolvedValueOnce(null)   // addToWishlist plain findOne
            .mockReturnValueOnce({ populate: jest.fn().mockResolvedValue({ _id: 'wid-new', items: [] }) }); // populateWishlist at end

        const res = await request(buildApp())
            .post('/wishlist')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'pid1', variantSku: 'S1' });
        expect(res.status).toBe(200);
        expect(mockWishlistConstructorFn).toHaveBeenCalled();
    });

    it('skips push when item is already in the wishlist', async () => {
        const product = {
            _id: { toString: () => 'pid1' },
            deletedAt: null,
            variants: [{ sku: 'S1' }],
        };
        mockResolveProduct.mockResolvedValueOnce(product);

        const existingWishlist = {
            items: [{ product: { toString: () => 'pid1' }, variantSku: 'S1' }] as unknown[],
            save: jest.fn().mockResolvedValue(undefined),
        };
        mockWishlistFindOne
            .mockResolvedValueOnce(existingWishlist)  // plain findOne — item exists
            .mockReturnValueOnce({ populate: jest.fn().mockResolvedValue({ _id: 'wid1', items: existingWishlist.items }) });

        const res = await request(buildApp())
            .post('/wishlist')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'pid1', variantSku: 'S1' });
        expect(res.status).toBe(200);
        expect(existingWishlist.save).not.toHaveBeenCalled(); // skipped save
    });

    it('adds item and returns 200', async () => {
        const product = {
            _id: { toString: () => 'pid1' },
            deletedAt: null,
            variants: [{ sku: 'S1' }],
        };
        mockResolveProduct.mockResolvedValueOnce(product);

        const existingWishlist = {
            items: [] as unknown[],
            save: jest.fn().mockResolvedValue(undefined),
            push: undefined as unknown,
        };
        existingWishlist.push = (item: unknown) => {
            existingWishlist.items.push(item);
        };

        // findOne for addToWishlist (plain, no populate)
        mockWishlistFindOne
            .mockResolvedValueOnce(existingWishlist)          // plain findOne in addToWishlist
            .mockReturnValueOnce({ populate: jest.fn().mockResolvedValue({ _id: 'wid1', items: [] }) }); // populateWishlist at end

        const res = await request(buildApp())
            .post('/wishlist')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'pid1', variantSku: 'S1' });
        expect(res.status).toBe(200);
    });

    it('returns 500 on DB error in addToWishlist', async () => {
        mockResolveProduct.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(buildApp())
            .post('/wishlist')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'pid1', variantSku: 'S1' });
        expect(res.status).toBe(500);
    });
});
describe('DELETE /wishlist', () => {
    it('returns 400 when required fields are missing', async () => {
        const res = await request(buildApp())
            .delete('/wishlist')
            .set('Cookie', `token=${makeToken()}`)
            .send({});
        expect(res.status).toBe(400);
    });

    it('returns 404 when product is not found', async () => {
        mockResolveProduct.mockResolvedValueOnce(null);

        const res = await request(buildApp())
            .delete('/wishlist')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'bad', variantSku: 'S1' });
        expect(res.status).toBe(404);
    });

    it('returns 404 when wishlist is not found', async () => {
        mockResolveProduct.mockResolvedValueOnce({ _id: { toString: () => 'p1' } });
        mockWishlistFindOne.mockResolvedValueOnce(null);

        const res = await request(buildApp())
            .delete('/wishlist')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'p1', variantSku: 'S1' });
        expect(res.status).toBe(404);
    });

    it('removes item from wishlist and returns 200', async () => {
        const product = { _id: { toString: () => 'pid1' } };
        const wishlistDoc = {
            items: [{ product: { toString: () => 'pid1' }, variantSku: 'S1' }] as unknown[],
            save: jest.fn().mockResolvedValue(undefined),
        };
        mockResolveProduct.mockResolvedValueOnce(product);
        mockWishlistFindOne
            .mockResolvedValueOnce(wishlistDoc)  // plain findOne in removeFromWishlist
            .mockReturnValueOnce({ populate: jest.fn().mockResolvedValue({ _id: 'wid1', items: [] }) }); // populateWishlist

        const res = await request(buildApp())
            .delete('/wishlist')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'pid1', variantSku: 'S1' });
        expect(res.status).toBe(200);
    });

    it('returns 500 on DB error in removeFromWishlist', async () => {
        mockResolveProduct.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(buildApp())
            .delete('/wishlist')
            .set('Cookie', `token=${makeToken()}`)
            .send({ productId: 'pid1', variantSku: 'S1' });
        expect(res.status).toBe(500);
    });
});
