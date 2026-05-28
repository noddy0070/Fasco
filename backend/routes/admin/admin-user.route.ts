import express from 'express';
import { requireRole } from '../../middleware/rbac.middleware.ts';
import { adminRole } from '../../model.interfaces/customEnum.ts';
import {
    listUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
} from '../../controller/admin/admin-user.controller.ts';

const router = express.Router();

const userAdminRoles = [adminRole.SUPER_ADMIN, adminRole.USER_ADMIN];
router.get('/', requireRole(userAdminRoles), listUsers);
router.get('/:id', requireRole(userAdminRoles), getUser);
router.post('/', requireRole(userAdminRoles), createUser);
router.patch('/:id', requireRole(userAdminRoles), updateUser);
router.delete('/:id', requireRole(userAdminRoles), deleteUser);

export default router;
