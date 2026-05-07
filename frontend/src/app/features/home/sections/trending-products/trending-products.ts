import { Component, computed, OnInit, signal } from '@angular/core';
import { RoundedBlackButton } from "../../../../shared/components/rounded-black-button/rounded-black-button";
import { ProductCard } from "../../../../shared/components/product-card/product-card";
import { Router } from '@angular/router';
import {
  FALLBACK_TRENDING_PRODUCTS,
  TRENDING_COLORS,
  TRENDING_FILTERS,
  TrendingProduct,
} from './trending-products.constants';
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
  selectedFilter = signal<string>(this.filters[0]);
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
      const response = await fetch('/mockData/trending-products.json');
      const data = (await response.json()) as { products?: TrendingProduct[] };
      this.products.set(data.products?.length ? data.products : FALLBACK_TRENDING_PRODUCTS);
    } catch {
      this.products.set(FALLBACK_TRENDING_PRODUCTS);
    }
  }

  setFilter(filter: string): void {
    this.selectedFilter.set(filter);
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
}
