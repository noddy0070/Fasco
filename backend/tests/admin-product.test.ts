/**
 * Tests for admin product controller (listProducts, getProduct, createProduct, updateProduct, deleteProduct, restoreProduct).
 */
import request from 'supertest';
import express from 'express';
import { jest, describe, it, expect, afterEach } from '@jest/globals';

const mockFind = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockFindOneAndUpdate = jest.fn();
const mockCountDocuments = jest.fn();

jest.unstable_mockModule('../model/product.model', () => ({
    default: {
        find: mockFind,
        findById: mockFindById,
        create: mockCreate,
        findOneAndUpdate: mockFindOneAndUpdate,
        countDocuments: mockCountDocuments,
    },
}));

const { listProducts, getProduct, createProduct, updateProduct, deleteProduct, restoreProduct } =
    await import('../controller/admin/admin-product.controller');

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.get('/products', listProducts);
    app.get('/products/:id', getProduct);
    app.post('/products', createProduct);
    app.patch('/products/:id', updateProduct);
    app.delete('/products/:id', deleteProduct);
    app.patch('/products/:id/restore', restoreProduct);
    return app;
};

afterEach(() => {
    [mockFind, mockFindById, mockCreate, mockFindOneAndUpdate, mockCountDocuments].forEach((m) =>
        m.mockReset(),
    );
});

// ── listProducts ──────────────────────────────────────────────────────────────
describe('GET /products', () => {
    it('returns 200 with product list', async () => {
        mockFind.mockReturnValueOnce({
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([{ _id: 'p1', title: 'T-Shirt' }]),
        });
        mockCountDocuments.mockResolvedValueOnce(1);

        const res = await request(buildApp()).get('/products');
        expect(res.status).toBe(200);
        expect(res.body.data.products).toHaveLength(1);
    });
});

// ── getProduct ────────────────────────────────────────────────────────────────
describe('GET /products/:id', () => {
    it('returns 200 with product', async () => {
        mockFindById.mockReturnValueOnce({
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue({ _id: 'p1', title: 'T-Shirt' }),
        });

        const res = await request(buildApp()).get('/products/p1');
        expect(res.status).toBe(200);
    });

    it('returns 404 when product not found', async () => {
        mockFindById.mockReturnValueOnce({
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(null),
        });

        const res = await request(buildApp()).get('/products/nonexistent');
        expect(res.status).toBe(404);
    });
});

// ── createProduct ─────────────────────────────────────────────────────────────
describe('POST /products', () => {
    it('returns 400 when title is missing', async () => {
        const res = await request(buildApp()).post('/products').send({
            variants: [{ sku: 'S1', price: 100, stock: 10 }],
        });
        expect(res.status).toBe(400);
    });

    it('returns 400 when variants are missing', async () => {
        const res = await request(buildApp()).post('/products').send({ title: 'T-Shirt' });
        expect(res.status).toBe(400);
    });

    it('returns 400 when a variant has invalid sku', async () => {
        const res = await request(buildApp())
            .post('/products')
            .send({ title: 'T-Shirt', variants: [{ sku: '', price: 100, stock: 10 }] });
        expect(res.status).toBe(400);
    });

    it('returns 400 when a variant has negative price', async () => {
        const res = await request(buildApp())
            .post('/products')
            .send({ title: 'T-Shirt', variants: [{ sku: 'S1', price: -5, stock: 10 }] });
        expect(res.status).toBe(400);
    });

    it('creates product and returns 201', async () => {
        const fakeProduct = { _id: 'p1', title: 'T-Shirt', slug: 't-shirt' };
        mockCreate.mockResolvedValueOnce(fakeProduct);

        const res = await request(buildApp())
            .post('/products')
            .send({ title: 'T-Shirt', variants: [{ sku: 'S1', price: 100, stock: 5 }] });
        expect(res.status).toBe(201);
        expect(res.body.data.title).toBe('T-Shirt');
    });

    it('returns 409 on duplicate slug', async () => {
        mockCreate.mockRejectedValueOnce({ code: 11000, keyPattern: { slug: 1 } });

        const res = await request(buildApp())
            .post('/products')
            .send({ title: 'T-Shirt', variants: [{ sku: 'S1', price: 100, stock: 5 }] });
        expect(res.status).toBe(409);
    });
});

// ── updateProduct ─────────────────────────────────────────────────────────────
describe('PATCH /products/:id', () => {
    it('returns 404 when product not found', async () => {
        mockFindOneAndUpdate.mockResolvedValueOnce(null);

        const res = await request(buildApp()).patch('/products/nonexistent').send({ title: 'X' });
        expect(res.status).toBe(404);
    });

    it('returns 200 on successful update', async () => {
        mockFindOneAndUpdate.mockResolvedValueOnce({ _id: 'p1', title: 'Updated' });

        const res = await request(buildApp()).patch('/products/p1').send({ title: 'Updated' });
        expect(res.status).toBe(200);
    });
});

// ── deleteProduct ─────────────────────────────────────────────────────────────
describe('DELETE /products/:id', () => {
    it('returns 404 when product not found', async () => {
        mockFindOneAndUpdate.mockResolvedValueOnce(null);

        const res = await request(buildApp()).delete('/products/nonexistent');
        expect(res.status).toBe(404);
    });

    it('soft-deletes product and returns 200', async () => {
        mockFindOneAndUpdate.mockResolvedValueOnce({ _id: 'p1', deletedAt: new Date() });

        const res = await request(buildApp()).delete('/products/p1');
        expect(res.status).toBe(200);
    });
});

// ── restoreProduct ────────────────────────────────────────────────────────────
describe('PATCH /products/:id/restore', () => {
    it('returns 404 when deleted product not found', async () => {
        mockFindOneAndUpdate.mockResolvedValueOnce(null);

        const res = await request(buildApp()).patch('/products/nonexistent/restore');
        expect(res.status).toBe(404);
    });

    it('restores product and returns 200', async () => {
        mockFindOneAndUpdate.mockResolvedValueOnce({ _id: 'p1', deletedAt: null });

        const res = await request(buildApp()).patch('/products/p1/restore');
        expect(res.status).toBe(200);
    });
});
