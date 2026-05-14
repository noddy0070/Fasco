import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SearchService, SearchProduct } from './search.service';
import { COLOR_OPTIONS, PRICE_OPTIONS, SIZE_OPTIONS } from '../../shared/collection/collection.constants';

@Component({
  selector: 'app-search-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './search-page.html',
  styleUrl: './search-page.css',
})
export class SearchPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchService = inject(SearchService);
  private readonly destroyRef = inject(DestroyRef);

  searchQuery = signal('');
  allResults = signal<SearchProduct[]>([]);
  isFilterModalOpen = signal(false);
  isSortMenuOpen = signal(false);
  selectedSortOption = signal('Featured');

  selectedSizes = signal<string[]>([]);
  selectedColors = signal<string[]>([]);
  selectedPrices = signal<string[]>([]);
  selectedProductTypes = signal<string[]>([]);
  selectedMaterials = signal<string[]>([]);

  readonly sortOptions = ['Featured', 'Best Selling', 'Price: Low to High', 'Price: High to Low'];
  readonly priceOptions = PRICE_OPTIONS;

  availableSizes = computed(() => {
    const productSizes = new Set(this.allResults().flatMap((p) => p.sizes));
    return SIZE_OPTIONS.filter((s) => productSizes.has(s));
  });

  availableColors = computed(() => {
    const productColors = new Set(this.allResults().flatMap((p) => p.colors));
    return COLOR_OPTIONS.filter((c) => productColors.has(c.label));
  });

  availableProductTypes = computed(() =>
    [...new Set(this.allResults().map((p) => p.productType).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    )
  );

  availableMaterials = computed(() =>
    [...new Set(this.allResults().map((p) => p.material).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    )
  );

  filteredProducts = computed(() => {
    const products = this.allResults();
    const selectedSizes = this.selectedSizes();
    const selectedColors = this.selectedColors();
    const selectedPrices = this.selectedPrices();
    const selectedProductTypes = this.selectedProductTypes();
    const selectedMaterials = this.selectedMaterials();

    return products.filter((product) => {
      const bySize = selectedSizes.length === 0 || product.sizes.some((s) => selectedSizes.includes(s));
      const byColor = selectedColors.length === 0 || product.colors.some((c) => selectedColors.includes(c));
      const byPrice = selectedPrices.length === 0 || this.matchesAnySelectedPrice(product.priceValue, selectedPrices);
      const byType = selectedProductTypes.length === 0 || selectedProductTypes.includes(product.productType);
      const byMaterial = selectedMaterials.length === 0 || selectedMaterials.includes(product.material);
      return bySize && byColor && byPrice && byType && byMaterial;
    });
  });

  displayedProducts = computed(() => {
    const products = this.filteredProducts();
    const sort = this.selectedSortOption();
    return this.sortProducts(products, sort);
  });

  ngOnInit(): void {
    void this.searchService.loadProducts().then(() => {
      this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
        const q = params.get('q') ?? '';
        this.searchQuery.set(q);
        this.allResults.set(this.searchService.search(q));
        this.clearFilters();
      });
    });
  }

  private sortProducts(products: SearchProduct[], sort: string): SearchProduct[] {
    const copy = [...products];
    if (sort === 'Price: Low to High') return copy.sort((a, b) => a.priceValue - b.priceValue);
    if (sort === 'Price: High to Low') return copy.sort((a, b) => b.priceValue - a.priceValue);
    return copy;
  }

  private matchesAnySelectedPrice(priceValue: number, selectedPrices: string[]): boolean {
    return this.priceOptions
      .filter((p) => selectedPrices.includes(p.label))
      .some((p) => priceValue >= p.min && priceValue <= p.max);
  }

  navigateToProduct(productId: string): void {
    void this.router.navigate(['/product', productId]);
  }

  openFilterModal(): void { this.isFilterModalOpen.set(true); }
  closeFilterModal(): void { this.isFilterModalOpen.set(false); }
  toggleSortMenu(): void { this.isSortMenuOpen.update((v) => !v); }
  selectSortOption(option: string): void {
    this.selectedSortOption.set(option);
    this.isSortMenuOpen.set(false);
  }

  clearFilters(): void {
    this.selectedSizes.set([]);
    this.selectedColors.set([]);
    this.selectedPrices.set([]);
    this.selectedProductTypes.set([]);
    this.selectedMaterials.set([]);
  }

  toggleSize(v: string): void { this.selectedSizes.update((c) => this.toggleValue(c, v)); }
  toggleColor(v: string): void { this.selectedColors.update((c) => this.toggleValue(c, v)); }
  togglePrice(v: string): void { this.selectedPrices.update((c) => this.toggleValue(c, v)); }
  toggleProductType(v: string): void { this.selectedProductTypes.update((c) => this.toggleValue(c, v)); }
  toggleMaterial(v: string): void { this.selectedMaterials.update((c) => this.toggleValue(c, v)); }

  isSizeSelected(v: string): boolean { return this.selectedSizes().includes(v); }
  isColorSelected(v: string): boolean { return this.selectedColors().includes(v); }
  isPriceSelected(v: string): boolean { return this.selectedPrices().includes(v); }
  isProductTypeSelected(v: string): boolean { return this.selectedProductTypes().includes(v); }
  isMaterialSelected(v: string): boolean { return this.selectedMaterials().includes(v); }

  private toggleValue(arr: string[], value: string): string[] {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
  }

  goBack(): void { void this.router.navigate(['/']); }
}
