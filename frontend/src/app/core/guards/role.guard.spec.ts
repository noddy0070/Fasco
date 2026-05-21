import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { roleGuard } from './role.guard';
import { UserStore } from '../store/user-store';
import type { AdminRole } from '../../features/admin/admin.models';

// ── Stubs ─────────────────────────────────────────────────────────────────────

const routerStub = {
    createUrlTree: jasmine.createSpy('createUrlTree').and.callFake((commands: string[]) => commands as unknown as UrlTree),
    navigate: jasmine.createSpy('navigate'),
};

const userStoreStub = {
    user: jasmine.createSpy('user'),
};

// ── Helper ────────────────────────────────────────────────────────────────────

const runGuard = (allowedRoles: AdminRole[]) => {
    const guard = TestBed.runInInjectionContext(() =>
        roleGuard(allowedRoles)(
            {} as ActivatedRouteSnapshot,
            {} as RouterStateSnapshot,
        ),
    );
    return guard;
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('roleGuard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: routerStub },
                { provide: UserStore, useValue: userStoreStub },
            ],
        });

        routerStub.createUrlTree.calls.reset();
    });

    describe('when no user is authenticated', () => {
        beforeEach(() => {
            userStoreStub.user.and.returnValue(null);
        });

        it('redirects to /admin', () => {
            const result = runGuard(['super-admin']);
            expect(routerStub.createUrlTree).toHaveBeenCalledWith(['/admin']);
        });

        it('does not return true', () => {
            const result = runGuard(['super-admin']);
            expect(result).not.toBeTrue();
        });
    });

    describe('when user lacks the required role', () => {
        beforeEach(() => {
            userStoreStub.user.and.returnValue({ role: 'inventory-management' });
        });

        it('redirects to /admin/dashboard when role is insufficient', () => {
            runGuard(['super-admin', 'user-admin']);
            expect(routerStub.createUrlTree).toHaveBeenCalledWith(['/admin/dashboard']);
        });
    });

    describe('when user holds a permitted role', () => {
        it('returns true for super-admin on any route', () => {
            userStoreStub.user.and.returnValue({ role: 'super-admin' });
            const result = runGuard(['super-admin']);
            expect(result).toBeTrue();
        });

        it('returns true for user-admin on user-management route', () => {
            userStoreStub.user.and.returnValue({ role: 'user-admin' });
            const result = runGuard(['super-admin', 'user-admin']);
            expect(result).toBeTrue();
        });

        it('returns true for inventory-management on product route', () => {
            userStoreStub.user.and.returnValue({ role: 'inventory-management' });
            const result = runGuard(['super-admin', 'inventory-management']);
            expect(result).toBeTrue();
        });
    });
});
