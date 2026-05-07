import { Component, input } from '@angular/core';
import { CollectionProduct } from '../collection.types';

@Component({
  selector: 'app-collection-product-card',
  imports: [],
  templateUrl: './collection-product-card.html',
  styleUrl: './collection-product-card.css',
})
export class CollectionProductCard {
  product = input.required<CollectionProduct>();
}
