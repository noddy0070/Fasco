export interface CollectionTab {
  label: string;
  slug: string;
}

export interface CollectionProduct {
  productId: string;
  variantSku: string;
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

export interface CollectionPromoAction {
  label: string;
  slug: string;
}

export interface CollectionPromo {
  eyebrow: string;
  title: string;
  description: string;
  actions: CollectionPromoAction[];
}

export interface CollectionData {
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

export interface CollectionDataFile {
  collections: CollectionData[];
}

export interface FilterColorOption {
  label: string;
  swatch: string;
}

export interface PriceRangeOption {
  label: string;
  min: number;
  max: number;
}
