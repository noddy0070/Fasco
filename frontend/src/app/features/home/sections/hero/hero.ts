import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlackButton } from "../../../../shared/components/black-button/black-button";

@Component({
  selector: 'app-home-hero',
  imports: [BlackButton, RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {

}
