import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from "./layout/header/header";
import { Footer } from "./layout/footer/footer";
import { filter } from 'rxjs/internal/operators/filter';
import { UserStore } from './core/store/user-store';
@Component({
  selector: 'app-root',
  styleUrl: './app.css',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: `./app.html`,
})
export class App implements OnInit{
  protected readonly title=signal('Ecommerce App');
  private readonly userStore = inject(UserStore);

  ngOnInit(): void {
    this.userStore.hydrateFromSession();
    this.loadCarouselStyles();
  }

  constructor(readonly router: Router) {
  this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe((event: NavigationEnd) => {
    this.showHeader.set(
  !this.noHeaderRoutes().some(route =>
    event.urlAfterRedirects.startsWith(route)
  )
);
  });
}

  noHeaderRoutes = signal(['/login', '/signup', '/forgot-password', '/404', '/admin']);
  showHeader = signal(true);

  loadCarouselStyles() {
    const links = [
    { href: 'assets/css/owl.carousel.min.css', id: 'owl-carousel-css' },
    { href: 'assets/css/owl.theme.default.min.css', id: 'owl-theme-css' },
    { href: 'assets/css/swiper-bundle.min.css', id: 'swiper-css' }
  ];

  links.forEach(({ href, id }) => {
    if (document.getElementById(id)) return;

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;

    // 🔥 non-blocking
    link.media = 'print';
    link.onload = () => (link.media = 'all');

    document.head.appendChild(link);
  });

  }
}
