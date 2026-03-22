import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { LeadingZeroPipe } from '../../../../../shared/pipes/leading-zero-pipe';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const GAP = 16;

@Component({
  selector: 'app-limited-time-deal-carousal',
  imports: [LeadingZeroPipe],
  templateUrl: './limited-time-deal-carousal.html',
  styleUrl: './limited-time-deal-carousal.css',
  host: {
    class: 'block w-full min-w-0 max-w-full flex-1',
  },
})
export class LimitedTimeDealCarousal {
  private readonly destroyRef = inject(DestroyRef);

  images = signal([
    {
      src: 'assets/images/home/limited/image1.png',
      name: 'Spring Sale',
      discount: '50% OFF',
      url: '',
    },
    {
      src: 'assets/images/home/limited/image2.png',
      name: 'Spring Sale',
      discount: '50% OFF',
      url: '',
    },
    {
      src: 'assets/images/home/limited/image3.png',
      name: 'Spring Sale',
      discount: '50% OFF',
      url: '',
    },
    {
      src: 'assets/images/home/limited/image3.png',
      name: 'Spring Sale',
      discount: '50% OFF',
      url: '',
    },
    {
      src: 'assets/images/home/limited/image3.png',
      name: 'Spring Sale',
      discount: '50% OFF',
      url: '',
    },
  ]);

  private readonly swiperHost = viewChild.required<ElementRef<HTMLElement>>('swiperHost');
  private readonly carouselPrev = viewChild.required<ElementRef<HTMLButtonElement>>('carouselPrev');
  private readonly carouselNext = viewChild.required<ElementRef<HTMLButtonElement>>('carouselNext');

  constructor() {
    afterNextRender(() => {
      const host = this.swiperHost().nativeElement;
      const paginationEl = host.querySelector<HTMLElement>('.swiper-pagination');
      if (!paginationEl) {
        return;
      }

      let rafId = 0;
      const scheduleUpdate = (swiper: InstanceType<typeof Swiper>) => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          swiper.update();
          rafId = 0;
        });
      };

      const swiper = new Swiper(host, {
        modules: [Navigation, Pagination],
        slidesPerView: 'auto',
        spaceBetween: GAP,
        centeredSlides: false,
        slidesPerGroup: 1,
        loop: true,
        rewind: true,
        watchOverflow: true,

        navigation: {
          prevEl: this.carouselPrev().nativeElement,
          nextEl: this.carouselNext().nativeElement,
        },
        pagination: {
          el: paginationEl,
          clickable: true,
        },

        on: {
          init: (s) => scheduleUpdate(s),
          slideChangeTransitionEnd: (s) => scheduleUpdate(s),
          resize: (s) => scheduleUpdate(s),
        },
      });

      const ro = new ResizeObserver(() => scheduleUpdate(swiper));
      ro.observe(host);

      this.destroyRef.onDestroy(() => {
        cancelAnimationFrame(rafId);
        ro.disconnect();
        swiper.destroy(true, true);
      });
    });
  }
}
