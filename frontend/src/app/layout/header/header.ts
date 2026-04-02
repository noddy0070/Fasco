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
    { name: 'Shop', url: '/shop' },
    { name: 'Deals', url: '/deals' },
    { name: 'New Arrivals', url: '/new-arrivals' },
    { name: 'Packages', url: '/packages' },
  ]);
}
