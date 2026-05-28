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

router.get('/', requireRole(inventoryRoles), listProducts);
router.get('/:id', requireRole(inventoryRoles), getProduct);
router.post('/', requireRole(inventoryRoles), createProduct);
router.patch('/:id', requireRole(inventoryRoles), updateProduct);
router.delete('/:id', requireRole(inventoryRoles), deleteProduct);
router.patch('/:id/restore', requireRole(inventoryRoles), restoreProduct);

export default router;
