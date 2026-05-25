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
            // Redirect to the first route accessible to this role, or back to
            // the login page. Never redirect to /admin/dashboard (default child)
            // because that would trigger an infinite redirect loop.
            if ((userRole === 'user-admin')) return router.createUrlTree(['/admin/dashboard/users']);
            if (userRole === 'inventory-management') return router.createUrlTree(['/admin/dashboard/products']);
            return router.createUrlTree(['/admin']);
        }

        return true;
    };
};
