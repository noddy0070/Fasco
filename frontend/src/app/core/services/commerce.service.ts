import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_ENDPOINTS } from '../api/api.endpoints';
import type {
    CartModel,
    WishlistModel,
    CheckoutPayload,
    UserOrderModel,
} from '../models/commerce.models';

type ApiResponse<T> = { message: string; data: T };

@Injectable({ providedIn: 'root' })
export class CommerceService {
    private readonly http = inject(HttpClient);

    readonly cart = signal<CartModel | null>(null);
    readonly wishlist = signal<WishlistModel | null>(null);
    readonly orders = signal<UserOrderModel[]>([]);

    readonly cartCount = computed(() => this.cart()?.totalItems ?? 0);

    readonly wishlistKeys = computed(() => {
        const items = this.wishlist()?.items ?? [];
        return new Set(
            items.map((i) => {
                const product = i.product;
                const id = typeof product === 'string' ? product : product._id;
                return `${id}::${i.variantSku}`;
            }),
        );
    });

    isWishlisted(productRef: string, variantSku: string, altRef?: string): boolean {
        const keys = this.wishlistKeys();
        return keys.has(`${productRef}::${variantSku}`) || (!!altRef && keys.has(`${altRef}::${variantSku}`));
    }

    async loadCart(): Promise<void> {
        const res = await firstValueFrom(this.http.get<ApiResponse<CartModel>>(API_ENDPOINTS.cart.get));
        this.cart.set(res.data);
    }

    async addToCart(productId: string, variantSku: string, quantity = 1): Promise<CartModel> {
        const res = await firstValueFrom(
            this.http.post<ApiResponse<CartModel>>(API_ENDPOINTS.cart.addItem, {
                productId,
                variantSku,
                quantity,
            }),
        );
        this.cart.set(res.data);
        return res.data;
    }

    async updateCartItem(productId: string, variantSku: string, quantity: number): Promise<void> {
        const res = await firstValueFrom(
            this.http.patch<ApiResponse<CartModel>>(API_ENDPOINTS.cart.updateItem, {
                productId,
                variantSku,
                quantity,
            }),
        );
        this.cart.set(res.data);
    }

    async removeFromCart(productId: string, variantSku: string): Promise<void> {
        const res = await firstValueFrom(
            this.http.delete<ApiResponse<CartModel>>(API_ENDPOINTS.cart.removeItem, {
                body: { productId, variantSku },
            }),
        );
        this.cart.set(res.data);
    }

    async loadWishlist(): Promise<void> {
        const res = await firstValueFrom(
            this.http.get<ApiResponse<WishlistModel>>(API_ENDPOINTS.wishlist.get),
        );
        this.wishlist.set(res.data);
    }

    async toggleWishlist(productId: string, variantSku: string): Promise<boolean> {
        const key = `${productId}::${variantSku}`;
        const isOn = this.wishlistKeys().has(key);

        const res = isOn
            ? await firstValueFrom(
                  this.http.delete<ApiResponse<WishlistModel>>(API_ENDPOINTS.wishlist.removeItem, {
                      body: { productId, variantSku },
                  }),
              )
            : await firstValueFrom(
                  this.http.post<ApiResponse<WishlistModel>>(API_ENDPOINTS.wishlist.addItem, {
                      productId,
                      variantSku,
                  }),
              );

        this.wishlist.set(res.data);
        return !isOn;
    }

    async loadOrders(): Promise<void> {
        const res = await firstValueFrom(
            this.http.get<ApiResponse<UserOrderModel[]>>(API_ENDPOINTS.orders.list),
        );
        this.orders.set(res.data);
    }

    async checkout(payload: CheckoutPayload): Promise<UserOrderModel> {
        const res = await firstValueFrom(
            this.http.post<ApiResponse<UserOrderModel>>(API_ENDPOINTS.orders.checkout, payload),
        );
        await this.loadCart();
        await this.loadOrders();
        return res.data;
    }
}
