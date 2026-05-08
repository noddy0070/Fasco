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
