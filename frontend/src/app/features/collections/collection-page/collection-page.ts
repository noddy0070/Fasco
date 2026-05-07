import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TransitionLink } from '../../../shared/components/transition-link/transition-link';

interface CollectionTab {
  label: string;
  slug: string;
}

interface CollectionProduct {
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
}

interface CollectionPromoAction {
  label: string;
  slug: string;
}

interface CollectionPromo {
  eyebrow: string;
  title: string;
  description: string;
  actions: CollectionPromoAction[];
}

interface CollectionData {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  heroImage: string;
  productCount: number;
  tabs: CollectionTab[];
  sortOptions: string[];
  products: CollectionProduct[];
  promo: CollectionPromo;
}

interface CollectionDataFile {
  collections: CollectionData[];
}

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
  selector: 'app-collection-page',
  imports: [CommonModule, TransitionLink],
  templateUrl: './collection-page.html',
  styleUrl: './collection-page.css',
})
export class CollectionPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly defaultSlug = 'mens-new-arrivals';

  collections = signal<CollectionData[]>([]);
  currentSlug = signal(this.defaultSlug);
  isFilterModalOpen = signal(false);

  selectedSizes = signal<string[]>([]);
  selectedColors = signal<string[]>([]);
  selectedPrices = signal<string[]>([]);
  selectedProductTypes = signal<string[]>([]);
  selectedMaterials = signal<string[]>([]);

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
    'Everyday Sneakers',
    'Golf',
    'High Tops',
    'Hiking Shoes',
    'Hoodies',
    'Insoles',
    'Long Sleeve Tees',
    'Running Shoes',
    'Shirts',
    'Slip Ons',
    'Slippers',
    'Socks',
    'Sweatpants',
    'Sweatshirts',
    'Tees',
    'Water-Repellent Shoes',
  ];

  readonly materialOptions = [
    'Alternative-Leather',
    'Canvas',
    'Cotton',
    'Sugar',
    'Tree',
    'Tree-Fiber-Blend',
    'Wool',
  ];

  currentCollection = computed(() => {
    const collections = this.collections();
    const selectedSlug = this.currentSlug();

    return collections.find((collection) => collection.slug === selectedSlug) ?? collections[0] ?? null;
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
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((paramMap) => {
      this.currentSlug.set(paramMap.get('collectionSlug') ?? this.defaultSlug);
      this.clearFilters();
      this.isFilterModalOpen.set(false);
    });

    void this.loadCollections();
  }

  private async loadCollections(): Promise<void> {
    const response = await fetch('/mockData/collections.json');
    const data = (await response.json()) as CollectionDataFile;

    this.collections.set(data.collections ?? []);
  }

  openFilterModal(): void {
    this.isFilterModalOpen.set(true);
  }

  closeFilterModal(): void {
    this.isFilterModalOpen.set(false);
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
}