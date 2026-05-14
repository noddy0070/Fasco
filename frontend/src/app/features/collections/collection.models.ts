import { ProductModel } from '../../core/store/product-store';
export type { ProductVariantModel, ProductModel } from '../../core/store/product-store';

export interface CollectionFilterParams {
  sizes: string[];
  colors: string[];
  prices: string[];
  categories: string[];
  subCategories: string[];
}

import { CollectionData } from '../../shared/collection/collection.types';

export interface CollectionPageData {
  collections: CollectionData[];
  allProducts: ProductModel[];
}
