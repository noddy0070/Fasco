import { Component } from '@angular/core';
import { input } from "@angular/core";
@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  title=input<string>('')
  price=input<string>('')
  url=input<string>('')

}
