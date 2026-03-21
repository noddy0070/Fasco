import { Component, input } from '@angular/core';
import { NgClass } from "@angular/common";

@Component({
  selector: 'app-black-button',
  imports: [NgClass],
  templateUrl: './black-button.html',
  styleUrl: './black-button.css',
})
export class BlackButton {
  placeholder = input<string>('')
  buttonClass= input<string>('')
}
