import express from 'express';
import Product from '../../model/product.model.ts';

type AdminRequest = express.Request & { admin?: { userId: string } };

const slugify = (title: string): string =>
    title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

const parseTags = (tags: unknown): string[] | undefined => {
    if (Array.isArray(tags)) {
        return tags.map((t) => String(t).trim()).filter(Boolean);
    }
    if (typeof tags === 'string') {
        const parsed = tags.split(',').map((t) => t.trim()).filter(Boolean);
        return parsed.length ? parsed : undefined;
    }
    return undefined;
};

const normalizeVariants = (variants: unknown): Record<string, unknown>[] | null => {
    if (!Array.isArray(variants) || variants.length === 0) return null;

    return variants.map((raw) => {
        const v = raw as Record<string, unknown>;
        const images =
            typeof v['images'] === 'string'
                ? v['images'].split(',').map((s) => s.trim()).filter(Boolean)
                : Array.isArray(v['images'])
                  ? v['images'].map(String).filter(Boolean)
                  : undefined;

        const variant: Record<string, unknown> = {
            sku: String(v['sku'] ?? '').trim(),
            price: Number(v['price']),
            discount: Number(v['discount'] ?? 0),
            stock: Number(v['stock']),
        };

        if (v['size']) variant['size'] = String(v['size']).trim();
        if (v['color']) variant['color'] = String(v['color']).trim();
        if (v['colorCode']) variant['colorCode'] = String(v['colorCode']).trim();
        if (images?.length) variant['images'] = images;

        return variant;
    });
};

const validateVariants = (variants: Record<string, unknown>[]): string | null => {
    for (let i = 0; i < variants.length; i++) {
        const v = variants[i]!;
        if (!v['sku']) return `Variant ${i + 1}: sku is required`;
        if (!Number.isFinite(v['price'] as number) || (v['price'] as number) < 0) {
            return `Variant ${i + 1}: valid price is required`;
        }
        if (!Number.isFinite(v['stock'] as number) || (v['stock'] as number) < 0) {
            return `Variant ${i + 1}: valid stock is required`;
        }
    }
    return null;
};

const buildProductPayload = (
    body: Record<string, unknown>,
    options: { isCreate: boolean; adminId?: string },
): Record<string, unknown> => {
    const forbidden = ['_id', 'deletedAt', 'createdAt', 'updatedAt', 'averageRating', 'totalReviews'];
    const payload: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(body)) {
        if (!forbidden.includes(key) && value !== undefined) {
            payload[key] = value;
        }
    }

    if (typeof payload['title'] === 'string') {
        payload['title'] = payload['title'].trim();
    }

    const slug = typeof payload['slug'] === 'string' ? payload['slug'].trim() : '';
    if (slug) {
        payload['slug'] = slug;
    } else if (payload['title']) {
        payload['slug'] = slugify(String(payload['title']));
    }

    for (const refKey of ['brand', 'category', 'subCategory']) {
        if (payload[refKey] === '' || payload[refKey] === null) {
            delete payload[refKey];
        }
    }

    if (payload['gender'] === '') delete payload['gender'];

    const tags = parseTags(payload['tags']);
    if (tags) payload['tags'] = tags;
    else delete payload['tags'];

    if (Array.isArray(payload['specifications'])) {
        payload['specifications'] = (payload['specifications'] as Record<string, unknown>[])
            .map((s) => ({
                title: String(s['title'] ?? '').trim(),
                value: String(s['value'] ?? '').trim(),
            }))
            .filter((s) => s.title || s.value);
    }

    const variants = normalizeVariants(payload['variants']);
    if (variants) payload['variants'] = variants;

    if (options.isCreate && options.adminId) {
        payload['createdBy'] = options.adminId;
    }
    if (!options.isCreate && options.adminId) {
        payload['updatedBy'] = options.adminId;
    }

    return payload;
};

const mongooseErrorMessage = (err: unknown): string | null => {
    const e = err as { code?: number; keyPattern?: Record<string, unknown>; message?: string };
    if (e.code === 11000) {
        if (e.keyPattern?.['slug']) return 'A product with this slug already exists';
        return 'Duplicate value violates a unique constraint';
    }
    if (e.message?.includes('validation failed')) return e.message;
    return null;
};

/**
 * GET /api/admin/products
 */
export const listProducts = async (req: express.Request, res: express.Response) => {
    try {
        const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string) || 20));
        const skip = (page - 1) * limit;
        const includeDeleted = req.query['includeDeleted'] === 'true';

        const filter = includeDeleted ? {} : { deletedAt: null };

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('brand', 'name')
                .populate('category', 'name')
                .lean(),
            Product.countDocuments(filter),
        ]);

        return res.status(200).json({
            message: 'Products fetched successfully',
            data: { products, total, page, limit },
        });
    } catch (err) {
        console.error('listProducts error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * GET /api/admin/products/:id
 */
export const getProduct = async (req: express.Request, res: express.Response) => {
    try {
        const product = await Product.findById(req.params['id'])
            .populate('brand', 'name')
            .populate('category', 'name')
            .populate('subCategory', 'name')
            .lean();

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(200).json({ message: 'Product fetched successfully', data: product });
    } catch (err) {
        console.error('getProduct error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * POST /api/admin/products
 */
export const createProduct = async (req: AdminRequest, res: express.Response) => {
    try {
        const body = req.body as Record<string, unknown>;
        const payload = buildProductPayload(body, {
            isCreate: true,
            adminId: req.admin?.userId,
        });

        if (!payload['title']) {
            return res.status(400).json({ message: 'title is required' });
        }

        const variants = payload['variants'] as Record<string, unknown>[] | undefined;
        if (!variants?.length) {
            return res.status(400).json({ message: 'At least one variant is required' });
        }

        const variantError = validateVariants(variants);
        if (variantError) {
            return res.status(400).json({ message: variantError });
        }

        const product = await Product.create(payload);
        return res.status(201).json({ message: 'Product created successfully', data: product });
    } catch (err) {
        console.error('createProduct error', err);
        const msg = mongooseErrorMessage(err);
        if (msg) return res.status(409).json({ message: msg });
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/admin/products/:id
 */
export const updateProduct = async (req: AdminRequest, res: express.Response) => {
    try {
        const payload = buildProductPayload(req.body as Record<string, unknown>, {
            isCreate: false,
            adminId: req.admin?.userId,
        });

        if (payload['variants']) {
            const variantError = validateVariants(payload['variants'] as Record<string, unknown>[]);
            if (variantError) {
                return res.status(400).json({ message: variantError });
            }
        }

        const product = await Product.findOneAndUpdate(
            { _id: req.params['id'], deletedAt: null },
            { $set: payload },
            { new: true, runValidators: true },
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product updated successfully', data: product });
    } catch (err) {
        console.error('updateProduct error', err);
        const msg = mongooseErrorMessage(err);
        if (msg) return res.status(409).json({ message: msg });
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * DELETE /api/admin/products/:id
 */
export const deleteProduct = async (req: express.Request, res: express.Response) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params['id'], deletedAt: null },
            { $set: { deletedAt: new Date() } },
            { new: true },
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('deleteProduct error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PATCH /api/admin/products/:id/restore
 */
export const restoreProduct = async (req: express.Request, res: express.Response) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params['id'], deletedAt: { $ne: null } },
            { $set: { deletedAt: null } },
            { new: true },
        );

        if (!product) {
            return res.status(404).json({ message: 'Deleted product not found' });
        }

        return res.status(200).json({ message: 'Product restored successfully', data: product });
    } catch (err) {
        console.error('restoreProduct error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
