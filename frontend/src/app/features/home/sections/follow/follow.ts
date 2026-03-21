import { Component, signal } from '@angular/core';
import { RoundedBlackButton } from "../../../../shared/components/rounded-black-button/rounded-black-button";
import { CarouselModule } from 'ngx-owl-carousel-o';
import { OwlOptions } from 'ngx-owl-carousel-o';
@Component({
  selector: 'app-follow',
  imports: [RoundedBlackButton, CarouselModule],
  templateUrl: './follow.html',
  styleUrl: './follow.css',
})
export class Follow {
  customOptions: OwlOptions = {
  loop: true,
  mouseDrag: true,
  touchDrag: true,
  pullDrag: true,
  dots: true,
  navSpeed: 0,
  autoplaySpeed: 1000,
  autoplay:true,
  responsive: {
    0: { items: 1 },
    400: { items: 3 },
    740: { items: 5 },
    940: { items: 7 }
  },
}
  images=signal([
    'assets/images/home/follow/1.png',
    'assets/images/home/follow/2.png',
    'assets/images/home/follow/3.png',
    'assets/images/home/follow/4.png',
    'assets/images/home/follow/5.png',
    'assets/images/home/follow/6.png',
    'assets/images/home/follow/7.png',
    'assets/images/home/follow/7.png',
    ])
  // duplicateImages=signal([...this.images(),...this.images(),...this.images(),...this.images()])

}
