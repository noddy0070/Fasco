/**
 * Tests for admin brand CRUD controller.
 * Mocks the Brand mongoose model.
 */
import request from 'supertest';
import express from 'express';
import { jest, describe, it, expect, afterEach } from '@jest/globals';

const mockFind = jest.fn();
const mockCreate = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();

jest.unstable_mockModule('../model/brand.model', () => ({
    Brand: {
        find: mockFind,
        create: mockCreate,
        findByIdAndUpdate: mockFindByIdAndUpdate,
        findByIdAndDelete: mockFindByIdAndDelete,
    },
}));

const { listBrands, createBrand, updateBrand, deleteBrand } = await import(
    '../controller/admin/admin-brand.controller'
);

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.get('/brands', listBrands);
    app.post('/brands', createBrand);
    app.patch('/brands/:id', updateBrand);
    app.delete('/brands/:id', deleteBrand);
    return app;
};

afterEach(() => {
    [mockFind, mockCreate, mockFindByIdAndUpdate, mockFindByIdAndDelete].forEach((m) =>
        m.mockReset(),
    );
});

// ── listBrands ────────────────────────────────────────────────────────────────
describe('GET /brands', () => {
    it('returns 200 with brand list', async () => {
        const fakeBrands = [{ _id: 'b1', title: 'Nike', slug: 'nike' }];
        mockFind.mockReturnValueOnce({ sort: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(fakeBrands) });

        const res = await request(buildApp()).get('/brands');
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
    });

    it('returns 500 on DB error', async () => {
        mockFind.mockReturnValueOnce({ sort: jest.fn().mockReturnThis(), lean: jest.fn().mockRejectedValue(new Error('DB error')) });

        const res = await request(buildApp()).get('/brands');
        expect(res.status).toBe(500);
    });
});

// ── createBrand ───────────────────────────────────────────────────────────────
describe('POST /brands', () => {
    it('returns 400 when title is missing', async () => {
        const res = await request(buildApp()).post('/brands').send({ slug: 'no-title' });
        expect(res.status).toBe(400);
    });

    it('creates a brand and returns 201', async () => {
        const fakeBrand = { _id: 'b1', title: 'Nike', slug: 'nike' };
        mockCreate.mockResolvedValueOnce(fakeBrand);

        const res = await request(buildApp()).post('/brands').send({ title: 'Nike' });
        expect(res.status).toBe(201);
        expect(res.body.data.slug).toBe('nike');
    });

    it('returns 409 on duplicate slug', async () => {
        mockCreate.mockRejectedValueOnce({ code: 11000 });

        const res = await request(buildApp()).post('/brands').send({ title: 'Nike' });
        expect(res.status).toBe(409);
    });

    it('returns 500 on unexpected DB error', async () => {
        mockCreate.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(buildApp()).post('/brands').send({ title: 'Nike' });
        expect(res.status).toBe(500);
    });
});

// ── updateBrand ───────────────────────────────────────────────────────────────
describe('PATCH /brands/:id', () => {
    it('returns 404 when brand not found', async () => {
        mockFindByIdAndUpdate.mockResolvedValueOnce(null);

        const res = await request(buildApp()).patch('/brands/nonexistent').send({ title: 'X' });
        expect(res.status).toBe(404);
    });

    it('updates brand and returns 200', async () => {
        const updated = { _id: 'b1', title: 'Updated Nike', slug: 'nike' };
        mockFindByIdAndUpdate.mockResolvedValueOnce(updated);

        const res = await request(buildApp()).patch('/brands/b1').send({ title: 'Updated Nike' });
        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe('Updated Nike');
    });

    it('returns 409 on duplicate slug during update', async () => {
        mockFindByIdAndUpdate.mockRejectedValueOnce({ code: 11000 });

        const res = await request(buildApp()).patch('/brands/b1').send({ slug: 'taken' });
        expect(res.status).toBe(409);
    });

    it('returns 500 on unexpected DB error during update', async () => {
        mockFindByIdAndUpdate.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(buildApp()).patch('/brands/b1').send({ title: 'Err' });
        expect(res.status).toBe(500);
    });
});

// ── deleteBrand ───────────────────────────────────────────────────────────────
describe('DELETE /brands/:id', () => {
    it('returns 404 when brand not found', async () => {
        mockFindByIdAndDelete.mockResolvedValueOnce(null);

        const res = await request(buildApp()).delete('/brands/nonexistent');
        expect(res.status).toBe(404);
    });

    it('deletes and returns 200', async () => {
        mockFindByIdAndDelete.mockResolvedValueOnce({ _id: 'b1' });

        const res = await request(buildApp()).delete('/brands/b1');
        expect(res.status).toBe(200);
    });

    it('returns 500 on DB error', async () => {
        mockFindByIdAndDelete.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(buildApp()).delete('/brands/b1');
        expect(res.status).toBe(500);
    });
});
