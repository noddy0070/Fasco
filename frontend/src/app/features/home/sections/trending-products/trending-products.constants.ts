export interface TrendingColor {
  name: string;
  class: string;
}

export interface TrendingProduct {
  id: string;
  name: string;
  price: string;
  image?: string;
  imageUrl?: string;
  variant?: string;
  priceValue?: number;
  badge?: string;
  moreColors?: string;
  swatches?: string[];
  sizes?: string[];
  colors?: string[];
  productType?: string;
  material?: string;
  categories: string[];
}

export const TRENDING_FILTERS = [
  "Men's Fashion",
  "Women's Fashion",
  "Men's Accessories",
  "Women's Accessories",
  'Discount Deals',
] as const;

export const TRENDING_COLORS: TrendingColor[] = [
  { name: 'PINK', class: 'bg-[#F44E8A]' },
  { name: 'DARK GREEN', class: 'bg-[#44936D]' },
  { name: 'YELLOW', class: 'bg-[#F4CF4E]' },
  { name: 'BLUE SKY', class: 'bg-[#5FABE2]' },
  { name: 'NAVY BLUE', class: 'bg-[#233C6B]' },
  { name: 'CLEAN WHITE', class: 'bg-[#FFFFFF] border border-[#DEDEDE]' },
  { name: 'RED PASTEL', class: 'bg-[#E25F5F]' },
];

