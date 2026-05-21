import express from 'express';
import Product from '../../model/product.model.ts';

/**
 * GET /api/admin/products
 * Returns a paginated inventory list including soft-deleted entries.
 */
export const listProducts = async (req: express.Request, res: express.Response) => {
    try {
        const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string) || 20));
        const skip = (page - 1) * limit;
        const includeDeleted = req.query['includeDeleted'] === 'true';

        const filter = includeDeleted ? {} : { deletedAt: null };

        const [products, total] = await Promise.all([
            Product.find(filter).skip(skip).limit(limit).lean(),
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
 * Returns a single product by ID.
 */
export const getProduct = async (req: express.Request, res: express.Response) => {
    try {
        const product = await Product.findById(req.params['id']).lean();
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
 * @openapi
 * /api/admin/products:
 *   post:
 *     tags:
 *       - Admin / Products
 *     summary: Create a new product with one or more variants
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - variants
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               isTrending:
 *                 type: boolean
 *                 default: false
 *               isLimitedOffer:
 *                 type: boolean
 *                 default: false
 *               variants:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   $ref: '#/components/schemas/ProductVariant'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
export const createProduct = async (req: express.Request, res: express.Response) => {
    try {
        const { title, variants } = req.body as { title?: string; variants?: unknown[] };

        if (!title || !variants?.length) {
            return res.status(400).json({ message: 'title and at least one variant are required' });
        }

        const product = await Product.create(req.body);
        return res.status(201).json({ message: 'Product created successfully', data: product });
    } catch (err) {
        console.error('createProduct error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/admin/products/{id}:
 *   patch:
 *     tags:
 *       - Admin / Products
 *     summary: Update mutable fields on a product, including its variants array
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               isTrending:
 *                 type: boolean
 *               isLimitedOffer:
 *                 type: boolean
 *               variants:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ProductVariant'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
export const updateProduct = async (req: express.Request, res: express.Response) => {
    try {
        const forbidden = ['_id', 'deletedAt', 'createdAt', 'updatedAt'];
        const update: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(req.body as Record<string, unknown>)) {
            if (!forbidden.includes(key)) {
                update[key] = value;
            }
        }

        const product = await Product.findOneAndUpdate(
            { _id: req.params['id'], deletedAt: null },
            { $set: update },
            { new: true, runValidators: true },
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product updated successfully', data: product });
    } catch (err) {
        console.error('updateProduct error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * DELETE /api/admin/products/:id
 * Soft-deletes a product.
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
 * Restores a previously soft-deleted product.
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
