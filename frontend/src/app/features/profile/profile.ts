import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserStore } from '../../core/store/user-store';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly router = inject(Router);
  readonly store = inject(UserStore);

  async logout(): Promise<void> {
    await this.store.logout();
    await this.router.navigate(['/login']);
  }
}
