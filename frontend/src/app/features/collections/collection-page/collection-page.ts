import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { TransitionLink } from '../../../shared/components/transition-link/transition-link';
import { CollectionFilter } from '../../../shared/collection/collection-filter/collection-filter';
import { CollectionSort } from '../../../shared/collection/collection-sort/collection-sort';
import { CollectionProductCard } from '../../../shared/collection/collection-product-card/collection-product-card';
import { CollectionData, CollectionDataFile, CollectionProduct, CollectionTab } from '../../../shared/collection/collection.types';
import { COLOR_OPTIONS, MATERIAL_OPTIONS, PRICE_OPTIONS, PRODUCT_TYPE_OPTIONS, SIZE_OPTIONS } from '../../../shared/collection/collection.constants';

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
  isTrending?: boolean;
  isLimitedOffer?: boolean;
  variants: ProductVariantModel[];
};

@Component({
  selector: 'app-collection-page',
  imports: [CommonModule, TransitionLink, CollectionFilter, CollectionSort, CollectionProductCard],
  templateUrl: './collection-page.html',
  styleUrl: './collection-page.css',
})
export class CollectionPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly defaultSlug = 'mens-new-arrivals';

  collections = signal<CollectionData[]>([]);
  allProducts = signal<ProductModel[]>([]);
  currentSlug = signal(this.defaultSlug);
  isFilterModalOpen = signal(false);
  isSortMenuOpen = signal(false);
  selectedSortOption = signal('Featured');

  selectedSizes = signal<string[]>([]);
  selectedColors = signal<string[]>([]);
  selectedPrices = signal<string[]>([]);
  selectedProductTypes = signal<string[]>([]);
  selectedMaterials = signal<string[]>([]);

  readonly sizeOptions = SIZE_OPTIONS;
  readonly colorOptions = COLOR_OPTIONS;
  readonly priceOptions = PRICE_OPTIONS;
  readonly productTypeOptions = PRODUCT_TYPE_OPTIONS;
  readonly materialOptions = MATERIAL_OPTIONS;

  currentCollection = computed(() => {
    const collections = this.collections();
    const selectedSlug = this.currentSlug();
    const mappedProducts = this.mapProductsForSlug(selectedSlug);
    const resolvedProducts = mappedProducts.length > 0
      ? mappedProducts
      : collections.find((collection) => collection.slug === selectedSlug)?.products ?? [];

    const baseCollection =
      collections.find((collection) => collection.slug === selectedSlug)
      ?? collections[0]
      ?? null;
    if (!baseCollection) {
      return null;
    }
    return {
      ...baseCollection,
      products: resolvedProducts,
      productCount: resolvedProducts.length,
    };
  });

  activeSortLabel = computed(() => {
    const collection = this.currentCollection();
    const sortLabel = this.selectedSortOption();

    if (!collection) {
      return sortLabel;
    }

    return collection.sortOptions.includes(sortLabel) ? sortLabel : collection.sortOptions[0] ?? sortLabel;
  });

  filteredProducts = computed(() => {
    const collection = this.currentCollection();

    if (!collection) {
      return [];
    }

    const selectedSizes = this.selectedSizes();
    const selectedColors = this.selectedColors();
    const selectedPrices = this.selectedPrices();
    const selectedProductTypes = this.selectedProductTypes();
    const selectedMaterials = this.selectedMaterials();

    return collection.products.filter((product) => {
      const bySize = selectedSizes.length === 0 || product.sizes.some((size) => selectedSizes.includes(size));
      const byColor = selectedColors.length === 0 || product.colors.some((color) => selectedColors.includes(color));
      const byPrice = selectedPrices.length === 0 || this.matchesAnySelectedPrice(product.priceValue, selectedPrices);
      const byType = selectedProductTypes.length === 0 || selectedProductTypes.includes(product.productType);
      const byMaterial = selectedMaterials.length === 0 || selectedMaterials.includes(product.material);

      return bySize && byColor && byPrice && byType && byMaterial;
    });
  });

  displayedProducts = computed(() => {
    const collection = this.currentCollection();
    const products = this.filteredProducts();

    if (!collection) {
      return products;
    }

    return this.sortProducts(products, this.activeSortLabel(), collection.products);
  });

  selectedFilterCount = computed(() => {
    return (
      this.selectedSizes().length +
      this.selectedColors().length +
      this.selectedPrices().length +
      this.selectedProductTypes().length +
      this.selectedMaterials().length
    );
  });

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

    void Promise.all([this.loadCollections(), this.loadProducts()]);
  }

  private async loadCollections(): Promise<void> {
    const response = await fetch('/mockData/collections.json');
    const data = (await response.json()) as CollectionDataFile;

    this.collections.set(data.collections ?? []);
  }

  private async loadProducts(): Promise<void> {
    const response = await fetch('/mockData/products.json');
    const data = (await response.json()) as { products?: ProductModel[] };
    this.allProducts.set(data.products ?? []);
  }

  openFilterModal(): void {
    this.isFilterModalOpen.set(true);
  }

  closeFilterModal(): void {
    this.isFilterModalOpen.set(false);
  }

  toggleSortMenu(): void {
    this.isSortMenuOpen.update((current) => !current);
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
    this.selectedProductTypes.set([]);
    this.selectedMaterials.set([]);
  }

  toggleSize(value: string): void {
    this.selectedSizes.update((current) => this.toggleValue(current, value));
  }

  toggleColor(value: string): void {
    this.selectedColors.update((current) => this.toggleValue(current, value));
  }

  togglePrice(value: string): void {
    this.selectedPrices.update((current) => this.toggleValue(current, value));
  }

  toggleProductType(value: string): void {
    this.selectedProductTypes.update((current) => this.toggleValue(current, value));
  }

  toggleMaterial(value: string): void {
    this.selectedMaterials.update((current) => this.toggleValue(current, value));
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

  isProductTypeSelected(value: string): boolean {
    return this.selectedProductTypes().includes(value);
  }

  isMaterialSelected(value: string): boolean {
    return this.selectedMaterials().includes(value);
  }

  isTabActive(tab: CollectionTab, collection: CollectionData, index: number): boolean {
    const hasDirectTabMatch = collection.tabs.some((entry) => entry.slug === collection.slug);

    if (hasDirectTabMatch) {
      return tab.slug === collection.slug;
    }

    return index === 0;
  }

  private toggleValue(current: string[], value: string): string[] {
    return current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value];
  }

  private matchesAnySelectedPrice(price: number, selectedPriceLabels: string[]): boolean {
    const selectedRanges = this.priceOptions.filter((range) => selectedPriceLabels.includes(range.label));
    return selectedRanges.some((range) => price >= range.min && price <= range.max);
  }

  private sortProducts(
    products: CollectionProduct[],
    sortLabel: string,
    originalProducts: CollectionProduct[]
  ): CollectionProduct[] {
    const orderMap = new Map(originalProducts.map((product, index) => [product.name, index]));

    return [...products].sort((left, right) => {
      if (sortLabel === 'Price: Low to High') {
        return left.priceValue - right.priceValue;
      }

      if (sortLabel === 'Price: High to Low') {
        return right.priceValue - left.priceValue;
      }

      if (sortLabel === 'Newest') {
        return (orderMap.get(right.name) ?? 0) - (orderMap.get(left.name) ?? 0);
      }

      if (sortLabel === 'Best Selling' || sortLabel === 'Trending' || sortLabel === 'Discounted') {
        return right.priceValue - left.priceValue;
      }

      return (orderMap.get(left.name) ?? 0) - (orderMap.get(right.name) ?? 0);
    });
  }

  private applyRouteSelection(routeSlug: string, colorQuery: string): void {
    this.clearFilters();
    const mappedSlug = this.mapCollectionBaseSlug(routeSlug);
    const matchedColor = this.matchColorFromSlug(colorQuery || routeSlug);
    if (matchedColor) {
      this.currentSlug.set(mappedSlug);
      this.selectedColors.set([matchedColor]);
      return;
    }

    this.currentSlug.set(mappedSlug);
  }

  private matchColorFromSlug(slug: string): string | null {
    const normalizedSlug = this.normalizeColorToken(slug);
    const colorMatch = this.colorOptions.find((color) => {
      const normalizedColor = this.normalizeColorToken(color.label);
      return normalizedColor === normalizedSlug
        || normalizedSlug.includes(normalizedColor)
        || normalizedColor.includes(normalizedSlug);
    });
    return colorMatch?.label ?? null;
  }

  private normalizeColorToken(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private mapCollectionBaseSlug(routeSlug: string): string {
    if (routeSlug === 'mens-fashion') {
      return 'mens-new-arrivals';
    }
    if (routeSlug === 'womens-fashion') {
      return 'womens-new-arrivals';
    }
    return routeSlug;
  }

  private mapProductsForSlug(slug: string): CollectionProduct[] {
    const products = this.allProducts();
    if (products.length === 0) {
      return [];
    }

    const bySlug = products.filter((product) => {
      if (slug === 'sale') {
        return !!product.isLimitedOffer || product.variants.some((variant) => (variant.discount ?? 0) > 0);
      }
      if (slug === 'featured') {
        return !!product.isTrending;
      }
      if (slug.includes('women')) {
        return product.gender === 'women' || product.gender === 'unisex';
      }
      return product.gender === 'men' || product.gender === 'unisex';
    });

    return bySlug.map((product) => this.toCollectionProduct(product));
  }

  private toCollectionProduct(product: ProductModel): CollectionProduct {
    const firstVariant = product.variants[0];
    const colorList = [...new Set(product.variants.map((variant) => variant.color).filter(Boolean))];
    const sizeList = [...new Set(product.variants.map((variant) => variant.size).filter(Boolean))];
    const swatches = ['#2f2f2f', '#a39f95', '#d8d5cd', '#7f8fa4', '#b5ab8d'];

    return {
      productId: product._id,
      variantSku: firstVariant?.sku ?? '',
      name: product.title,
      variant: firstVariant?.color ?? '',
      price: `$${firstVariant?.price ?? 0}`,
      priceValue: firstVariant?.price ?? 0,
      image: firstVariant?.images?.[0] ?? 'assets/images/promotional_banner_1.webp',
      badge: product.isLimitedOffer ? 'SALE' : (product.isTrending ? 'TRENDING' : 'NEW'),
      moreColors: `+${Math.max(colorList.length - 1, 0)}`,
      swatches: swatches.slice(0, Math.max(colorList.length, 1)),
      sizes: sizeList.length > 0 ? sizeList : ['M'],
      colors: colorList.length > 0 ? colorList : ['Default'],
      productType: 'Everyday Sneakers',
      material: 'Tree',
    };
  }
}