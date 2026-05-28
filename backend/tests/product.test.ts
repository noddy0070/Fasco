/**
 * Tests for public product controller (getProducts, getProductById, getProductBySlug).
 */
import request from 'supertest';
import express from 'express';
import { jest, describe, it, expect, afterEach } from '@jest/globals';

const mockFind = jest.fn();
const mockFindOne = jest.fn();
const mockCountDocuments = jest.fn();

jest.unstable_mockModule('../model/product.model', () => ({
    Product: {
        find: mockFind,
        findOne: mockFindOne,
        countDocuments: mockCountDocuments,
    },
}));

const { getProducts, getProductById, getProductBySlug } = await import(
    '../controller/product.controller'
);

const buildApp = () => {
    const app = express();
    app.get('/products', getProducts);
    app.get('/products/:id', getProductById);
    app.get('/products/slug/:slug', getProductBySlug);
    return app;
};

afterEach(() => {
    [mockFind, mockFindOne, mockCountDocuments].forEach((m) => m.mockReset());
});

// ── getProducts ───────────────────────────────────────────────────────────────
describe('GET /products', () => {
    const makeChain = (products: unknown[]) =>
        mockFind.mockReturnValueOnce({
            populate: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(products),
        });

    it('returns 200 with paginated product list', async () => {
        const fakeProducts = [{ _id: 'p1', title: 'T-shirt' }];
        makeChain(fakeProducts);
        mockCountDocuments.mockResolvedValueOnce(1);

        const res = await request(buildApp()).get('/products');
        expect(res.status).toBe(200);
        expect(res.body.data.products).toHaveLength(1);
        expect(res.body.data.total).toBe(1);
    });

    it('applies gender filter when provided', async () => {
        makeChain([]);
        mockCountDocuments.mockResolvedValueOnce(0);

        const res = await request(buildApp()).get('/products?gender=men');
        expect(res.status).toBe(200);
        expect(mockFind).toHaveBeenCalledWith(expect.objectContaining({ gender: 'men' }));
    });

    it('applies isTrending filter', async () => {
        makeChain([]);
        mockCountDocuments.mockResolvedValueOnce(0);

        const res = await request(buildApp()).get('/products?isTrending=true');
        expect(res.status).toBe(200);
        expect(mockFind).toHaveBeenCalledWith(expect.objectContaining({ isTrending: true }));
    });
});

// ── getProductById ────────────────────────────────────────────────────────────
describe('GET /products/:id', () => {
    const makeChainFindOne = (result: unknown) =>
        mockFindOne.mockReturnValueOnce({
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(result),
        });

    it('returns 200 when product is found by ObjectId', async () => {
        const fakeProduct = { _id: '507f1f77bcf86cd799439011', title: 'T-shirt' };
        makeChainFindOne(fakeProduct);

        const res = await request(buildApp()).get('/products/507f1f77bcf86cd799439011');
        expect(res.status).toBe(200);
        expect(res.body.data._id).toBe('507f1f77bcf86cd799439011');
    });

    it('falls back to slug lookup and returns 200', async () => {
        // non-ObjectId => skips _id query, tries slug
        const fakeProduct = { _id: 'p1', title: 'Overalls', slug: 'overalls' };
        makeChainFindOne(fakeProduct);

        const res = await request(buildApp()).get('/products/overalls');
        expect(res.status).toBe(200);
    });

    it('returns 404 when product does not exist', async () => {
        // ObjectId lookup returns null, slug lookup also returns null
        makeChainFindOne(null);
        makeChainFindOne(null);

        const res = await request(buildApp()).get('/products/507f1f77bcf86cd799439011');
        expect(res.status).toBe(404);
    });
});

// ── getProductBySlug ──────────────────────────────────────────────────────────
describe('GET /products/slug/:slug', () => {
    it('returns 200 when product is found by slug', async () => {
        const fakeProduct = { _id: 'p1', slug: 'cool-shirt' };
        mockFindOne.mockReturnValueOnce({
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(fakeProduct),
        });

        const res = await request(buildApp()).get('/products/slug/cool-shirt');
        expect(res.status).toBe(200);
    });

    it('returns 404 when product not found by slug', async () => {
        mockFindOne.mockReturnValueOnce({
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(null),
        });

        const res = await request(buildApp()).get('/products/slug/missing-slug');
        expect(res.status).toBe(404);
    });
});
