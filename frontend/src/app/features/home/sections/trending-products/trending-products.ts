import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RoundedBlackButton } from "../../../../shared/components/rounded-black-button/rounded-black-button";
import { ProductCard } from "../../../../shared/components/product-card/product-card";
import { Router } from '@angular/router';
import {
  TRENDING_COLORS,
  TRENDING_FILTERS,
  TrendingProduct,
} from './trending-products.constants';
import { TrendingProductsService } from './trending-products.service';
@Component({
  selector: 'app-trending-products',
  imports: [RoundedBlackButton, ProductCard],
  templateUrl: './trending-products.html',
  styleUrl: './trending-products.css',
})
export class TrendingProducts implements OnInit {
  private readonly router = inject(Router);
  private readonly trendingProductsService = inject(TrendingProductsService);
  private readonly destroyRef = inject(DestroyRef);

  colors = signal(TRENDING_COLORS);
  filters = TRENDING_FILTERS;
  selectedFilter = signal<string>(this.filters[1]);
  products = signal<TrendingProduct[]>([]);
  isLoading = signal(true);

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

  ngOnInit(): void {
    this.isLoading.set(true);
    this.trendingProductsService
      .loadProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          this.products.set(products);
          this.isLoading.set(false);
        },
        error: () => {
          this.products.set([]);
          this.isLoading.set(false);
        },
      });
  }

  setFilter(filter: string): void {
    this.selectedFilter.set(filter);
  }

  navigateToProduct(id: string): void {
    void this.router.navigate(['/product', id]);
  }

  async openCollectionByColor(colorName: string): Promise<void> {
    const colorSlug = colorName.toLowerCase().replaceAll(' ', '-');
    const selected = this.selectedFilter().toLowerCase();
    const collectionBaseSlug = selected.includes("women")
      ? 'womens-fashion'
      : 'mens-fashion';
    await this.router.navigate(['/collections', collectionBaseSlug], {
      queryParams: { color: colorSlug },
    });
  }
}
