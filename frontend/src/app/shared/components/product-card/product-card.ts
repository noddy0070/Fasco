import { Component, input } from '@angular/core';

export interface ProductCardItem {
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

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  product = input.required<ProductCardItem>();
}
