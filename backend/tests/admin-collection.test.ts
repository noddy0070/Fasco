/**
 * Tests for admin collection controller (CRUD).
 */
import request from 'supertest';
import express from 'express';
import { jest, describe, it, expect, afterEach } from '@jest/globals';

const mockFind = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();

jest.unstable_mockModule('../model/collection-page.model', () => ({
    CollectionPage: {
        find: mockFind,
        findById: mockFindById,
        create: mockCreate,
        findByIdAndUpdate: mockFindByIdAndUpdate,
        findByIdAndDelete: mockFindByIdAndDelete,
    },
}));

const {
    listAdminCollections,
    getAdminCollection,
    createCollection,
    updateCollection,
    deleteCollection,
} = await import('../controller/admin/admin-collection.controller');

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.get('/collections', listAdminCollections);
    app.get('/collections/:id', getAdminCollection);
    app.post('/collections', createCollection);
    app.patch('/collections/:id', updateCollection);
    app.delete('/collections/:id', deleteCollection);
    return app;
};

afterEach(() => {
    [mockFind, mockFindById, mockCreate, mockFindByIdAndUpdate, mockFindByIdAndDelete].forEach(
        (m) => m.mockReset(),
    );
});

// ── listAdminCollections ──────────────────────────────────────────────────────
describe('GET /collections', () => {
    it('returns 200 with all collections', async () => {
        const fakeCollections = [{ _id: 'col1', slug: 'men', title: 'Men' }];
        mockFind.mockReturnValueOnce({
            sort: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(fakeCollections),
        });

        const res = await request(buildApp()).get('/collections');
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
    });

    it('returns 500 on DB error', async () => {
        mockFind.mockReturnValueOnce({
            sort: jest.fn().mockReturnThis(),
            lean: jest.fn().mockRejectedValue(new Error('DB error')),
        });

        const res = await request(buildApp()).get('/collections');
        expect(res.status).toBe(500);
    });
});

// ── getAdminCollection ────────────────────────────────────────────────────────
describe('GET /collections/:id', () => {
    it('returns 200 when found', async () => {
        mockFindById.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValue({ _id: 'col1', title: 'Men' }),
        });

        const res = await request(buildApp()).get('/collections/col1');
        expect(res.status).toBe(200);
    });

    it('returns 404 when not found', async () => {
        mockFindById.mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(null) });

        const res = await request(buildApp()).get('/collections/nonexistent');
        expect(res.status).toBe(404);
    });

    it('returns 500 on DB error', async () => {
        mockFindById.mockReturnValueOnce({
            lean: jest.fn().mockRejectedValue(new Error('DB error')),
        });

        const res = await request(buildApp()).get('/collections/col1');
        expect(res.status).toBe(500);
    });
});

// ── createCollection ──────────────────────────────────────────────────────────
describe('POST /collections', () => {
    it('returns 400 when title is missing', async () => {
        const res = await request(buildApp()).post('/collections').send({ slug: 'men' });
        expect(res.status).toBe(400);
    });

    it('creates collection and returns 201', async () => {
        const fakeCollection = { _id: 'col1', slug: 'men', title: 'Men' };
        mockCreate.mockResolvedValueOnce(fakeCollection);

        const res = await request(buildApp())
            .post('/collections')
            .send({ title: 'Men', slug: 'men' });
        expect(res.status).toBe(201);
        expect(res.body.data.slug).toBe('men');
    });

    it('auto-generates slug from title when slug not provided', async () => {
        const fakeCollection = { _id: 'col1', slug: 'summer-sale', title: 'Summer Sale' };
        mockCreate.mockResolvedValueOnce(fakeCollection);

        const res = await request(buildApp()).post('/collections').send({ title: 'Summer Sale' });
        expect(res.status).toBe(201);
    });

    it('returns 409 on duplicate slug', async () => {
        mockCreate.mockRejectedValueOnce({ code: 11000 });

        const res = await request(buildApp())
            .post('/collections')
            .send({ title: 'Men', slug: 'men' });
        expect(res.status).toBe(409);
    });
});

