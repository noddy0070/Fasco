import express from 'express';
import { requireRole } from '../../middleware/rbac.middleware.ts';
import { adminRole } from '../../model.interfaces/customEnum.ts';
import {
    listBrands,
    createBrand,
    updateBrand,
    deleteBrand,
} from '../../controller/admin/admin-brand.controller.ts';

const router = express.Router();
const catalogRoles = [adminRole.SUPER_ADMIN, adminRole.INVENTORY_MANAGEMENT];

router.get('/', requireRole(catalogRoles), listBrands);
router.post('/', requireRole(catalogRoles), createBrand);
router.patch('/:id', requireRole(catalogRoles), updateBrand);
router.delete('/:id', requireRole(catalogRoles), deleteBrand);

export default router;
