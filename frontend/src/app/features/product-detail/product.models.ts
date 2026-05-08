
export type ProductVariant = {
  sku: string;
  size: string;
  color: string;
  colorCode?: string;
  price: number;
  discount: number;
  stock: number;
  images: string[];
};

export type ProductDetailModel = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  variants: ProductVariant[];
  averageRating: number;
  totalReviews: number;
  specifications: Array<{ title: string; value: string }>;
};