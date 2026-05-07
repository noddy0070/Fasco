import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SearchService, SearchProduct } from '../../../services/search.service';

interface FilterColorOption {
  label: string;
  swatch: string;
}

interface PriceRangeOption {
  label: string;
  min: number;
  max: number;
}

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

  readonly sizeOptions = [
    'XS', 'S', 'M', 'L', 'XL',
    'XXL', 'XXXL', '8', '8.5', '9',
    '9.5', '10', '10.5', '11', '11.5',
    '12', '12.5', '13', '13.5', '14',
    '15', 'One Size',
  ];

  readonly colorOptions: FilterColorOption[] = [
    { label: 'Black', swatch: '#1E1F23' },
    { label: 'Grey', swatch: '#778092' },
    { label: 'White', swatch: '#F4F5F6' },
    { label: 'Beige', swatch: '#EFE2B4' },
    { label: 'Brown', swatch: '#AF4B02' },
    { label: 'Red', swatch: '#FF3040' },
    { label: 'Pink', swatch: '#EE9AC7' },
    { label: 'Orange', swatch: '#FF6C00' },
    { label: 'Yellow', swatch: '#F6BE00' },
    { label: 'Green', swatch: '#0FA748' },
    { label: 'Blue', swatch: '#3079E9' },
    { label: 'Purple', swatch: '#A54AEA' },
  ];

  readonly priceOptions: PriceRangeOption[] = [
    { label: 'Under $75', min: 0, max: 74 },
    { label: '$75 - $100', min: 75, max: 100 },
    { label: '$101 - $125', min: 101, max: 125 },
    { label: '$126 - $150', min: 126, max: 150 },
    { label: 'Over $150', min: 151, max: Number.POSITIVE_INFINITY },
  ];

  readonly productTypeOptions = [
    'Everyday Sneakers', 'Golf', 'High Tops', 'Hiking Shoes',
    'Hoodies', 'Insoles', 'Long Sleeve Tees', 'Running Shoes',
    'Shirts', 'Slip Ons', 'Slippers', 'Socks',
    'Sweatpants', 'Sweatshirts', 'Tees', 'Water-Repellent Shoes',
  ];

  readonly materialOptions = [
    'Alternative-Leather', 'Canvas', 'Cotton',
    'Sugar', 'Tree', 'Tree-Fiber-Blend', 'Wool',
  ];

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
