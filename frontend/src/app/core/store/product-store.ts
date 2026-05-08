import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signalStore, withMethods, withState, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

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
  gender: 'men' | 'women' | 'kids' | 'unisex';
  category: string;
  subCategory: string;
  isTrending?: boolean;
  isLimitedOffer?: boolean;
  variants: ProductVariantModel[];
};

type ProductState = {
  products: ProductModel[];
  isLoaded: boolean;
};

const initialState: ProductState = {
  products: [],
  isLoaded: false,
};

export const ProductStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, http = inject(HttpClient)) => ({
    async loadProducts(): Promise<ProductModel[]> {
      if (store.isLoaded()) return store.products();
      const data = await firstValueFrom(
        http.get<{ products?: ProductModel[] }>('/mockData/products.json'),
      );
      const products = data.products ?? [];
      patchState(store, { products, isLoaded: true });
      return products;
    },
  })),
);
