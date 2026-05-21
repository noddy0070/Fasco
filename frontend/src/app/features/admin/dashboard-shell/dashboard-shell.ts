import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserStore } from '../../../core/store/user-store';
import { AdminService } from '../admin.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type NavItem = { label: string; path: string; icon: string; roles: string[] };

@Component({
    selector: 'app-dashboard-shell',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './dashboard-shell.html',
    styleUrl: './dashboard-shell.css',
})
export class DashboardShell {
    private readonly router = inject(Router);
    private readonly adminService = inject(AdminService);
    private readonly userStore = inject(UserStore);
    private readonly destroyRef = inject(DestroyRef);

    readonly sidebarOpen = signal(true);
    readonly isLoggingOut = signal(false);

    readonly user = computed(() => this.userStore.user());
    readonly userRole = computed(() => this.user()?.role ?? '');

    readonly allNavItems: NavItem[] = [
        { label: 'Analytics', path: '/admin/dashboard/analytics', icon: 'chart', roles: ['super-admin'] },
        { label: 'Users', path: '/admin/dashboard/users', icon: 'users', roles: ['super-admin', 'user-admin'] },
        { label: 'Products', path: '/admin/dashboard/products', icon: 'box', roles: ['super-admin', 'inventory-management'] },
        { label: 'Orders', path: '/admin/dashboard/orders', icon: 'clipboard', roles: ['super-admin'] },
    ];

    readonly navItems = computed(() =>
        this.allNavItems.filter((item) => item.roles.includes(this.userRole())),
    );

    toggleSidebar(): void {
        this.sidebarOpen.update((v) => !v);
    }

    logout(): void {
        this.isLoggingOut.set(true);
        this.adminService
            .logout()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.userStore.clearUser();
                    this.router.navigate(['/admin']);
                },
                error: () => {
                    this.userStore.clearUser();
                    this.router.navigate(['/admin']);
                },
            });
    }
}
