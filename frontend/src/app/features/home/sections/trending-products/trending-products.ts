import { Component, computed, OnInit, signal } from '@angular/core';
import { RoundedBlackButton } from "../../../../shared/components/rounded-black-button/rounded-black-button";
import { ProductCard } from "../../../../shared/components/product-card/product-card";
import { Router } from '@angular/router';
import {
  TRENDING_COLORS,
  TRENDING_FILTERS,
  TrendingProduct,
} from './trending-products.constants';

type ProductVariantModel = {
  sku: string;
  size: string;
  color: string;
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
  isLimitedOffer?: boolean;
  variants: ProductVariantModel[];
};
@Component({
  selector: 'app-trending-products',
  imports: [RoundedBlackButton, ProductCard],
  templateUrl: './trending-products.html',
  styleUrl: './trending-products.css',
})
export class TrendingProducts implements OnInit {
  constructor(private readonly router: Router) {}

  colors = signal(TRENDING_COLORS);
  filters = TRENDING_FILTERS;
  selectedFilter = signal<string>(this.filters[1]);
  products = signal<TrendingProduct[]>([]);

  leftColumn = computed(() =>
    this.colors().filter((_, i) => i % 2 === 0)
  );

  rightColumn = computed(() =>
    this.colors().filter((_, i) => i % 2 !== 0)
  );

  filteredProducts = computed(() => {
    const selected = this.selectedFilter();
    return this.products().filter((product) => product.categories.includes(selected));
  });

  async ngOnInit(): Promise<void> {
    try {
      const response = await fetch('/mockData/products.json');
      const data = (await response.json()) as { products?: ProductModel[] };
      const mapped = (data.products ?? []).flatMap((product) => this.mapProductToTrending(product));
      this.products.set(mapped);
    } catch {
      this.products.set([]);
    }
  }

  setFilter(filter: string): void {
    this.selectedFilter.set(filter);
  }

  navigateToProduct(id: string): void {
    void this.router.navigate(['/product', id]);
  }

  async openCollectionByColor(colorName: string): Promise<void> {
    const colorSlug = colorName.toLowerCase().replace(/\s+/g, '-');
    const selected = this.selectedFilter().toLowerCase();
    const collectionBaseSlug = selected.includes("women")
      ? 'womens-fashion'
      : 'mens-fashion';
    await this.router.navigate(['/collections', collectionBaseSlug], {
      queryParams: { color: colorSlug },
    });
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

      if ((product.subCategory || '').includes('accessories') || (product.category || '').includes('accessories')) {
        categories.add(product.gender === 'women' ? "Women's Accessories" : "Men's Accessories");
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
        badge: (product.isLimitedOffer || (variant.discount ?? 0) > 0) ? 'SALE' : 'NEW',
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
