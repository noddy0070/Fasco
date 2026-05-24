import express from 'express';
import { requireRole } from '../../middleware/rbac.middleware.ts';
import { adminRole } from '../../model.interfaces/customEnum.ts';
import {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../../controller/admin/admin-category.controller.ts';

const router = express.Router();
const catalogRoles = [adminRole.SUPER_ADMIN, adminRole.INVENTORY_MANAGEMENT];

router.get('/', requireRole(catalogRoles), listCategories);
router.post('/', requireRole(catalogRoles), createCategory);
router.patch('/:id', requireRole(catalogRoles), updateCategory);
router.delete('/:id', requireRole(catalogRoles), deleteCategory);

export default router;
