import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { ProductDetailModel } from './product.models';

export const FALLBACK_PRODUCTS: ProductDetailModel[] = [
];

@Injectable({ providedIn: 'root' })
export class ProductDetailService {
  private readonly http = inject(HttpClient);

  loadProducts(): Observable<ProductDetailModel[]> {
    return this.http.get<{ products?: ProductDetailModel[] }>('/mockData/products.json').pipe(
      map((data) => (data.products?.length ? data.products : FALLBACK_PRODUCTS)),
      catchError(() => of(FALLBACK_PRODUCTS)),
    );
  }
}
