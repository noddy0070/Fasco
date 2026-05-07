import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserStore } from '../../core/store/user-store';
import { TransitionLink } from '../../shared/components/transition-link/transition-link';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, TransitionLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly router = inject(Router);
  readonly store = inject(UserStore);

  readonly user = computed(() => this.store.user());

  activeTab = signal<'profile' | 'orders' | 'cart' | 'wishlist'>('profile');

  setTab(tab: 'profile' | 'orders' | 'cart' | 'wishlist'): void {
    this.activeTab.set(tab);
  }

  logout(): void {
    void this.store.logout().then(() => this.router.navigate(['/login']));
  }

  getInitials(firstName: string, lastName?: string): string {
    const f = firstName?.[0]?.toUpperCase() ?? '';
    const l = lastName?.[0]?.toUpperCase() ?? '';
    return f + l || '?';
  }
}
