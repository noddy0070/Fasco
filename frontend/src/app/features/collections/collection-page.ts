import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { TransitionLink } from '../../shared/components/transition-link/transition-link';
import { CollectionFilter } from '../../shared/collection/collection-filter/collection-filter';
import { CollectionSort } from '../../shared/collection/collection-sort/collection-sort';
import { CollectionProductCard } from '../../shared/collection/collection-product-card/collection-product-card';
import { CollectionData, CollectionProduct, CollectionTab, FilterSlugOption } from '../../shared/collection/collection.types';
import { PRICE_OPTIONS } from '../../shared/collection/collection.constants';
import { CollectionService } from './collection.service';

@Component({
  selector: 'app-collection-page',
  imports: [CommonModule, TransitionLink, CollectionFilter, CollectionSort, CollectionProductCard],
  templateUrl: './collection-page.html',
  styleUrl: './collection-page.css',
})
export class CollectionPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly collectionService = inject(CollectionService);

  private readonly defaultSlug = 'mens-new-arrivals';

  private readonly collections = signal<CollectionData[]>([]);
  private readonly allRawProducts = signal<{ variants: { color?: string }[] }[]>([]);

  currentSlug = signal(this.defaultSlug);
  isFilterModalOpen = signal(false);
  isSortMenuOpen = signal(false);
  selectedSortOption = signal('Featured');
  isLoading = signal(true);

  selectedSizes = signal<string[]>([]);
  selectedColors = signal<string[]>([]);
  selectedPrices = signal<string[]>([]);
  selectedCategories = signal<string[]>([]);
  selectedSubCategories = signal<string[]>([]);

  readonly priceOptions = PRICE_OPTIONS;

  currentCollection = computed(() =>
    this.collectionService.resolveCollection(
      this.collections(),
      this.allRawProducts() as never,
      this.currentSlug()
    )
  );

  availableFilters = computed(() =>
    this.collectionService.getAvailableFilters(this.currentCollection()?.products ?? [])
  );

  availableSizes = computed((): readonly string[] => this.availableFilters().sizes);
  availableColors = computed((): readonly string[] => this.availableFilters().colors);
  availableCategories = computed((): FilterSlugOption[] => this.availableFilters().categories);
  availableSubCategories = computed((): FilterSlugOption[] => this.availableFilters().subCategories);

  activeSortLabel = computed(() => {
    const collection = this.currentCollection();
    const sortLabel = this.selectedSortOption();
    if (!collection) return sortLabel;
    return collection.sortOptions.includes(sortLabel)
      ? sortLabel
      : (collection.sortOptions[0] ?? sortLabel);
  });

  filteredProducts = computed((): CollectionProduct[] => {
    const collection = this.currentCollection();
    if (!collection) return [];

    return this.collectionService.filterProducts(collection.products, {
      sizes: this.selectedSizes(),
      colors: this.selectedColors(),
      prices: this.selectedPrices(),
      categories: this.selectedCategories(),
      subCategories: this.selectedSubCategories(),
    });
  });

  displayedProducts = computed((): CollectionProduct[] => {
    const collection = this.currentCollection();
    if (!collection) return this.filteredProducts();

    return this.collectionService.sortProducts(
      this.filteredProducts(),
      this.activeSortLabel(),
      collection.products
    );
  });

  selectedFilterCount = computed(() =>
    this.selectedSizes().length +
    this.selectedColors().length +
    this.selectedPrices().length +
    this.selectedCategories().length +
    this.selectedSubCategories().length
  );

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([paramMap, queryParamMap]) => {
        this.applyRouteSelection(
          paramMap.get('collectionSlug') ?? this.defaultSlug,
          queryParamMap.get('color') ?? ''
        );
        this.isFilterModalOpen.set(false);
        this.isSortMenuOpen.set(false);
      });

    this.collectionService
      .loadPageData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ collections, allProducts }) => {
        this.collections.set(collections);
        this.allRawProducts.set(allProducts as never);
        this.isLoading.set(false);
      });
  }

  openFilterModal(): void {
    this.isFilterModalOpen.set(true);
  }

  closeFilterModal(): void {
    this.isFilterModalOpen.set(false);
  }

  toggleSortMenu(): void {
    this.isSortMenuOpen.update(current => !current);
  }

  closeSortMenu(): void {
    this.isSortMenuOpen.set(false);
  }

  selectSortOption(option: string): void {
    this.selectedSortOption.set(option);
    this.isSortMenuOpen.set(false);
  }

  clearFilters(): void {
    this.selectedSizes.set([]);
    this.selectedColors.set([]);
    this.selectedPrices.set([]);
    this.selectedCategories.set([]);
    this.selectedSubCategories.set([]);
  }

  toggleSize(value: string): void {
    this.selectedSizes.update(current => this.toggleValue(current, value));
  }

  toggleColor(value: string): void {
    this.selectedColors.update(current => this.toggleValue(current, value));
  }

  togglePrice(value: string): void {
    this.selectedPrices.update(current => this.toggleValue(current, value));
  }

  toggleCategory(value: string): void {
    this.selectedCategories.update(current => this.toggleValue(current, value));
  }

  toggleSubCategory(value: string): void {
    this.selectedSubCategories.update(current => this.toggleValue(current, value));
  }

  isSizeSelected(value: string): boolean {
    return this.selectedSizes().includes(value);
  }

  isColorSelected(value: string): boolean {
    return this.selectedColors().includes(value);
  }

  isPriceSelected(value: string): boolean {
    return this.selectedPrices().includes(value);
  }

  isCategorySelected(value: string): boolean {
    return this.selectedCategories().includes(value);
  }

  isSubCategorySelected(value: string): boolean {
    return this.selectedSubCategories().includes(value);
  }

  isTabActive(tab: CollectionTab, collection: CollectionData, index: number): boolean {
    const hasDirectTabMatch = collection.tabs.some(entry => entry.slug === collection.slug);
    if (hasDirectTabMatch) return tab.slug === collection.slug;
    return index === 0;
  }

  private toggleValue(current: string[], value: string): string[] {
    return current.includes(value)
      ? current.filter(entry => entry !== value)
      : [...current, value];
  }

  private applyRouteSelection(routeSlug: string, colorQuery: string): void {
    this.clearFilters();
    const mappedSlug = this.collectionService.mapCollectionBaseSlug(routeSlug);
    const matchedColor = this.collectionService.matchColorFromSlug(
      colorQuery || routeSlug,
      this.allRawProducts() as never
    );
    this.currentSlug.set(mappedSlug);
    if (matchedColor) {
      this.selectedColors.set([matchedColor]);
    }
  }
}