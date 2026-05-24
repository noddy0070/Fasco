import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, switchMap } from 'rxjs';
import { API_ENDPOINTS } from '../../core/api/api.endpoints';
import { ProductDetailModel } from './product.models';

export const FALLBACK_PRODUCTS: ProductDetailModel[] = [];

@Injectable({ providedIn: 'root' })
export class ProductDetailService {
    private readonly http = inject(HttpClient);

    loadProducts(): Observable<ProductDetailModel[]> {
        return this.http.get<{ data?: ProductDetailModel[] }>(API_ENDPOINTS.products.list).pipe(
            map((res) => (res.data?.length ? this.normalizeProducts(res.data) : [])),
            switchMap((apiProducts) => {
                if (apiProducts.length) return of(apiProducts);
                return this.http.get<{ products?: ProductDetailModel[] }>('/mockData/products.json').pipe(
                    map((data) => (data.products?.length ? data.products : FALLBACK_PRODUCTS)),
                    catchError(() => of(FALLBACK_PRODUCTS)),
                );
            }),
            catchError(() =>
                this.http.get<{ products?: ProductDetailModel[] }>('/mockData/products.json').pipe(
                    map((data) => data.products ?? FALLBACK_PRODUCTS),
                    catchError(() => of(FALLBACK_PRODUCTS)),
                ),
            ),
        );
    }

    private normalizeProducts(products: ProductDetailModel[]): ProductDetailModel[] {
        return products.map((p) => ({
            ...p,
            _id: p._id,
            slug: p.slug,
            variants: p.variants ?? [],
            specifications: p.specifications ?? [],
            averageRating: p.averageRating ?? 0,
            totalReviews: p.totalReviews ?? 0,
            isActive: p.isActive ?? true,
            isTrending: p.isTrending ?? false,
            isLimitedOffer: p.isLimitedOffer ?? false,
        }));
    }
}
