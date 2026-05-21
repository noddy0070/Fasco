import { inject } from '@angular/core';
import { signalStore, withMethods, withState, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { ProductService } from '../../features/products/product.service';

export type ProductVariantModel = {
  sku: string;
  size: string;
  color: string;
  colorCode?: string;
  price: number;
  discount: number;
  stock: number;
  images: string[];
};

export type ProductModel = {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  gender: 'men' | 'women' | 'kids' | 'unisex';
  category: string;
  subCategory: string;
  isTrending?: boolean;
  isLimitedOffer?: boolean;
  isActive?: boolean;
  averageRating?: number;
  totalReviews?: number;
  variants: ProductVariantModel[];
};

type ProductState = {
  products: ProductModel[];
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
};

const initialState: ProductState = {
  products: [],
  isLoaded: false,
  isLoading: false,
  error: null,
};

export const ProductStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, productService = inject(ProductService)) => ({
    async loadProducts(): Promise<ProductModel[]> {
      if (store.isLoaded()) return store.products();

      patchState(store, { isLoading: true, error: null });
      try {
        const res = await firstValueFrom(productService.getProducts());
        const products = res.data ?? [];
        patchState(store, { products, isLoaded: true, isLoading: false });
        return products;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load products';
        patchState(store, { isLoading: false, error: message });
        return [];
      }
    },

    invalidate(): void {
      patchState(store, { isLoaded: false });
    },
  })),
);
