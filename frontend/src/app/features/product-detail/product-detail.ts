import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';

type ProductVariant = {
  sku: string;
  size: string;
  color: string;
  colorCode?: string;
  price: number;
  discount: number;
  stock: number;
  images: string[];
};

type ProductDetailModel = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  variants: ProductVariant[];
  averageRating: number;
  totalReviews: number;
  specifications: Array<{ title: string; value: string }>;
};

const FALLBACK_PRODUCTS: ProductDetailModel[] = [
  {
    _id: 'p1001',
    title: 'Capilene Cool Sun Hoody',
    slug: 'capilene-cool-sun-hoody',
    description: 'Our Capilene Cool Sun Hoody provides 40+ UPF sun protection, plus moisture-wicking and fast-drying performance for active days outdoors.',
    averageRating: 4.4,
    totalReviews: 29,
    specifications: [
      { title: 'Fit', value: 'Regular fit, true to size.' },
      { title: 'Specs & Features', value: '40+ UPF, moisture-wicking, fast-drying.' },
      { title: 'Materials & Care Instructions', value: '100% recycled polyester jersey. Machine wash cold.' },
    ],
    variants: [
      {
        sku: 'CCSH-COAL-XS',
        size: 'XS',
        color: 'Coal Orange',
        price: 89,
        discount: 0,
        stock: 6,
        images: ['assets/images/promotional_banner_1.webp', 'assets/images/promotional_banner_1.webp'],
      },
      {
        sku: 'CCSH-NAVY-M',
        size: 'M',
        color: 'Navy Blue',
        price: 92,
        discount: 5,
        stock: 5,
        images: ['assets/images/promotional_banner_1.webp', 'assets/images/promotional_banner_1.webp'],
      },
    ],
  },
  {
    _id: 'p1005',
    title: "Women's Glide Loafer",
    slug: 'womens-glide-loafer',
    description: 'Soft slip-on loafer with lightweight comfort.',
    averageRating: 4.6,
    totalReviews: 21,
    specifications: [
      { title: 'Fit', value: 'Comfort fit.' },
      { title: 'Specs & Features', value: 'Flexible sole and soft upper.' },
      { title: 'Materials & Care Instructions', value: 'Spot clean only.' },
    ],
    variants: [
      {
        sku: 'WGL-SAND-S',
        size: 'S',
        color: 'Light Sand',
        price: 125,
        discount: 0,
        stock: 9,
        images: ['assets/images/promotional_banner_1.webp', 'assets/images/promotional_banner_1.webp'],
      },
    ],
  },
];

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  products = signal<ProductDetailModel[]>([]);
  product = signal<ProductDetailModel | null>(null);
  selectedSku = signal('');
  selectedImage = signal('');
  openSpec = signal('Fit');

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

  async ngOnInit(): Promise<void> {
    await this.loadProducts();
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([paramMap, queryParamMap]) => {
      const id = paramMap.get('id') ?? '';
      const querySku = queryParamMap.get('variant') ?? this.extractVariantFromUrl();
      this.bindProduct(id, querySku);
    });
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
    this.selectedImage.set(this.selectedVariant()?.images[0] ?? '');
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

  private async loadProducts(): Promise<void> {
    const cacheBust = `v=${Date.now()}`;
    const paths = [`/mockData/products.json?${cacheBust}`, `mockData/products.json?${cacheBust}`, '/mockData/products.json', 'mockData/products.json'];

    for (const path of paths) {
      try {
        const response = await fetch(path);
        if (!response.ok) {
          continue;
        }

        const data = (await response.json()) as { products?: ProductDetailModel[] };
        this.products.set((data.products?.length ? data.products : FALLBACK_PRODUCTS));
        return;
      } catch {
        // try next path
      }
    }

    this.products.set(FALLBACK_PRODUCTS);
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
    if (typeof window === 'undefined') {
      return '';
    }
    const match = window.location.search.match(/[?&]variant[=-]([^&]+)/i);
    return match?.[1] ?? '';
  }
}
