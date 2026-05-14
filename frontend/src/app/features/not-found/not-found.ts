import { Component } from '@angular/core';
import { TransitionLink } from '../../shared/components/transition-link/transition-link';

@Component({
  selector: 'app-not-found',
  imports: [TransitionLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {}
