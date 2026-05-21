import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { vi } from 'vitest';
import { authGuard } from './auth.guard';
import { UserStore } from '../store/user-store';

const routerStub = {
  createUrlTree: vi.fn().mockImplementation((cmds: string[]) => cmds as unknown as UrlTree),
};

const runGuard = () =>
  TestBed.runInInjectionContext(() =>
    authGuard(
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot,
    ),
  );

describe('authGuard', () => {
  let userStoreStub: { user: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    userStoreStub = { user: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerStub },
        { provide: UserStore, useValue: userStoreStub },
      ],
    });

    routerStub.createUrlTree.mockClear();
  });

  describe('when user is authenticated', () => {
    it('returns true', () => {
      userStoreStub.user.mockReturnValue({ _id: 'u1', email: 'a@b.com' });
      expect(runGuard()).toBe(true);
    });

    it('does not redirect', () => {
      userStoreStub.user.mockReturnValue({ _id: 'u1', email: 'a@b.com' });
      runGuard();
      expect(routerStub.createUrlTree).not.toHaveBeenCalled();
    });
  });

  describe('when user is not authenticated', () => {
    it('redirects to /login', () => {
      userStoreStub.user.mockReturnValue(null);
      runGuard();
      expect(routerStub.createUrlTree).toHaveBeenCalledWith(['/login']);
    });

    it('does not return true', () => {
      userStoreStub.user.mockReturnValue(null);
      const result = runGuard();
      expect(result).not.toBe(true);
    });
  });
});
