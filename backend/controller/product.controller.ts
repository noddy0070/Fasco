import express from 'express';
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
 * GET /api/products/:id
 * Returns a single product by its Mongoose _id.
 */
export const getProductById = async (req: express.Request, res: express.Response) => {
    try {
        const product = await Product.findOne({ _id: req.params['id'], deletedAt: null })
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug')
            .populate('brand', 'name logo')
            .lean();

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
