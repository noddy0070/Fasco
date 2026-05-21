import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { ProductDetailService } from './product-detail.service';
import { ProductDetailModel } from './product.models';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly productDetailService = inject(ProductDetailService);

  products = signal<ProductDetailModel[]>([]);
  product = signal<ProductDetailModel | null>(null);
  selectedSku = signal('');
  selectedImage = signal('');
  openSpec = signal('Fit');
  isLoading = signal(true);
constructor(){
  console.log('Constructor called:' + Date.now())
  console.log('Initial params id:', this.route.snapshot.paramMap.get('id'))
}

ngOnDestroy(): void {
  console.log('ngOnDestroy called')
}

  selectedVariant = computed(() => {
    const item = this.product();
    if (!item) return null;
    return item.variants.find((variant) => variant.sku === this.selectedSku()) ?? item.variants[0] ?? null;
  });

  galleryImages = computed(() => this.selectedVariant()?.images ?? []);

  colorOptions = computed(() => {
    const item = this.product();
    if (!item) return [];
    return [...new Set(item.variants.map((variant) => variant.color))];
  });

  colorCodeMap = computed((): Record<string, string> => {
    const item = this.product();
    if (!item) return {};
    const map: Record<string, string> = {};
    for (const variant of item.variants) {
      if (variant.color && !map[variant.color]) {
        map[variant.color] = variant.colorCode ?? '#7f878c';
      }
    }
    return map;
  });

  sizeOptions = computed(() => {
    const item = this.product();
    if (!item) return [];
    return [...new Set(item.variants.map((variant) => variant.size))];
  });

  discountedPrice = computed(() => {
    const variant = this.selectedVariant();
    if (!variant) return 0;
    return Math.round((variant.price * (100 - (variant.discount || 0))) / 100);
  });

  ngOnInit(): void {
    console.log('ngOnInit called')

    this.isLoading.set(true);
    this.productDetailService
      .loadProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => {
        this.products.set(products);
        this.isLoading.set(false);
        combineLatest([this.route.paramMap, this.route.queryParamMap])
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(([paramMap, queryParamMap]) => {
            const id = paramMap.get('id') ?? '';
            const querySku = queryParamMap.get('variant') ?? this.extractVariantFromUrl();
            this.bindProduct(id, querySku);
          });
      });

      this.router.navigate(['/product', 'p1006']);
  }

  selectColor(color: string): void {
    const item = this.product();
    if (!item) return;
    const match = item.variants.find((variant) => variant.color === color);
    if (match) {
      this.setVariant(match.sku);
    }
  }

  selectSize(size: string): void {
    const item = this.product();
    if (!item) return;
    const currentColor = this.selectedVariant()?.color;
    const match = item.variants.find((variant) => variant.size === size && (!currentColor || variant.color === currentColor))
      ?? item.variants.find((variant) => variant.size === size);
    if (match) {
      this.setVariant(match.sku);
    }
  }

  setVariant(sku: string): void {
    this.selectedSku.set(sku);
    this.selectedImage.set(this.selectedVariant()?.images?.[0] ?? '');
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { variant: sku },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  setImage(image: string): void {
    this.selectedImage.set(image);
  }

  setOpenSpec(title: string): void {
    this.openSpec.set(this.openSpec() === title ? '' : title);
  }

  getSwatchColor(color: string): string {
    return this.colorCodeMap()[color] ?? '#7f878c';
  }

  private bindProduct(idOrSlug: string, querySku: string): void {
    const normalizedId = (idOrSlug || '').trim().toLowerCase();
    const item = this.products().find((product) =>
      product._id.toLowerCase() === normalizedId || product.slug.toLowerCase() === normalizedId
    ) ?? null;
    this.product.set(item);
    if (!item) return;

    const normalizedSku = (querySku || '').trim().toLowerCase();
    const variant = item.variants.find((entry) => entry.sku.toLowerCase() === normalizedSku) ?? item.variants[0];
    this.selectedSku.set(variant?.sku ?? '');
    this.selectedImage.set(variant?.images?.[0] ?? '');
  }

  private extractVariantFromUrl(): string {
    if (globalThis.window === undefined) {
      return '';
    }
    const match = /[?&]variant[=-]([^&]+)/i.exec(globalThis.window.location.search);
    return match?.[1] ?? '';
  }
}
