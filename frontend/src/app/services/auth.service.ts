import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../core/api/api.endpoints';

export interface SignupPayload {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface AuthUser {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  isVerified?: boolean;
  isBlocked?: boolean;
}

export interface LoginResponse {
  message: string;
  token?: string;
  data: AuthUser;
}

export interface CurrentUserResponse {
  message: string;
  data: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}


  signup(data: SignupPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(API_ENDPOINTS.auth.signup, data).pipe(
      tap(() => {
        this.router.navigate(['/signup/verify'], {
          queryParams: { email: data.email },
        });
      }),
    );
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(API_ENDPOINTS.auth.verifyEmail(token));
  }

  resendVerification(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(API_ENDPOINTS.auth.resendVerification, { email });
  }

  login(credentials: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(API_ENDPOINTS.auth.login, credentials);
  }

  me(): Observable<CurrentUserResponse> {
    return this.http.get<CurrentUserResponse>(API_ENDPOINTS.auth.me);
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(API_ENDPOINTS.auth.forgotPassword, { email });
  }

  resetPassword(payload: ResetPasswordPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(API_ENDPOINTS.auth.resetPassword, payload);
  }

  logout(): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(API_ENDPOINTS.auth.logout);
  }
}
