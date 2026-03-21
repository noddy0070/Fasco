import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'leadingZero',
  standalone:true,
})
export class LeadingZeroPipe implements PipeTransform {

  transform(value: number):string {
    if(value == null) return '00';
    if(value<10 ) return '0'+value;
    return value.toString();
  }

}
