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
import { PRICE_OPTIONS } from '../../../shared/collection/collection.constants';
import { FilterSlugOption } from '../../../shared/collection/collection.types';

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
  category: string;
  subCategory: string;
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
  selectedCategories = signal<string[]>([]);
  selectedSubCategories = signal<string[]>([]);

  readonly priceOptions = PRICE_OPTIONS;

  availableSizes = computed((): readonly string[] => {
    const products = this.currentCollection()?.products ?? [];
    return [...new Set(products.flatMap(p => p.sizes))].sort();
  });

  availableColors = computed((): readonly string[] => {
    const products = this.currentCollection()?.products ?? [];
    return [...new Set(products.flatMap(p => p.colors))].sort();
  });

  availableCategories = computed((): FilterSlugOption[] => {
    const products = this.currentCollection()?.products ?? [];
    const slugs = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
    return slugs.map(slug => ({ slug, label: this.slugToLabel(slug) }));
  });

  availableSubCategories = computed((): FilterSlugOption[] => {
    const products = this.currentCollection()?.products ?? [];
    const slugs = [...new Set(products.map(p => p.subCategory).filter(Boolean))].sort();
    return slugs.map(slug => ({ slug, label: this.slugToLabel(slug) }));
  });

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
    const selectedCategories = this.selectedCategories();
    const selectedSubCategories = this.selectedSubCategories();

    return collection.products.filter((product) => {
      const bySize = selectedSizes.length === 0 || product.sizes.some((size) => selectedSizes.includes(size));
      const byColor = selectedColors.length === 0 || product.colors.some((color) => selectedColors.includes(color));
      const byPrice = selectedPrices.length === 0 || this.matchesAnySelectedPrice(product.priceValue, selectedPrices);
      const byCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const bySubCategory = selectedSubCategories.length === 0 || selectedSubCategories.includes(product.subCategory);

      return bySize && byColor && byPrice && byCategory && bySubCategory;
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
      this.selectedCategories().length +
      this.selectedSubCategories().length
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
    this.selectedCategories.set([]);
    this.selectedSubCategories.set([]);
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

  toggleCategory(value: string): void {
    this.selectedCategories.update((current) => this.toggleValue(current, value));
  }

  toggleSubCategory(value: string): void {
    this.selectedSubCategories.update((current) => this.toggleValue(current, value));
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
    const hasDirectTabMatch = collection.tabs.some((entry) => entry.slug === collection.slug);

    if (hasDirectTabMatch) {
      return tab.slug === collection.slug;
    }

    return index === 0;
  }

  private toggleValue(current: string[], value: string): string[] {
    return current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value];
  }

  private slugToLabel(slug: string): string {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
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
    const allColors = [...new Set(
      this.allProducts().flatMap(p => p.variants.map(v => v.color).filter((c): c is string => !!c))
    )];
    const colorMatch = allColors.find((color) => {
      const normalizedColor = this.normalizeColorToken(color);
      return normalizedColor === normalizedSlug
        || normalizedSlug.includes(normalizedColor)
        || normalizedColor.includes(normalizedSlug);
    });
    return colorMatch ?? null;
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
      swatches: colorList.map((color) => {
        const variant = product.variants.find(v => v.color === color);
        return variant?.colorCode ?? this.colorNameToSwatch(color);
      }),
      sizes: sizeList.length > 0 ? sizeList : ['M'],
      colors: colorList.length > 0 ? colorList : ['Default'],
      gender: product.gender.charAt(0).toUpperCase() + product.gender.slice(1),
      statuses: [
        ...(product.isTrending ? ['Trending'] : []),
        ...(product.isLimitedOffer || product.variants.some(v => (v.discount ?? 0) > 0) ? ['On Sale'] : []),
        ...(product.variants.some(v => (v.stock ?? 0) > 0) ? ['In Stock'] : []),
      ],
      category: product.category ?? '',
      subCategory: product.subCategory ?? '',
    };
  }

  private colorNameToSwatch(color: string): string {
    const token = color.toLowerCase();
    if (token.includes('black') || token.includes('coal') || token.includes('ink')) return '#2c2c2c';
    if (token.includes('white') || token.includes('parchment') || token.includes('cream')) return '#f0ece4';
    if (token.includes('grey') || token.includes('gray') || token.includes('graphite') || token.includes('ash')) return '#8a8f96';
    if (token.includes('navy') || token.includes('midnight')) return '#1e3a5f';
    if (token.includes('blue') || token.includes('steel') || token.includes('cobalt')) return '#3d6fa8';
    if (token.includes('green') || token.includes('forest') || token.includes('olive')) return '#4a7c6a';
    if (token.includes('teal') || token.includes('sea') || token.includes('glass')) return '#4ba8a0';
    if (token.includes('red') || token.includes('crimson') || token.includes('ruby')) return '#c0392b';
    if (token.includes('pink') || token.includes('rose') || token.includes('blush')) return '#d9828c';
    if (token.includes('orange') || token.includes('amber') || token.includes('rust')) return '#c95c3b';
    if (token.includes('yellow') || token.includes('gold')) return '#d4a843';
    if (token.includes('purple') || token.includes('violet') || token.includes('plum')) return '#6a4fa8';
    if (token.includes('brown') || token.includes('tan') || token.includes('caramel')) return '#8b5e3c';
    if (token.includes('sand') || token.includes('stone') || token.includes('beige') || token.includes('khaki')) return '#a89f7a';
    return '#7f878c';
  }
}