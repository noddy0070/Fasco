import { Routes } from '@angular/router';
import { AdminLogin } from './admin-login/admin-login';
import { DashboardShell } from './dashboard-shell/dashboard-shell';
import { roleGuard } from '../../core/guards/role.guard';
import { authGuard } from '../../core/guards/auth.guard';

export const adminRoutes: Routes = [
    {
        path: '',
        component: AdminLogin,
        title: 'Admin Login',
    },
    {
        path: 'dashboard',
        component: DashboardShell,
        title: 'Admin Dashboard',
        canActivate: [authGuard],
        children: [
            {
                path: 'analytics',
                title: 'Analytics',
                canActivate: [roleGuard(['super-admin'])],
                loadComponent: () =>
                    import('./analytics/analytics').then((m) => m.Analytics),
            },
            {
                path: 'users',
                title: 'User Management',
                canActivate: [roleGuard(['super-admin', 'user-admin'])],
                loadComponent: () =>
                    import('./user-management/user-management').then((m) => m.UserManagement),
            },
            {
                path: 'products',
                title: 'Product Management',
                canActivate: [roleGuard(['super-admin', 'inventory-management'])],
                loadComponent: () =>
                    import('./product-management/product-management').then((m) => m.ProductManagement),
            },
            {
                path: 'orders',
                title: 'Order Management',
                canActivate: [roleGuard(['super-admin'])],
                loadComponent: () =>
                    import('./order-management/order-management').then((m) => m.OrderManagement),
            },
            { path: '', redirectTo: 'analytics', pathMatch: 'full' },
        ],
    },
];
