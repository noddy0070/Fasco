import express from 'express';
import mongoose from 'mongoose';
import { Product } from '../model/product.model.ts';

/**
 * GET /api/products
 * Returns all active, non-deleted products.
 * Supports optional query params: `gender`, `isTrending`, `isLimitedOffer`.
 */
export const getProducts = async (req: express.Request, res: express.Response) => {
    try {
        const filter: Record<string, unknown> = {
            isActive: true,
            deletedAt: null,
        };

        if (req.query['gender']) filter['gender'] = req.query['gender'];
        if (req.query['isTrending'] === 'true') filter['isTrending'] = true;
        if (req.query['isLimitedOffer'] === 'true') filter['isLimitedOffer'] = true;

        const products = await Product.find(filter)
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug')
            .populate('brand', 'name logo')
            .lean();

        return res.status(200).json({ message: 'Products fetched successfully', data: products });
    } catch (err) {
        console.error('getProducts error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get a product by its database ID (includes full variants array)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the product
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     isTrending:
 *                       type: boolean
 *                     isLimitedOffer:
 *                       type: boolean
 *                     variants:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProductVariant'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
export const getProductById = async (req: express.Request, res: express.Response) => {
    try {
        const id = req.params['id'];
        let product = null;

        if (mongoose.Types.ObjectId.isValid(id)) {
            product = await Product.findOne({ _id: id, deletedAt: null })
                .populate('category', 'name slug')
                .populate('subCategory', 'name slug')
                .populate('brand', 'title logo')
                .lean();
        }

        if (!product) {
            product = await Product.findOne({ slug: id, deletedAt: null })
                .populate('category', 'name slug')
                .populate('subCategory', 'name slug')
                .populate('brand', 'title logo')
                .lean();
        }

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product fetched successfully', data: product });
    } catch (err) {
        console.error('getProductById error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * GET /api/products/slug/:slug
 * Returns a single product by its URL slug.
 */
export const getProductBySlug = async (req: express.Request, res: express.Response) => {
    try {
        const product = await Product.findOne({ slug: req.params['slug'], deletedAt: null })
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug')
            .populate('brand', 'name logo')
            .lean();

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product fetched successfully', data: product });
    } catch (err) {
        console.error('getProductBySlug error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
