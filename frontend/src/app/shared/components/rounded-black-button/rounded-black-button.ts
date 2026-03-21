import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-rounded-black-button',
  imports: [NgClass],
  templateUrl: './rounded-black-button.html',
  styleUrl: './rounded-black-button.css',
})
export class RoundedBlackButton {
 placeholder = input<string>('')
  buttonClass= input<string>('')
  colorClass= input<string>('')
}
