import { Component, signal, computed , OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlackButton } from "../../../../shared/components/black-button/black-button";
import {interval,Subscription} from 'rxjs'
import { LeadingZeroPipe } from '../../../../shared/pipes/leading-zero-pipe';
import { LimitedTimeDealCarousal } from "./limited-time-deal-carousal/limited-time-deal-carousal";



@Component({
  selector: 'app-limited-time-deal',
  imports: [BlackButton, LeadingZeroPipe, LimitedTimeDealCarousal, RouterLink],
  templateUrl: './limited-time-deal.html',
  styleUrl: './limited-time-deal.css',
})
export class LimitedTimeDeal implements OnDestroy {
  timeLeft = signal(60*60*24*7);
  
  private timerSub!:Subscription

  constructor(){
    this.startTimer();
  }
  startTimer(){
     this.timerSub = interval(1000).subscribe(()=>{
      this.timeLeft.update((t)=>t>0?t-1:0)
     })
  }
  ngOnDestroy(){
    this.timerSub?.unsubscribe();
  }
  
  days=computed(()=>Math.floor(this.timeLeft()/(60*60*24)))
  hrs=computed(()=>Math.floor((this.timeLeft()%(60*60*24))/(60*60)))
  mins=computed(()=>Math.floor((this.timeLeft()%(60*60))/(60)))
  sec=computed(()=>Math.floor(this.timeLeft()%(60)))

  timeList = computed(()=>{
    const d = this.days();
    const h = this.hrs();
    const m = this.mins();
    const s = this.sec();
    return [{value:d, title:'days'}, {value:h, title:'hrs'}, {value:m, title:'mins'}, {value:s, title:'sec'}]
  })

  
  
}
