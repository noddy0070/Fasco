import { Component, signal } from '@angular/core';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { OwlOptions } from 'ngx-owl-carousel-o';
@Component({
  selector: 'app-carousal-test',
  standalone: true,
  imports: [CarouselModule],
  templateUrl: './carousal-test.html',
  styleUrl: './carousal-test.css',
})
export class CarousalTest {
  customOptions: OwlOptions = {
  loop: true,
  mouseDrag: false,
  touchDrag: false,
  pullDrag: false,
  dots: false,
  navSpeed: 700,
  navText: ['', ''],
  responsive: {
    0: { items: 1 },
    400: { items: 2 },
    740: { items: 3 },
    940: { items: 4 }
  },
  nav: true
}

slidesStore = signal<any[]>([
  { id: 'slide-1', text: 'Slide 1 HM' },
  { id: 'slide-2', text: 'Slide 2 HM' }
]);

}
