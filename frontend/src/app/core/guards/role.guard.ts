import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStore } from '../store/user-store';
import type { AdminRole } from '../../features/admin/admin.models';

/**
 * Functional route guard that checks whether the authenticated user
 * holds one of the permitted admin roles.
 *
 * Usage:
 *   canActivate: [roleGuard(['super-admin', 'user-admin'])]
 */
export const roleGuard = (allowedRoles: AdminRole[]): CanActivateFn => {
    return () => {
        const userStore = inject(UserStore);
        const router = inject(Router);

        const user = userStore.user();

        if (!user) {
            return router.createUrlTree(['/admin']);
        }

        const userRole = user.role;
        if (!userRole || !(allowedRoles as string[]).includes(userRole)) {
            return router.createUrlTree(['/admin/dashboard']);
        }

        return true;
    };
};
