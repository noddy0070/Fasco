import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transition-link',
  imports: [],
  templateUrl: './transition-link.html',
  styleUrl: './transition-link.css',
})
export class TransitionLink {
 private router = inject(Router);

  @Input() link!: string;

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async handleClick(event: Event) {
    event.preventDefault();

    document.body.classList.add('page-transition');

    await this.sleep(200);

    await this.router.navigateByUrl(this.link);

    await this.sleep(200);

    document.body.classList.remove('page-transition');
  }
}
