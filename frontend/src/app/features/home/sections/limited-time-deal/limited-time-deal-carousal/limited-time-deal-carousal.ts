import { Component, signal } from '@angular/core';
import { NgClass } from "@angular/common";
import { LeadingZeroPipe } from '../../../../../shared/pipes/leading-zero-pipe';

  
@Component({
  selector: 'app-limited-time-deal-carousal',
  imports: [NgClass, LeadingZeroPipe],
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

}
