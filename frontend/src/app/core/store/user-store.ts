import { inject } from '@angular/core';
import { signalStore, withMethods, withState, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../features/auth/auth.service';
import { CommerceService } from '../services/commerce.service';
import { AuthUser, LoginPayload } from '../../features/auth/auth.models';
type UserState = {
  user: AuthUser | null;
  isLoading: boolean;
};

const initialState: UserState = {
  user: null,
  isLoading: false,
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, authService = inject(AuthService), commerce = inject(CommerceService)) => ({
    setUser(user: AuthUser | null): void {
      patchState(store, { user });
    },
    clearUser(): void {
      patchState(store, { user: null });
    },
    async login(credentials: LoginPayload): Promise<boolean> {
      patchState(store, { isLoading: true });
      try {
        const response = await firstValueFrom(authService.login(credentials));
        patchState(store, { user: response.data, isLoading: false });
        void commerce.loadCart();
        void commerce.loadWishlist();
        return true;
      } catch {
        patchState(store, { isLoading: false });
        return false;
      }
    },
    async logout(): Promise<void> {
      try {
        await firstValueFrom(authService.logout());
      } finally {
        patchState(store, { user: null });
      }
    },
    async hydrateFromSession(): Promise<void> {
      try {
        const response = await firstValueFrom(authService.me());
        patchState(store, { user: response.data });
        void commerce.loadCart();
        void commerce.loadWishlist();
      } catch {
        patchState(store, { user: null });
      }
    },
  })),
);
