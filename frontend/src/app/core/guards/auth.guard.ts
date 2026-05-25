import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStore } from '../store/user-store';

export const authGuard: CanActivateFn = () => {
  const userStore = inject(UserStore);
  const router = inject(Router);

  if (userStore.user()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

/**
 * Guard for admin routes. Awaits session hydration before checking
 * authentication, preventing a race condition on page refresh where
 * the synchronous user check fires before hydrateFromSession resolves.
 * Redirects unauthenticated users to /admin (login page) instead of /login.
 */
export const adminAuthGuard: CanActivateFn = async () => {
  const userStore = inject(UserStore);
  const router = inject(Router);

  if (!userStore.user()) {
    await userStore.hydrateFromSession();
  }

  if (userStore.user()) {
    return true;
  }

  return router.createUrlTree(['/admin']);
};
