import { Component ,signal} from '@angular/core';
import { BlackButton } from "../../../../shared/components/black-button/black-button";
import {RoundedBlackButton} from "../../../../shared/components/rounded-black-button/rounded-black-button";
@Component({
  selector: 'app-peaky-blinder',
  imports: [BlackButton, RoundedBlackButton],
  templateUrl: './peaky-blinder.html',
  styleUrl: './peaky-blinder.css',
})
export class PeakyBlinder {
  services=signal([
    {
      name:'Warranty Protection',
      description:'Over 2 Years',
      url:'assets/images/home/peaky-blinder/warranty.svg',
    },
    {
      name:'High Quality',
      description:'Creafted from top materials',
      url:'assets/images/home/peaky-blinder/high-quality.svg',
    },
    {
      name:'Free Shipping',
      description:'Order over 150$',
      url:'assets/images/home/peaky-blinder/shipping.svg',
    },
    {
      name:'24/7 Support',
      description:'Dedicated Support',
      url:'assets/images/home/peaky-blinder/support.svg',
    },
      ])
}
