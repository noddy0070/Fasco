/**
 * Tests for public collection endpoints (listCollections, getCollectionBySlug).
 */
import request from 'supertest';
import express from 'express';
import { jest, describe, it, expect, afterEach } from '@jest/globals';

const mockFind = jest.fn();
const mockFindOne = jest.fn();

jest.unstable_mockModule('../model/collection-page.model', () => ({
    CollectionPage: { find: mockFind, findOne: mockFindOne },
}));

const { listCollections, getCollectionBySlug } = await import('../controller/collection.controller');

const buildApp = () => {
    const app = express();
    app.get('/collections', listCollections);
    app.get('/collections/:slug', getCollectionBySlug);
    return app;
};

afterEach(() => {
    mockFind.mockReset();
    mockFindOne.mockReset();
});

// ── listCollections ───────────────────────────────────────────────────────────
describe('GET /collections', () => {
    it('returns 200 with all active collections', async () => {
        const fakeCollections = [
            {
                slug: 'men',
                eyebrow: 'New',
                title: 'Men',
                description: '',
                heroImage: '',
                tabs: [],
                sortOptions: [],
                promo: { eyebrow: '', title: '', description: '', actions: [] },
                productFilter: 'men',
            },
        ];
        mockFind.mockReturnValueOnce({
            sort: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(fakeCollections),
        });

        const res = await request(buildApp()).get('/collections');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
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

// ── getCollectionBySlug ───────────────────────────────────────────────────────
describe('GET /collections/:slug', () => {
    it('returns 404 when collection is not found', async () => {
        mockFindOne.mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(null) });

        const res = await request(buildApp()).get('/collections/not-a-slug');
        expect(res.status).toBe(404);
    });

    it('returns 200 with collection data when found', async () => {
        const fakeCollection = {
            slug: 'men',
            eyebrow: 'New',
            title: 'Men',
            description: '',
            heroImage: '',
            tabs: [],
            sortOptions: [],
            promo: { eyebrow: '', title: '', description: '', actions: [] },
            productFilter: 'men',
        };
        mockFindOne.mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(fakeCollection) });

        const res = await request(buildApp()).get('/collections/men');
        expect(res.status).toBe(200);
        expect(res.body.data.slug).toBe('men');
    });

    it('returns 500 on DB error', async () => {
        mockFindOne.mockReturnValueOnce({ lean: jest.fn().mockRejectedValue(new Error('DB error')) });

        const res = await request(buildApp()).get('/collections/men');
        expect(res.status).toBe(500);
    });
});
