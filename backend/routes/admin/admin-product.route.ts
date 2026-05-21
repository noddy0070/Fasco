import express from 'express';
import { requireRole } from '../../middleware/rbac.middleware.ts';
import { adminRole } from '../../model.interfaces/customEnum.ts';
import {
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
} from '../../controller/admin/admin-product.controller.ts';

const router = express.Router();

const inventoryRoles = [adminRole.SUPER_ADMIN, adminRole.INVENTORY_MANAGEMENT];

/**
 * @openapi
 * /api/admin/products:
 *   get:
 *     tags:
 *       - Admin Products
 *     summary: List all products (paginated, supports deleted filter)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Products list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', requireRole(inventoryRoles), listProducts);

/**
 * @openapi
 * /api/admin/products/{id}:
 *   get:
 *     tags:
 *       - Admin Products
 *     summary: Get a single product by ID
 *     security:
 *       - cookieAuth: []
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
router.get('/:id', requireRole(inventoryRoles), getProduct);

/**
 * @openapi
 * /api/admin/products:
 *   post:
 *     tags:
 *       - Admin Products
 *     summary: Create a new product
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, variants]
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Validation error
 */
router.post('/', requireRole(inventoryRoles), createProduct);

/**
 * @openapi
 * /api/admin/products/{id}:
 *   patch:
 *     tags:
 *       - Admin Products
 *     summary: Update a product
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */
router.patch('/:id', requireRole(inventoryRoles), updateProduct);

/**
 * @openapi
 * /api/admin/products/{id}:
 *   delete:
 *     tags:
 *       - Admin Products
 *     summary: Soft-delete a product
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
router.delete('/:id', requireRole(inventoryRoles), deleteProduct);

/**
 * @openapi
 * /api/admin/products/{id}/restore:
 *   patch:
 *     tags:
 *       - Admin Products
 *     summary: Restore a soft-deleted product
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product restored
 *       404:
 *         description: Deleted product not found
 */
router.patch('/:id/restore', requireRole(inventoryRoles), restoreProduct);

export default router;
