import express from 'express';
import { CollectionPage } from '../model/collection-page.model.ts';

const toPublicShape = (doc: Record<string, unknown>) => ({
    slug: doc['slug'],
    eyebrow: doc['eyebrow'],
    title: doc['title'],
    description: doc['description'],
    heroImage: doc['heroImage'],
    tabs: doc['tabs'] ?? [],
    sortOptions: doc['sortOptions'] ?? [],
    promo: doc['promo'] ?? { eyebrow: '', title: '', description: '', actions: [] },
    productFilter: doc['productFilter'] ?? 'all',
});

export const listCollections = async (_req: express.Request, res: express.Response) => {
    try {
        const collections = await CollectionPage.find({ isActive: true })
            .sort({ displayOrder: 1, createdAt: 1 })
            .lean();

        return res.status(200).json({
            message: 'Collections fetched successfully',
            data: collections.map((c) => toPublicShape(c as unknown as Record<string, unknown>)),
        });
    } catch (err) {
        console.error('listCollections error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCollectionBySlug = async (req: express.Request, res: express.Response) => {
    try {
        const collection = await CollectionPage.findOne({
            slug: req.params['slug'],
            isActive: true,
        }).lean();

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        return res.status(200).json({
            message: 'Collection fetched successfully',
            data: toPublicShape(collection as unknown as Record<string, unknown>),
        });
    } catch (err) {
        console.error('getCollectionBySlug error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
