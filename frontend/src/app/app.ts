import { Component, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from "./layout/header/header";
import { Footer } from "./layout/footer/footer";
import {ActivatedRoute} from '@angular/router';
import { filter } from 'rxjs/internal/operators/filter';
@Component({
  selector: 'app-root',
  styleUrl: './app.css',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: `./app.html`,
})
export class App implements OnInit{
  protected readonly title=signal('Ecommerce App');
   ngOnInit() {
    this.loadCarouselStyles();
  }

  constructor(private router: Router) {
  this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe((event: NavigationEnd) => {
    this.showHeader.set(!this.noHeaderRoutes().includes(event.urlAfterRedirects));
  });
}

  noHeaderRoutes = signal(['/login', '/signup']);
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
