import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, map } from 'rxjs';
import {
  CollectionData,
  CollectionDataFile,
  CollectionProduct,
  FilterSlugOption,
} from '../../shared/collection/collection.types';
import { PRICE_OPTIONS } from '../../shared/collection/collection.constants';
import {
  CollectionFilterParams,
  CollectionPageData,
  ProductModel,
} from './collection.models';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private readonly http = inject(HttpClient);

  loadPageData(): Observable<CollectionPageData> {
    return combineLatest({
      collections: this.http.get<CollectionDataFile>('/mockData/collections.json').pipe(
        map(data => data.collections ?? [])
      ),
      allProducts: this.http.get<{ products?: ProductModel[] }>('/mockData/products.json').pipe(
        map(data => data.products ?? [])
      ),
    });
  }

  resolveCollection(
    collections: CollectionData[],
    allProducts: ProductModel[],
    slug: string
  ): CollectionData | null {
    const mappedProducts = this.mapProductsForSlug(allProducts, slug);
    const resolvedProducts =
      mappedProducts.length > 0
        ? mappedProducts
        : (collections.find(c => c.slug === slug)?.products ?? []);

    const base = collections.find(c => c.slug === slug) ?? collections[0] ?? null;
    if (!base) return null;

    return { ...base, products: resolvedProducts };
  }

  filterProducts(
    products: CollectionProduct[],
    params: CollectionFilterParams
  ): CollectionProduct[] {
    return products.filter(product => {
      const bySize =
        params.sizes.length === 0 || product.sizes.some(s => params.sizes.includes(s));
      const byColor =
        params.colors.length === 0 || product.colors.some(c => params.colors.includes(c));
      const byPrice =
        params.prices.length === 0 ||
        this.matchesAnySelectedPrice(product.priceValue, params.prices);
      const byCategory =
        params.categories.length === 0 || params.categories.includes(product.category);
      const bySubCategory =
        params.subCategories.length === 0 || params.subCategories.includes(product.subCategory);

      return bySize && byColor && byPrice && byCategory && bySubCategory;
    });
  }

  sortProducts(
    products: CollectionProduct[],
    sortLabel: string,
    originalProducts: CollectionProduct[]
  ): CollectionProduct[] {
    const orderMap = new Map(originalProducts.map((p, i) => [p.name, i]));

    return [...products].sort((left, right) => {
      if (sortLabel === 'Price: Low to High') return left.priceValue - right.priceValue;
      if (sortLabel === 'Price: High to Low') return right.priceValue - left.priceValue;
      if (sortLabel === 'Newest')
        return (orderMap.get(right.name) ?? 0) - (orderMap.get(left.name) ?? 0);
      if (sortLabel === 'Best Selling' || sortLabel === 'Trending' || sortLabel === 'Discounted')
        return right.priceValue - left.priceValue;
      return (orderMap.get(left.name) ?? 0) - (orderMap.get(right.name) ?? 0);
    });
  }

  getAvailableFilters(products: CollectionProduct[]): {
    sizes: string[];
    colors: string[];
    categories: FilterSlugOption[];
    subCategories: FilterSlugOption[];
  } {
    return {
      sizes: [...new Set(products.flatMap(p => p.sizes))].sort((a, b) => a.localeCompare(b)),
      colors: [...new Set(products.flatMap(p => p.colors))].sort((a, b) => a.localeCompare(b)),
      categories: [...new Set(products.map(p => p.category).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b))
        .map(slug => ({ slug, label: this.slugToLabel(slug) })),
      subCategories: [...new Set(products.map(p => p.subCategory).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b))
        .map(slug => ({ slug, label: this.slugToLabel(slug) })),
    };
  }

  mapCollectionBaseSlug(routeSlug: string): string {
    if (routeSlug === 'mens-fashion') return 'mens-new-arrivals';
    if (routeSlug === 'womens-fashion') return 'womens-new-arrivals';
    return routeSlug;
  }

  matchColorFromSlug(slug: string, allProducts: ProductModel[]): string | null {
    const normalizedSlug = this.normalizeColorToken(slug);
    const allColors = [
      ...new Set(
        allProducts.flatMap(p => p.variants.map(v => v.color).filter((c): c is string => !!c))
      ),
    ];
    const match = allColors.find(color => {
      const normalized = this.normalizeColorToken(color);
      return (
        normalized === normalizedSlug ||
        normalizedSlug.includes(normalized) ||
        normalized.includes(normalizedSlug)
      );
    });
    return match ?? null;
  }

  private mapProductsForSlug(products: ProductModel[], slug: string): CollectionProduct[] {
    if (products.length === 0) return [];

    const filtered = products.filter(product => {
      if (slug === 'sale')
        return !!product.isLimitedOffer || product.variants.some(v => (v.discount ?? 0) > 0);
      if (slug === 'featured') return !!product.isTrending;
      if (slug.includes('women'))
        return product.gender === 'women' || product.gender === 'unisex';
      return product.gender === 'men' || product.gender === 'unisex';
    });

    return filtered.map(p => this.toCollectionProduct(p));
  }

  private toCollectionProduct(product: ProductModel): CollectionProduct {
    const firstVariant = product.variants[0];
    const colorList = [...new Set(product.variants.map(v => v.color).filter(Boolean))];
    const sizeList = [...new Set(product.variants.map(v => v.size).filter(Boolean))];

    return {
      productId: product._id,
      variantSku: firstVariant?.sku ?? '',
      name: product.title,
      variant: firstVariant?.color ?? '',
      price: `$${firstVariant?.price ?? 0}`,
      priceValue: firstVariant?.price ?? 0,
      image: firstVariant?.images?.[0] ?? 'assets/images/promotional_banner_1.webp',
      badge: this.resolveBadge(product.isLimitedOffer, product.isTrending),
      moreColors: `+${Math.max(colorList.length - 1, 0)}`,
      swatches: colorList.map(color => {
        const variant = product.variants.find(v => v.color === color);
        return variant?.colorCode ?? '#7f878c';
      }),
      sizes: sizeList.length > 0 ? sizeList : ['M'],
      colors: colorList.length > 0 ? colorList : ['Default'],
      gender: product.gender.charAt(0).toUpperCase() + product.gender.slice(1),
      statuses: [
        ...(product.isTrending ? ['Trending'] : []),
        ...(product.isLimitedOffer || product.variants.some(v => (v.discount ?? 0) > 0)
          ? ['On Sale']
          : []),
        ...(product.variants.some(v => (v.stock ?? 0) > 0) ? ['In Stock'] : []),
      ],
      category: product.category ?? '',
      subCategory: product.subCategory ?? '',
    };
  }

  private matchesAnySelectedPrice(price: number, selectedPriceLabels: string[]): boolean {
    const ranges = PRICE_OPTIONS.filter(r => selectedPriceLabels.includes(r.label));
    return ranges.some(r => price >= r.min && price <= r.max);
  }

  private resolveBadge(isLimitedOffer?: boolean, isTrending?: boolean): string {
    if (isLimitedOffer) return 'SALE';
    if (isTrending) return 'TRENDING';
    return 'NEW';
  }

  private normalizeColorToken(value: string): string {
    return value.toLowerCase().replaceAll(/[^a-z0-9]/g, '');
  }

  private slugToLabel(slug: string): string {
    return slug.replaceAll('-', ' ').replaceAll(/\b\w/g, c => c.toUpperCase());
  }
}
