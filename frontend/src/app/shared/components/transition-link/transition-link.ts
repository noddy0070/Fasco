import { Component, ElementRef, inject, Input, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transition-link',
  imports: [NgClass],
  templateUrl: './transition-link.html',
  styleUrl: './transition-link.css',
})
export class TransitionLink implements OnInit {
 private readonly router = inject(Router);
 private readonly hostElement = inject(ElementRef<HTMLElement>);

  @Input() link!: string;
  hostClasses = '';

  ngOnInit(): void {
    this.hostClasses = this.hostElement.nativeElement.className;
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async handleClick(event: Event) {
    event.preventDefault();

    document.body.classList.add('page-transition');

    await this.sleep(200);

    await this.router.navigateByUrl(this.link);

    await this.sleep(200);

    document.body.classList.remove('page-transition');
  }
}
