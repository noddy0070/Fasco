import { Component, input } from '@angular/core';
import { CollectionProduct } from '../collection.types';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-collection-product-card',
  imports: [RouterLink],
  templateUrl: './collection-product-card.html',
  styleUrl: './collection-product-card.css',
})
export class CollectionProductCard {
  product = input.required<CollectionProduct>();
}
