import { Injectable, signal } from '@angular/core';
import type { AuthUser, SignupResponse } from '../models/user.model';


@Injectable({
  providedIn: 'root',
})
export class UserStore {
  private readonly cookieName = 'fasco-access-token';
  private readonly userState = signal<AuthUser | null>(null);
  private readonly tokenState = signal<string | null>(this.readTokenFromCookie());

  readonly user = this.userState.asReadonly();
  readonly token = this.tokenState.asReadonly();

  setAuthState(response: SignupResponse): void {
    this.userState.set(response.data);
    this.tokenState.set(response.token);
    this.persistToken(response.token);
  }

  clearAuthState(): void {
    this.userState.set(null);
    this.tokenState.set(null);
    this.clearTokenCookie();
  }

  private persistToken(token: string): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.cookie = `${this.cookieName}=${encodeURIComponent(token)}; path=/; max-age=3600; samesite=lax`;
  }

  private clearTokenCookie(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.cookie = `${this.cookieName}=; path=/; max-age=0; samesite=lax`;
  }

  private readTokenFromCookie(): string | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const cookie = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith(`${this.cookieName}=`));

    if (!cookie) {
      return null;
    }

    return decodeURIComponent(cookie.split('=')[1] ?? '');
  }
}
