import express from 'express';
import {
    getProducts,
    getProductById,
    getProductBySlug,
} from '../controller/product.controller.ts';

const router = express.Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all active products
 *     parameters:
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [men, women, kids, unisex]
 *         description: Filter by gender
 *       - in: query
 *         name: isTrending
 *         schema:
 *           type: boolean
 *         description: Filter trending products
 *       - in: query
 *         name: isLimitedOffer
 *         schema:
 *           type: boolean
 *         description: Filter limited-offer products
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */
router.get('/', getProducts);

/**
 * @openapi
 * /api/products/slug/{slug}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get a product by its URL slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
router.get('/slug/:slug', getProductBySlug);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get a product by its database ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
router.get('/:id', getProductById);

export default router;
