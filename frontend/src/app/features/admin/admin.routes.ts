import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AdminLogin } from './admin-login/admin-login';
import { DashboardShell } from './dashboard-shell/dashboard-shell';
import { roleGuard } from '../../core/guards/role.guard';
import { adminAuthGuard } from '../../core/guards/auth.guard';
import { UserStore } from '../../core/store/user-store';

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
        canActivate: [adminAuthGuard],
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
                path: 'catalog',
                title: 'Catalog',
                canActivate: [roleGuard(['super-admin', 'inventory-management'])],
                loadComponent: () =>
                    import('./catalog-management/catalog-management').then((m) => m.CatalogManagement),
            },
            {
                path: 'collections',
                title: 'Collections',
                canActivate: [roleGuard(['super-admin', 'inventory-management'])],
                loadComponent: () =>
                    import('./collection-management/collection-management').then(
                        (m) => m.CollectionManagement,
                    ),
            },
            {
                path: 'orders',
                title: 'Order Management',
                canActivate: [roleGuard(['super-admin'])],
                loadComponent: () =>
                    import('./order-management/order-management').then((m) => m.OrderManagement),
            },
            {
                path: '',
                pathMatch: 'full',
                redirectTo: () => {
                    const role = inject(UserStore).user()?.role;
                    if (role === 'user-admin') return '/admin/dashboard/users';
                    if (role === 'inventory-management') return '/admin/dashboard/products';
                    return '/admin/dashboard/analytics';
                },
            },
        ],
    },
];
