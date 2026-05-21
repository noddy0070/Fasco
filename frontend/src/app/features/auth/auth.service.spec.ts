import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import {
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './auth.service';
import { API_ENDPOINTS } from '../../core/api/api.endpoints';
import type { LoginPayload, SignupPayload } from './auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    // Stub router.navigate so the signup side-effect doesn't throw NG04002
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => httpMock.verify());

  describe('login()', () => {
    it('should POST to the login endpoint', () => {
      const credentials: LoginPayload = { email: 'a@b.com', password: 'pass' };
      service.login(credentials).subscribe();

      const req = httpMock.expectOne(API_ENDPOINTS.auth.login);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush({ message: 'ok', data: { _id: 'u1', firstName: 'Alice', email: 'a@b.com' } });
    });

    it('should return the server response', () => {
      const mockResponse = { message: 'ok', data: { _id: 'u1', firstName: 'Alice', email: 'a@b.com' } };
      let result: unknown;
      service.login({ email: 'a@b.com', password: 'pass' }).subscribe(r => (result = r));

      httpMock.expectOne(API_ENDPOINTS.auth.login).flush(mockResponse);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('signup()', () => {
    it('should POST to the signup endpoint', () => {
      const payload: SignupPayload = {
        firstName: 'Bob',
        email: 'bob@test.com',
        phone: '1234567890',
        password: 'secret',
      };
      service.signup(payload).subscribe();

      const req = httpMock.expectOne(API_ENDPOINTS.auth.signup);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ message: 'Verification email sent' });
    });
  });

  describe('me()', () => {
    it('should GET the current user endpoint', () => {
      service.me().subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.auth.me);
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'ok', data: { _id: 'u1', email: 'a@b.com' } });
    });
  });

  describe('logout()', () => {
    it('should GET the logout endpoint', () => {
      service.logout().subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.auth.logout);
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Logged out' });
    });
  });

  describe('forgotPassword()', () => {
    it('should POST the forgot-password endpoint with the email', () => {
      service.forgotPassword('user@test.com').subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.auth.forgotPassword);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'user@test.com' });
      req.flush({ message: 'Reset email sent' });
    });
  });

  describe('resetPassword()', () => {
    it('should POST the reset-password endpoint', () => {
      service.resetPassword({ token: 'tok1', newPassword: 'newpass' }).subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.auth.resetPassword);
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Password reset' });
    });
  });

  describe('verifyEmail()', () => {
    it('should GET the verify endpoint with the token', () => {
      service.verifyEmail('abc123').subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.auth.verifyEmail('abc123'));
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Email verified' });
    });
  });

  describe('resendVerification()', () => {
    it('should POST the resend-verification endpoint', () => {
      service.resendVerification('user@test.com').subscribe();
      const req = httpMock.expectOne(API_ENDPOINTS.auth.resendVerification);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'user@test.com' });
      req.flush({ message: 'Email resent' });
    });
  });
});
