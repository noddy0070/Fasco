import { Component, signal } from '@angular/core';
import { Cta } from "../cta/cta";
import { TransitionLink } from "../../shared/components/transition-link/transition-link";

@Component({
  selector: 'app-footer',
  imports: [Cta, TransitionLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  footerQuickLinks=signal([
    { name: 'Home', url: '/' },
    { name: 'Blogs', url: '/blogs' },
    { name: 'Shop All', url: '/shop' },
    { name: 'Refunds', url: '/refunds' },
    { name: 'Track Your Order', url: '/track-order' },
    { name: 'Promotions/ Bundles', url: '/promotions' },
    { name: 'Support', url: '/support' },
    { name: 'Shipping Faq', url: '/shipping-faq' },
    { name: 'Rewards', url: '/rewards' },
    { name: 'Flowers', url: '/' },
    { name: 'Concentrates', url: '/' },
    { name: 'Edibles', url: '/' },
  ])

  footerContactLinks=signal([
    { name: 'Email: sraj95922@gmail.com', url: 'mailto:sraj95922@gmail.com' },
  ])

  footerMoreLinks=signal([
    { name: 'Privacy Policy', url: '/privacy-policy' },
    { name: 'Terms of Service', url: '/terms-of-service' },
    { name: 'Cookie Policy', url: '/cookie-policy' },
    { name: 'Cookie Policy', url: '/cookie-policy' },
    { name: 'Cookie Policy', url: '/cookie-policy' },
    { name: 'Cookie Policy', url: '/cookie-policy' },
    { name: 'Cookie Policy', url: '/cookie-policy' },
    { name: 'Cookie Policy', url: '/cookie-policy' },
  ])
}