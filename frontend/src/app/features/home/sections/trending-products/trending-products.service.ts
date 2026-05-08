import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TrendingProduct } from './trending-products.constants';

export type ProductVariantModel = {
  sku: string;
  size: string;
  color: string;
  price: number;
  discount: number;
  stock: number;
  images: string[];
};

export type ProductModel = {
  _id: string;
  title: string;
  gender: 'men' | 'women' | 'kids' | 'unisex';
  category?: string;
  subCategory?: string;
  isLimitedOffer?: boolean;
  variants: ProductVariantModel[];
};

@Injectable({ providedIn: 'root' })
export class TrendingProductsService {
  private readonly http = inject(HttpClient);

  loadProducts(): Observable<TrendingProduct[]> {
    return this.http
      .get<{ products?: ProductModel[] }>('/mockData/products.json')
      .pipe(map((data) => (data.products ?? []).flatMap((p) => this.mapProductToTrending(p))));
  }

  private mapProductToTrending(product: ProductModel): TrendingProduct[] {
    return (product.variants || []).map((variant) => {
      const categories = new Set<string>();
      if (product.gender === 'women') {
        categories.add("Women's Fashion");
      } else if (product.gender === 'men') {
        categories.add("Men's Fashion");
      } else {
        categories.add("Men's Fashion");
        categories.add("Women's Fashion");
      }

      if (
        (product.subCategory || '').includes('accessories') ||
        (product.category || '').includes('accessories')
      ) {
        categories.add(
          product.gender === 'women' ? "Women's Accessories" : "Men's Accessories",
        );
      }

      if (product.isLimitedOffer || (variant.discount ?? 0) > 0) {
        categories.add('Discount Deals');
      }

      return {
        id: product._id,
        name: product.title,
        variant: `${variant.color} - ${variant.size}`,
        price: `$${variant.price}`,
        priceValue: variant.price,
        image: variant.images?.[0] || 'assets/images/promotional_banner_1.webp',
        imageUrl: variant.images?.[0] || 'assets/images/promotional_banner_1.webp',
        badge: product.isLimitedOffer || (variant.discount ?? 0) > 0 ? 'SALE' : 'NEW',
        moreColors: '+0',
        swatches: ['#2f2f2f', '#777777', '#c7c7c7'],
        sizes: [variant.size],
        colors: [variant.color],
        productType: product.subCategory || 'Product',
        material: 'Material',
        categories: Array.from(categories),
      };
    });
  }
}
