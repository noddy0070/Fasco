import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BlackButton } from "../../shared/components/black-button/black-button";
import { TransitionLink } from '../../shared/components/transition-link/transition-link';
import { UserStore } from '../../core/store/user-store';
import { SearchService, SearchProduct } from '../../services/search.service';

@Component({
  selector: 'app-header',
  imports: [BlackButton, TransitionLink, CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  store = inject(UserStore);
  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);

  navLinks = signal([
    { name: 'Shop', url: '/collections/mens-new-arrivals' },
    { name: 'Deals', url: '/collections/sale' },
    { name: 'New Arrivals', url: '/collections/womens-new-arrivals' },
    { name: 'Packages', url: '/collections/featured' },
  ]);

  searchQuery = signal('');
  suggestions = signal<SearchProduct[]>([]);
  isDropdownOpen = signal(false);

  ngOnInit(): void {
    void this.searchService.loadProducts();
  }

  onSearchInput(query: string): void {
    this.searchQuery.set(query);
    if (query.trim().length >= 1) {
      this.suggestions.set(this.searchService.getTopSuggestions(query));
      this.isDropdownOpen.set(this.suggestions().length > 0);
    } else {
      this.suggestions.set([]);
      this.isDropdownOpen.set(false);
    }
  }

  onSearchSubmit(): void {
    const q = this.searchQuery().trim();
    if (!q) return;
    this.isDropdownOpen.set(false);
    void this.router.navigate(['/search'], { queryParams: { q } });
  }

  selectSuggestion(product: SearchProduct): void {
    this.searchQuery.set(product.name);
    this.isDropdownOpen.set(false);
    void this.router.navigate(['/search'], { queryParams: { q: product.name } });
  }

  closeDropdown(): void {
    setTimeout(() => this.isDropdownOpen.set(false), 150);
  }
}
