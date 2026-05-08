import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface SearchProduct {
  productId: string;
  name: string;
  variant: string;
  price: string;
  priceValue: number;
  image: string;
  badge: string;
  moreColors: string;
  swatches: string[];
  sizes: string[];
  colors: string[];
  productType: string;
  material: string;
  collectionSlug: string;
}

type ProductVariantModel = {
  sku: string;
  size: string;
  color: string;
  colorCode?: string;
  price: number;
  discount: number;
  stock: number;
  images: string[];
};

type ProductModel = {
  _id: string;
  title: string;
  gender: 'men' | 'women' | 'kids' | 'unisex';
  category?: string;
  subCategory?: string;
  isTrending?: boolean;
  isLimitedOffer?: boolean;
  variants: ProductVariantModel[];
};

interface ProductDataFile {
  products?: ProductModel[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly allProducts = signal<SearchProduct[]>([]);
  private loaded = false;

  async loadProducts(): Promise<void> {
    if (this.loaded) return;
    const data = await firstValueFrom(
      this.http.get<ProductDataFile>('/mockData/products.json'),
    );
    const products: SearchProduct[] = (data.products ?? []).flatMap((product) =>
      this.mapProductToSearch(product)
    );
    this.allProducts.set(products);
    this.loaded = true;
  }

  private mapProductToSearch(product: ProductModel): SearchProduct[] {
    const colorList = [...new Set(product.variants.map((v) => v.color).filter(Boolean))];
    const sizeList = [...new Set(product.variants.map((v) => v.size).filter(Boolean))];
    const firstVariant = product.variants[0];

    const collectionSlug =
      product.gender === 'women' ? 'womens-new-arrivals' : 'mens-new-arrivals';

    return product.variants.map((variant) => {
      let badge = 'NEW';
      if (product.isLimitedOffer) {
        badge = 'SALE';
      } else if (product.isTrending) {
        badge = 'TRENDING';
      }
      return {
      productId: product._id,
      name: product.title,
      variant: variant.color,
      price: `$${variant.price}`,
      priceValue: variant.price,
      image: variant.images?.[0] ?? firstVariant?.images?.[0] ?? 'assets/images/promotional_banner_1.webp',
      badge,
      moreColors: `+${Math.max(colorList.length - 1, 0)}`,
      swatches: colorList.map((c) => {
        const v = product.variants.find((pv) => pv.color === c);
        return v?.colorCode ?? '#888';
      }),
      sizes: sizeList,
      colors: colorList,
      productType: product.subCategory ?? product.category ?? 'Product',
      material: 'N/A',
      collectionSlug,
    };
    });
  }

  search(query: string): SearchProduct[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.allProducts().filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.variant.toLowerCase().includes(q) ||
        p.productType.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.colors.some((c) => c.toLowerCase().includes(q)),
    );
  }

  getTopSuggestions(query: string, limit = 4): SearchProduct[] {
    return this.search(query).slice(0, limit);
  }
}
