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
  leftPressed = false;

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
        slidesPerGroup: 1,
        spaceBetween: GAP,
        centeredSlides: false,
        loop: true,
        rewind: true,
        watchOverflow: true,

        pagination: {
          el: paginationEl,
          clickable: true,
        },
        breakpoints:{
          0: {
            slidesPerView: 2,
          },
          640:{
            slidesPerView: 'auto',
          },
          768:{
            slidesPerView: 1,
          },
          800:{
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 'auto',
          },
        },
        on: {
          init: (s) => {
            requestAnimationFrame(() => s.update());
          },
          slideChangeTransitionEnd: (s) => {
            requestAnimationFrame(() => {
              s.updateSlides();   // 👈 important
              s.updateProgress(); // 👈 important
              s.update();         // 👈 final sync
            });
          },
        },
      });

      const nextBtn = this.carouselNext().nativeElement;
      const prevBtn = this.carouselPrev().nativeElement;
      nextBtn.addEventListener('click', () => {
        
        swiper.slideNext();
        if(screen.width<640 || (screen.width>=768 && screen.width<1024)) {
          return;
        }

        
        // Step 2: immediately correct with prev
      //   setTimeout(() => {
      //   if(this.leftPressed) {
      //   requestAnimationFrame(() => {
      //     swiper.slidePrev(); // instant snap back
      //   });
      // }
      //     this.leftPressed = true;

      // }, 1000);
      });

      prevBtn.addEventListener('click', () => {
        swiper.slidePrev();
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
