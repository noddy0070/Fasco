import { Component, signal, ViewChild } from '@angular/core';
import { NgClass, NgFor } from "@angular/common";
import { LeadingZeroPipe } from '../../../../../shared/pipes/leading-zero-pipe';
import { CarouselComponent, OwlOptions } from 'ngx-owl-carousel-o';
import { CarouselModule } from 'ngx-owl-carousel-o';
  
@Component({
  selector: 'app-limited-time-deal-carousal',
  imports: [NgClass, NgFor, LeadingZeroPipe, CarouselModule],
  templateUrl: './limited-time-deal-carousal.html',
  styleUrl: './limited-time-deal-carousal.css',
})
export class LimitedTimeDealCarousal {
  // Image Data
  images = signal([
    {
      src:'assets/images/home/limited/image1.png',
      name:'Spring Sale',
      discount:'50% OFF',
      url:''
    },
    {
      src:'assets/images/home/limited/image2.png',
      name:'Spring Sale',
      discount:'50% OFF',
      url:''
    },
    {
      src:'assets/images/home/limited/image3.png',
      name:'Spring Sale',
      discount:'50% OFF',
      url:''
    },
    
  ])

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    navSpeed: 0,
    dots:true,
    autoplaySpeed: 1000,

    smartSpeed:200,
    responsive: {
       
    },
  };

  @ViewChild('carousel', { static: false }) carousel!: CarouselComponent;

  trackByIndex(index: number): number {
    return index;
  }

  next() {
    this.carousel?.next();
  }

  prev() {
    this.carousel?.prev();
  }

}
