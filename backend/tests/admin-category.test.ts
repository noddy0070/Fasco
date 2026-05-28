/**
 * Tests for admin category CRUD controller.
 */
import request from 'supertest';
import express from 'express';
import { jest, describe, it, expect, afterEach } from '@jest/globals';

const mockFind = jest.fn();
const mockCreate = jest.fn();
const mockFindById = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockCountDocuments = jest.fn();

jest.unstable_mockModule('../model/category.model', () => ({
    Category: {
        find: mockFind,
        create: mockCreate,
        findById: mockFindById,
        findByIdAndUpdate: mockFindByIdAndUpdate,
        countDocuments: mockCountDocuments,
    },
}));

const { listCategories, createCategory, updateCategory, deleteCategory } = await import(
    '../controller/admin/admin-category.controller'
);

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.get('/categories', listCategories);
    app.post('/categories', createCategory);
    app.patch('/categories/:id', updateCategory);
    app.delete('/categories/:id', deleteCategory);
    return app;
};

afterEach(() => {
    [mockFind, mockCreate, mockFindById, mockFindByIdAndUpdate, mockCountDocuments].forEach((m) =>
        m.mockReset(),
    );
});

// ── listCategories ────────────────────────────────────────────────────────────
describe('GET /categories', () => {
    it('returns 200 with all categories', async () => {
        mockFind.mockReturnValueOnce({
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([{ _id: 'c1', name: 'Men', level: 'main' }]),
        });

        const res = await request(buildApp()).get('/categories');
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
    });

    it('returns 400 for an invalid level query param', async () => {
        const res = await request(buildApp()).get('/categories?level=invalid');
        expect(res.status).toBe(400);
    });

    it('filters by level query param', async () => {
        mockFind.mockReturnValueOnce({
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([]),
        });

        const res = await request(buildApp()).get('/categories?level=main');
        expect(res.status).toBe(200);
        expect(mockFind).toHaveBeenCalledWith(expect.objectContaining({ level: 'main' }));
    });
});

// ── createCategory ────────────────────────────────────────────────────────────
describe('POST /categories', () => {
    it('returns 400 when name is missing', async () => {
        const res = await request(buildApp()).post('/categories').send({ level: 'main' });
        expect(res.status).toBe(400);
    });

    it('returns 400 when level is missing or invalid', async () => {
        const res = await request(buildApp()).post('/categories').send({ name: 'Test', level: 'bad' });
        expect(res.status).toBe(400);
    });

    it('returns 400 when sub category has no parent', async () => {
        const res = await request(buildApp())
            .post('/categories')
            .send({ name: 'Shirts', level: 'sub' });
        expect(res.status).toBe(400);
    });

    it('returns 400 when main category has a parent', async () => {
        const res = await request(buildApp())
            .post('/categories')
            .send({ name: 'Men', level: 'main', parent: 'some-parent' });
        expect(res.status).toBe(400);
    });

    it('creates a main category and returns 201', async () => {
        const cat = { _id: 'c1', name: 'Men', level: 'main', slug: 'men' };
        mockCreate.mockResolvedValueOnce(cat);

        const res = await request(buildApp())
            .post('/categories')
            .send({ name: 'Men', level: 'main' });
        expect(res.status).toBe(201);
        expect(res.body.data.name).toBe('Men');
    });

    it('returns 409 on duplicate slug', async () => {
        mockCreate.mockRejectedValueOnce({ code: 11000 });

        const res = await request(buildApp())
            .post('/categories')
            .send({ name: 'Men', level: 'main' });
        expect(res.status).toBe(409);
    });
});

// ── updateCategory ────────────────────────────────────────────────────────────
describe('PATCH /categories/:id', () => {
    it('returns 404 when category not found', async () => {
        mockFindById.mockResolvedValueOnce(null);

        const res = await request(buildApp()).patch('/categories/nonexistent').send({ name: 'X' });
        expect(res.status).toBe(404);
    });

    it('updates and returns 200', async () => {
        mockFindById.mockResolvedValueOnce({ _id: 'c1', level: 'main' });
        mockFindByIdAndUpdate.mockReturnValueOnce({
            populate: jest.fn().mockResolvedValue({ _id: 'c1', name: 'Updated Men' }),
        });

        const res = await request(buildApp()).patch('/categories/c1').send({ name: 'Updated Men' });
        expect(res.status).toBe(200);
    });
});

// ── deleteCategory ────────────────────────────────────────────────────────────
describe('DELETE /categories/:id', () => {
    it('returns 404 when category not found', async () => {
        mockFindById.mockResolvedValueOnce(null);

        const res = await request(buildApp()).delete('/categories/nonexistent');
        expect(res.status).toBe(404);
    });

    it('returns 400 when main category has sub-categories', async () => {
        mockFindById.mockResolvedValueOnce({ _id: 'c1', level: 'main' });
        mockCountDocuments.mockResolvedValueOnce(3);

        const res = await request(buildApp()).delete('/categories/c1');
        expect(res.status).toBe(400);
    });

    it('deletes a main category with no children and returns 200', async () => {
        const fakeCat = { _id: 'c1', level: 'main', deleteOne: jest.fn().mockResolvedValue({}) };
        mockFindById.mockResolvedValueOnce(fakeCat);
        mockCountDocuments.mockResolvedValueOnce(0);

        const res = await request(buildApp()).delete('/categories/c1');
        expect(res.status).toBe(200);
    });

    it('deletes a sub category directly (no children check)', async () => {
        const fakeCat = { _id: 'c2', level: 'sub', deleteOne: jest.fn().mockResolvedValue({}) };
        mockFindById.mockResolvedValueOnce(fakeCat);

        const res = await request(buildApp()).delete('/categories/c2');
        expect(res.status).toBe(200);
        expect(mockCountDocuments).not.toHaveBeenCalled();
    });
});
