import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { UserStore } from './user-store';
import { AuthService } from '../../features/auth/auth.service';

const mockUser = { _id: 'u1', firstName: 'Alice', email: 'alice@test.com' };

const authServiceStub = {
  login: vi.fn().mockReturnValue(of({ message: 'ok', data: mockUser })),
  logout: vi.fn().mockReturnValue(of({ message: 'ok' })),
  me: vi.fn().mockReturnValue(of({ message: 'ok', data: mockUser })),
};

describe('UserStore', () => {
  let service: InstanceType<typeof UserStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    authServiceStub.login.mockReturnValue(of({ message: 'ok', data: mockUser }));
    authServiceStub.logout.mockReturnValue(of({ message: 'ok' }));
    authServiceStub.me.mockReturnValue(of({ message: 'ok', data: mockUser }));

    TestBed.configureTestingModule({
      providers: [
        UserStore,
        { provide: AuthService, useValue: authServiceStub },
      ],
    });
    service = TestBed.inject(UserStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should start with no user', () => {
      expect(service.user()).toBeNull();
    });

    it('should start with isLoading = false', () => {
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('setUser()', () => {
    it('should update the user signal', () => {
      service.setUser(mockUser);
      expect(service.user()).toEqual(mockUser);
    });

    it('should clear user when called with null', () => {
      service.setUser(mockUser);
      service.setUser(null);
      expect(service.user()).toBeNull();
    });
  });

  describe('clearUser()', () => {
    it('should reset user to null', () => {
      service.setUser(mockUser);
      service.clearUser();
      expect(service.user()).toBeNull();
    });
  });

  describe('login()', () => {
    it('should call AuthService.login with credentials', async () => {
      await service.login({ email: 'alice@test.com', password: 'pw' });
      expect(authServiceStub.login).toHaveBeenCalledWith({ email: 'alice@test.com', password: 'pw' });
    });

    it('should set the user on success and return true', async () => {
      const result = await service.login({ email: 'alice@test.com', password: 'pw' });
      expect(result).toBe(true);
      expect(service.user()).toEqual(mockUser);
    });

    it('should return false and clear loading on error', async () => {
      authServiceStub.login.mockReturnValue(throwError(() => new Error('Unauthorized')));
      const result = await service.login({ email: 'x@x.com', password: 'wrong' });
      expect(result).toBe(false);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('logout()', () => {
    it('should call AuthService.logout and then clear the user', async () => {
      service.setUser(mockUser);
      await service.logout();
      expect(authServiceStub.logout).toHaveBeenCalled();
      expect(service.user()).toBeNull();
    });
  });

  describe('hydrateFromSession()', () => {
    it('should call AuthService.me and populate user on success', async () => {
      await service.hydrateFromSession();
      expect(service.user()).toEqual(mockUser);
    });

    it('should set user to null when me() errors', async () => {
      authServiceStub.me.mockReturnValue(throwError(() => new Error('Unauthorized')));
      await service.hydrateFromSession();
      expect(service.user()).toBeNull();
    });
  });
});

