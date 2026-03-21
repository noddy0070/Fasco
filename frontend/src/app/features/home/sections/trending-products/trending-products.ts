import { Component, computed, signal } from '@angular/core';
import { RoundedBlackButton } from "../../../../shared/components/rounded-black-button/rounded-black-button";
import { ProductCard } from "../../../../shared/components/product-card/product-card";
@Component({
  selector: 'app-trending-products',
  imports: [RoundedBlackButton, ProductCard],
  templateUrl: './trending-products.html',
  styleUrl: './trending-products.css',
})
export class TrendingProducts {
  colors = signal([
    { name: 'PINK', class: 'bg-[#F44E8A]' },
    { name: 'DARK GREEN', class: 'bg-[#44936D]' },
    { name: 'YELLOW', class: 'bg-[#F4CF4E]' },
    { name: 'BLUE SKY', class: 'bg-[#5FABE2]' },
    { name: 'NAVY BLUE', class: 'bg-[#233C6B]' },
    { name: 'CLEAN WHITE', class: 'bg-[#FFFFFF] border border-[#DEDEDE]' },
    { name: 'RED PASTEL', class: 'bg-[#E25F5F]' },
  ]);

  products = signal([
    { name: 'Shiny Dress', price: '$225', imageUrl: 'assets/images/home/trend/Image-1.png' },
    { name: 'Long Dress', price: '$125', imageUrl: 'assets/images/home/trend/Image-2.png' },
    { name: 'Full Sweater', price: '$125', imageUrl: 'assets/images/home/trend/Image-3.png', span:2 },
    { name: 'White Dress', price: '$125', imageUrl: 'assets/images/home/trend/Image-4.png', span:2 },
    { name: 'Colorful Dress', price: '$125', imageUrl: 'assets/images/home/trend/Image-5.png' },
    { name: 'White Shirt', price: '$159', imageUrl: 'assets/images/home/trend/Image-6.png' },
  ])

  leftColumn = computed(() =>
    this.colors().filter((_, i) => i % 2 === 0)
  );

  rightColumn = computed(() =>
    this.colors().filter((_, i) => i % 2 !== 0)
  );

}
