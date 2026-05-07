import { Component, signal } from '@angular/core';
import { BlackButton } from "../../shared/components/black-button/black-button";
import { TransitionLink } from '../../shared/components/transition-link/transition-link';
@Component({
  selector: 'app-header',
  imports: [BlackButton, TransitionLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  navLinks = signal([
    { name: 'Shop', url: '/collections/mens-new-arrivals' },
    { name: 'Deals', url: '/collections/sale' },
    { name: 'New Arrivals', url: '/collections/womens-new-arrivals' },
    { name: 'Packages', url: '/collections/featured' },
  ]);
}
