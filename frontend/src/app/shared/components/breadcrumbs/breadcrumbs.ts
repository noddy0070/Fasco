import { Component, input } from '@angular/core';
import { TransitionLink } from '../transition-link/transition-link';

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

@Component({
  selector: 'app-breadcrumbs',
  imports: [TransitionLink],
  templateUrl: './breadcrumbs.html',
  styleUrl: './breadcrumbs.css',
})
export class Breadcrumbs {
  items = input<BreadcrumbItem[]>([]);
  separator = input<string>('/');
}