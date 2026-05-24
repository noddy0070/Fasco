import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserStore } from '../../core/store/user-store';
import { CommerceService } from '../../core/services/commerce.service';
import { TransitionLink } from '../../shared/components/transition-link/transition-link';
import type { CartItemModel, CartProductRef } from '../../core/models/commerce.models';

@Component({
    selector: 'app-profile',
    imports: [CommonModule, TransitionLink, ReactiveFormsModule],
    templateUrl: './profile.html',
    styleUrl: './profile.css',
})
export class Profile implements OnInit {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly fb = inject(FormBuilder);
    readonly store = inject(UserStore);
    readonly commerce = inject(CommerceService);

    readonly user = computed(() => this.store.user());
    readonly cart = computed(() => this.commerce.cart());
    readonly orders = computed(() => this.commerce.orders());
    readonly wishlist = computed(() => this.commerce.wishlist());

    activeTab = signal<'profile' | 'orders' | 'cart' | 'wishlist'>('profile');
    showCheckout = signal(false);
    isCheckoutSubmitting = signal(false);
    checkoutError = signal<string | null>(null);
    tabLoading = signal(false);

    readonly checkoutForm = this.fb.nonNullable.group({
        fullName: ['', Validators.required],
        phone: ['', Validators.required],
        pincode: ['', Validators.required],
        state: ['', Validators.required],
        city: ['', Validators.required],
        addressLine1: ['', Validators.required],
        addressLine2: [''],
        paymentMethod: ['cod', Validators.required],
    });

    ngOnInit(): void {
        this.route.queryParamMap.subscribe((params) => {
            const tab = params.get('tab');
            if (tab === 'orders' || tab === 'cart' || tab === 'wishlist' || tab === 'profile') {
                this.activeTab.set(tab);
            }
            if (params.get('checkout') === '1') {
                this.showCheckout.set(true);
            }
        });

        void this.refreshTabData();
    }

    setTab(tab: 'profile' | 'orders' | 'cart' | 'wishlist'): void {
        this.activeTab.set(tab);
        this.showCheckout.set(false);
        void this.router.navigate([], { relativeTo: this.route, queryParams: { tab }, queryParamsHandling: 'merge' });
        void this.refreshTabData();
    }

    async refreshTabData(): Promise<void> {
        if (!this.user()) return;
        this.tabLoading.set(true);
        try {
            const tab = this.activeTab();
            if (tab === 'cart') await this.commerce.loadCart();
            if (tab === 'orders') await this.commerce.loadOrders();
            if (tab === 'wishlist') await this.commerce.loadWishlist();
        } finally {
            this.tabLoading.set(false);
        }
    }

    logout(): void {
        void this.store.logout().then(() => this.router.navigate(['/login']));
    }

    getInitials(firstName: string, lastName?: string): string {
        const f = firstName?.[0]?.toUpperCase() ?? '';
        const l = lastName?.[0]?.toUpperCase() ?? '';
        return f + l || '?';
    }

    lineProduct(item: { product: CartProductRef | string }): CartProductRef | null {
        return typeof item.product === 'string' ? null : item.product;
    }

    lineVariant(item: { product: CartProductRef | string; variantSku: string }): CartProductRef['variants'][0] | null {
        const product = this.lineProduct(item);
        return product?.variants.find((v) => v.sku === item.variantSku) ?? null;
    }

    cartLineProduct(item: CartItemModel): CartProductRef | null {
        return this.lineProduct(item);
    }

    cartLineVariant(item: CartItemModel): CartProductRef['variants'][0] | null {
        return this.lineVariant(item);
    }

    cartLinePrice(item: CartItemModel): number {
        const variant = this.cartLineVariant(item);
        if (!variant) return 0;
        return Math.round((variant.price * (100 - (variant.discount || 0))) / 100);
    }

    cartLineImage(item: CartItemModel): string {
        return this.cartLineVariant(item)?.images?.[0] ?? 'assets/images/home/hero/hero-top.webp';
    }

    cartProductId(item: CartItemModel): string {
        const product = item.product;
        if (typeof product === 'string') return product;
        return product.slug || product._id;
    }

    wishlistProductId(item: { product: CartProductRef | string }): string {
        const product = item.product;
        if (typeof product === 'string') return product;
        return product.slug || product._id;
    }

    async updateQty(item: CartItemModel, quantity: number): Promise<void> {
        await this.commerce.updateCartItem(this.cartProductId(item), item.variantSku, quantity);
    }

    async removeCartItem(item: CartItemModel): Promise<void> {
        await this.commerce.removeFromCart(this.cartProductId(item), item.variantSku);
    }

    async removeWishlistItem(productId: string, variantSku: string): Promise<void> {
        await this.commerce.toggleWishlist(productId, variantSku);
    }

    openCheckout(): void {
        const u = this.user();
        if (u) {
            this.checkoutForm.patchValue({
                fullName: `${u.firstName} ${u.lastName ?? ''}`.trim(),
                phone: u.phone ?? '',
            });
        }
        this.checkoutError.set(null);
        this.showCheckout.set(true);
    }

    async submitCheckout(): Promise<void> {
        if (this.checkoutForm.invalid) {
            this.checkoutForm.markAllAsTouched();
            return;
        }

        this.isCheckoutSubmitting.set(true);
        this.checkoutError.set(null);

        try {
            const raw = this.checkoutForm.getRawValue();
            await this.commerce.checkout({
                paymentMethod: raw.paymentMethod as 'cod',
                shippingAddress: {
                    fullName: raw.fullName,
                    phone: raw.phone,
                    pincode: raw.pincode,
                    state: raw.state,
                    city: raw.city,
                    addressLine1: raw.addressLine1,
                    addressLine2: raw.addressLine2 || undefined,
                },
                useCart: true,
            });
            this.showCheckout.set(false);
            this.activeTab.set('orders');
            void this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { tab: 'orders' },
                queryParamsHandling: 'merge',
            });
        } catch (err: unknown) {
            const e = err as { error?: { message?: string } };
            this.checkoutError.set(e.error?.message ?? 'Checkout failed');
        } finally {
            this.isCheckoutSubmitting.set(false);
        }
    }
}
