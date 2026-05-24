import express from 'express';
import { CollectionPage } from '../../model/collection-page.model.ts';
import { toSlug, inferProductFilter } from '../../utils/slug.util.ts';
import type { CollectionPromoI, CollectionTabI } from '../../model.interfaces/collection-page.interface.ts';

const normalizeTabs = (tabs: unknown): CollectionTabI[] => {
    if (!Array.isArray(tabs)) return [];
    return tabs
        .map((t) => {
            const row = t as Record<string, unknown>;
            const label = String(row['label'] ?? '').trim();
            const slug = String(row['slug'] ?? '').trim();
            return label && slug ? { label, slug } : null;
        })
        .filter((t): t is CollectionTabI => t !== null);
};

const normalizePromo = (promo: unknown): CollectionPromoI => {
    const p = (promo ?? {}) as Record<string, unknown>;
    const actions = Array.isArray(p['actions'])
        ? p['actions']
              .map((a) => {
                  const row = a as Record<string, unknown>;
                  const label = String(row['label'] ?? '').trim();
                  const slug = String(row['slug'] ?? '').trim();
                  return label && slug ? { label, slug } : null;
              })
              .filter((a): a is { label: string; slug: string } => a !== null)
        : [];

    return {
        eyebrow: String(p['eyebrow'] ?? '').trim(),
        title: String(p['title'] ?? '').trim(),
        description: String(p['description'] ?? '').trim(),
        actions,
    };
};

const normalizeSortOptions = (options: unknown): string[] => {
    if (Array.isArray(options)) {
        return options.map((o) => String(o).trim()).filter(Boolean);
    }
    if (typeof options === 'string') {
        return options
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean);
    }
    return ['Featured'];
};

const buildPayload = (body: Record<string, unknown>) => {
    const title = String(body['title'] ?? '').trim();
    const slugInput = String(body['slug'] ?? '').trim();
    const slug = slugInput || (title ? toSlug(title) : '');

    return {
        slug,
        eyebrow: String(body['eyebrow'] ?? '').trim(),
        title,
        description: String(body['description'] ?? '').trim(),
        heroImage: String(body['heroImage'] ?? '').trim(),
        tabs: normalizeTabs(body['tabs']),
        sortOptions: normalizeSortOptions(body['sortOptions']),
        promo: normalizePromo(body['promo']),
        productFilter: body['productFilter'] ?? (slug ? inferProductFilter(slug) : 'all'),
        isActive: body['isActive'] !== false,
        displayOrder: Number(body['displayOrder'] ?? 0),
    };
};

export const listAdminCollections = async (_req: express.Request, res: express.Response) => {
    try {
        const collections = await CollectionPage.find().sort({ displayOrder: 1, createdAt: 1 }).lean();
        return res.status(200).json({ message: 'Collections fetched successfully', data: collections });
    } catch (err) {
        console.error('listAdminCollections error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAdminCollection = async (req: express.Request, res: express.Response) => {
    try {
        const collection = await CollectionPage.findById(req.params['id']).lean();
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }
        return res.status(200).json({ message: 'Collection fetched successfully', data: collection });
    } catch (err) {
        console.error('getAdminCollection error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const createCollection = async (req: express.Request, res: express.Response) => {
    try {
        const payload = buildPayload(req.body as Record<string, unknown>);
        if (!payload.title || !payload.slug) {
            return res.status(400).json({ message: 'title is required' });
        }

        const collection = await CollectionPage.create(payload);
        return res.status(201).json({ message: 'Collection created successfully', data: collection });
    } catch (err) {
        console.error('createCollection error', err);
        const e = err as { code?: number };
        if (e.code === 11000) {
            return res.status(409).json({ message: 'A collection with this slug already exists' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateCollection = async (req: express.Request, res: express.Response) => {
    try {
        const payload = buildPayload(req.body as Record<string, unknown>);
        const collection = await CollectionPage.findByIdAndUpdate(
            req.params['id'],
            { $set: payload },
            { new: true, runValidators: true },
        );

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        return res.status(200).json({ message: 'Collection updated successfully', data: collection });
    } catch (err) {
        console.error('updateCollection error', err);
        const e = err as { code?: number };
        if (e.code === 11000) {
            return res.status(409).json({ message: 'A collection with this slug already exists' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteCollection = async (req: express.Request, res: express.Response) => {
    try {
        const collection = await CollectionPage.findByIdAndDelete(req.params['id']);
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }
        return res.status(200).json({ message: 'Collection deleted successfully' });
    } catch (err) {
        console.error('deleteCollection error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