// ── updateCollection ──────────────────────────────────────────────────────────
describe('PATCH /collections/:id', () => {
    it('returns 404 when not found', async () => {
        mockFindByIdAndUpdate.mockResolvedValueOnce(null);

        const res = await request(buildApp()).patch('/collections/nonexistent').send({ title: 'X' });
        expect(res.status).toBe(404);
    });

    it('updates and returns 200', async () => {
        const updated = { _id: 'col1', slug: 'men', title: 'Men Updated' };
        mockFindByIdAndUpdate.mockResolvedValueOnce(updated);

        const res = await request(buildApp())
            .patch('/collections/col1')
            .send({ title: 'Men Updated' });
        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe('Men Updated');
    });

    it('returns 409 on duplicate slug during update', async () => {
        mockFindByIdAndUpdate.mockRejectedValueOnce({ code: 11000 });

        const res = await request(buildApp())
            .patch('/collections/col1')
            .send({ title: 'Men', slug: 'men' });
        expect(res.status).toBe(409);
    });

    it('returns 500 on unexpected error during update', async () => {
        mockFindByIdAndUpdate.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(buildApp())
            .patch('/collections/col1')
            .send({ title: 'Men' });
        expect(res.status).toBe(500);
    });

    it('exercises normalizeTabs and normalizePromo helpers when creating with rich body', async () => {
        const fakeCollection = { _id: 'col2', slug: 'women', title: 'Women' };
        mockCreate.mockResolvedValueOnce(fakeCollection);

        const res = await request(buildApp())
            .post('/collections')
            .send({
                title: 'Women',
                slug: 'women',
                tabs: [
                    { label: 'New In', slug: 'new-in' },
                    { label: '', slug: 'no-label' }, // filtered out (missing label)
                    'bad-tab',                       // non-object filtered out
                ],
                promo: {
                    eyebrow: 'Special',
                    title: 'Sale',
                    description: 'Big sale',
                    actions: [
                        { label: 'Shop Now', slug: 'shop-now' },
                        { label: '', slug: 'no-label' },  // filtered out
                    ],
                },
                sortOptions: ['Featured', 'Price: Low to High'],
                displayOrder: 1,
                isActive: true,
            });
        expect(res.status).toBe(201);
    });

    it('exercises normalizeSortOptions with a comma-separated string', async () => {
        const fakeCollection = { _id: 'col3', slug: 'sale', title: 'Sale' };
        mockCreate.mockResolvedValueOnce(fakeCollection);

        const res = await request(buildApp())
            .post('/collections')
            .send({
                title: 'Sale',
                slug: 'sale',
                sortOptions: 'Featured, Price: Low to High, Newest',
            });
        expect(res.status).toBe(201);
    });

    it('returns 500 on unexpected error during create', async () => {
        mockCreate.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(buildApp())
            .post('/collections')
            .send({ title: 'Err', slug: 'err' });
        expect(res.status).toBe(500);
    });
});

// ── deleteCollection ──────────────────────────────────────────────────────────
describe('DELETE /collections/:id', () => {
    it('returns 404 when not found', async () => {
        mockFindByIdAndDelete.mockResolvedValueOnce(null);

        const res = await request(buildApp()).delete('/collections/nonexistent');
        expect(res.status).toBe(404);
    });

    it('deletes and returns 200', async () => {
        mockFindByIdAndDelete.mockResolvedValueOnce({ _id: 'col1' });

        const res = await request(buildApp()).delete('/collections/col1');
        expect(res.status).toBe(200);
    });

    it('returns 500 on DB error', async () => {
        mockFindByIdAndDelete.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(buildApp()).delete('/collections/col1');
        expect(res.status).toBe(500);
    });
});
