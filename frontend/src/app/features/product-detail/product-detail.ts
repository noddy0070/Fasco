import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { ProductDetailService } from './product-detail.service';
import { ProductDetailModel } from './product.models';
import { UserStore } from '../../core/store/user-store';
import { CommerceService } from '../../core/services/commerce.service';

@Component({
    selector: 'app-product-detail',
    imports: [CommonModule],
    templateUrl: './product-detail.html',
    styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);
    private readonly productDetailService = inject(ProductDetailService);
    private readonly userStore = inject(UserStore);
    private readonly commerce = inject(CommerceService);

    products = signal<ProductDetailModel[]>([]);
    product = signal<ProductDetailModel | null>(null);
    selectedSku = signal('');
    selectedImage = signal('');
    openSpec = signal('Fit');
    isLoading = signal(true);
    actionMessage = signal<string | null>(null);
    actionError = signal<string | null>(null);
    isAddingToCart = signal(false);
    isWishlistBusy = signal(false);

    selectedVariant = computed(() => {
        const item = this.product();
        if (!item) return null;
        return item.variants.find((variant) => variant.sku === this.selectedSku()) ?? item.variants[0] ?? null;
    });

    galleryImages = computed(() => this.selectedVariant()?.images ?? []);

    colorOptions = computed(() => {
        const item = this.product();
        if (!item) return [];
        return [...new Set(item.variants.map((variant) => variant.color).filter((c): c is string => !!c))];
    });

    colorCodeMap = computed((): Record<string, string> => {
        const item = this.product();
        if (!item) return {};
        const map: Record<string, string> = {};
        for (const variant of item.variants) {
            if (variant.color && !map[variant.color]) {
                map[variant.color] = variant.colorCode ?? '#7f878c';
            }
        }
        return map;
    });

    sizeOptions = computed(() => {
        const item = this.product();
        if (!item) return [];
        return [...new Set(item.variants.map((variant) => variant.size).filter((s): s is string => !!s))];
    });

    discountedPrice = computed(() => {
        const variant = this.selectedVariant();
        if (!variant) return 0;
        return Math.round((variant.price * (100 - (variant.discount || 0))) / 100);
    });

    isWishlisted = computed(() => {
        const item = this.product();
        const variant = this.selectedVariant();
        if (!item || !variant) return false;
        return this.commerce.isWishlisted(this.productRef(item), variant.sku, item._id);
    });

    ngOnInit(): void {
        this.isLoading.set(true);
        this.productDetailService
            .loadProducts()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((products) => {
                this.products.set(products);
                this.isLoading.set(false);
                combineLatest([this.route.paramMap, this.route.queryParamMap])
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe(([paramMap, queryParamMap]) => {
                        const id = paramMap.get('id') ?? '';
                        const querySku = queryParamMap.get('variant') ?? this.extractVariantFromUrl();
                        this.bindProduct(id, querySku);
                    });
            });

        if (this.userStore.user()) {
            void this.commerce.loadWishlist();
            void this.commerce.loadCart();
        }
    }

    productRef(item: ProductDetailModel): string {
        return item.slug || item._id;
    }

    selectColor(color: string): void {
        const item = this.product();
        if (!item) return;
        const match = item.variants.find((variant) => variant.color === color);
        if (match) {
            this.setVariant(match.sku);
        }
    }

    selectSize(size: string): void {
        const item = this.product();
        if (!item) return;
        const currentColor = this.selectedVariant()?.color;
        const match =
            item.variants.find(
                (variant) => variant.size === size && (!currentColor || variant.color === currentColor),
            ) ?? item.variants.find((variant) => variant.size === size);
        if (match) {
            this.setVariant(match.sku);
        }
    }

    setVariant(sku: string): void {
        this.selectedSku.set(sku);
        this.selectedImage.set(this.selectedVariant()?.images?.[0] ?? '');
        void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { variant: sku },
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });
    }

    setImage(image: string): void {
        this.selectedImage.set(image);
    }

    setOpenSpec(title: string): void {
        this.openSpec.set(this.openSpec() === title ? '' : title);
    }

    getSwatchColor(color: string): string {
        return this.colorCodeMap()[color] ?? '#7f878c';
    }

    private requireAuth(): boolean {
        if (this.userStore.user()) return true;
        void this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        return false;
    }

    async addToBag(): Promise<void> {
        if (!this.requireAuth()) return;
        const item = this.product();
        const variant = this.selectedVariant();
        if (!item || !variant) return;

        this.isAddingToCart.set(true);
        this.actionError.set(null);
        this.actionMessage.set(null);

        try {
            await this.commerce.addToCart(this.productRef(item), variant.sku, 1);
            this.actionMessage.set('Added to bag. Go to cart to checkout.');
        } catch (err: unknown) {
            const e = err as { error?: { message?: string } };
            this.actionError.set(e.error?.message ?? 'Could not add to cart');
        } finally {
            this.isAddingToCart.set(false);
        }
    }

    async buyNow(): Promise<void> {
        if (!this.requireAuth()) return;
        const item = this.product();
        const variant = this.selectedVariant();
        if (!item || !variant) return;

        this.isAddingToCart.set(true);
        this.actionError.set(null);

        try {
            await this.commerce.addToCart(this.productRef(item), variant.sku, 1);
            void this.router.navigate(['/profile'], { queryParams: { tab: 'cart', checkout: '1' } });
        } catch (err: unknown) {
            const e = err as { error?: { message?: string } };
            this.actionError.set(e.error?.message ?? 'Could not proceed to checkout');
        } finally {
            this.isAddingToCart.set(false);
        }
    }

    async toggleWishlist(): Promise<void> {
        if (!this.requireAuth()) return;
        const item = this.product();
        const variant = this.selectedVariant();
        if (!item || !variant) return;

        this.isWishlistBusy.set(true);
        this.actionError.set(null);

        try {
            const added = await this.commerce.toggleWishlist(this.productRef(item), variant.sku);
            this.actionMessage.set(added ? 'Saved to wishlist' : 'Removed from wishlist');
        } catch (err: unknown) {
            const e = err as { error?: { message?: string } };
            this.actionError.set(e.error?.message ?? 'Wishlist update failed');
        } finally {
            this.isWishlistBusy.set(false);
        }
    }

    goToCart(): void {
        void this.router.navigate(['/profile'], { queryParams: { tab: 'cart' } });
    }

    private bindProduct(idOrSlug: string, querySku: string): void {
        const normalizedId = (idOrSlug || '').trim().toLowerCase();
        const item =
            this.products().find(
                (product) =>
                    product._id.toLowerCase() === normalizedId ||
                    product.slug.toLowerCase() === normalizedId,
            ) ?? null;
        this.product.set(item);
        if (!item) return;

        const normalizedSku = (querySku || '').trim().toLowerCase();
        const variant =
            item.variants.find((entry) => entry.sku.toLowerCase() === normalizedSku) ?? item.variants[0];
        this.selectedSku.set(variant?.sku ?? '');
        this.selectedImage.set(variant?.images?.[0] ?? '');
    }

    private extractVariantFromUrl(): string {
        if (globalThis.window === undefined) {
            return '';
        }
        const match = /[?&]variant[=-]([^&]+)/i.exec(globalThis.window.location.search);
        return match?.[1] ?? '';
    }
}
