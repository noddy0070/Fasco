import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/api/api.endpoints';
import type { ProductModel } from '../../core/store/product-store';

type ProductListResponse = { message: string; data: ProductModel[] };
type ProductResponse = { message: string; data: ProductModel };

export interface ProductQueryParams {
    gender?: 'men' | 'women' | 'kids' | 'unisex';
    isTrending?: boolean;
    isLimitedOffer?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
    private readonly http = inject(HttpClient);

    getProducts(query: ProductQueryParams = {}): Observable<ProductListResponse> {
        let params = new HttpParams();
        if (query.gender) params = params.set('gender', query.gender);
        if (query.isTrending != null) params = params.set('isTrending', String(query.isTrending));
        if (query.isLimitedOffer != null) params = params.set('isLimitedOffer', String(query.isLimitedOffer));
        return this.http.get<ProductListResponse>(API_ENDPOINTS.products.list, { params });
    }

    getProductById(id: string): Observable<ProductResponse> {
        return this.http.get<ProductResponse>(API_ENDPOINTS.products.getById(id));
    }

    getProductBySlug(slug: string): Observable<ProductResponse> {
        return this.http.get<ProductResponse>(API_ENDPOINTS.products.getBySlug(slug));
    }
}
