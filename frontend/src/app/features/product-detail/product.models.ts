
export type ProductVariantModel = {
  sku: string;
  price: number;
  discount: number;
  stock: number;
  // Optional storefront display fields
  size?: string;
  color?: string;
  colorCode?: string;
  images?: string[];
};

export type ProductDetailModel = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  isActive: boolean;
  isTrending: boolean;
  isLimitedOffer: boolean;
  variants: ProductVariantModel[];
  averageRating: number;
  totalReviews: number;
  specifications: Array<{ title: string; value: string }>;
};