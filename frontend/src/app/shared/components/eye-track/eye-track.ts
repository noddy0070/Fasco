import { AfterViewInit, Component, computed, ElementRef, HostListener, Input,  Signal, signal, ViewChild, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-eye-track',
  imports: [],
  templateUrl: './eye-track.html',
  styleUrl: './eye-track.css',
})
export class EyeTrack  implements AfterViewInit {

  @ViewChild('eyeButton', { static: false }) eyeButton!: ElementRef;
  @ViewChild('lid', { static: false }) lid!: ElementRef;
  @ViewChild('pupil', { static: false }) pupil!: ElementRef;
  @ViewChild('eye', { static: true }) eyeRef!: ElementRef<HTMLDivElement>;

  mouseX = signal(0);
  mouseY = signal(0);
  @Input() isEyeClosed!: WritableSignal<boolean>;

  // Track mouse globally
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseX.set(event.clientX);
    this.mouseY.set(event.clientY);
  }

  pupilTransform = computed(() => {
    // Don't move pupil if eye is closed
    if (!this.isEyeClosed()) {
      return 'translate(0%, 0%)';
    }

    const rect = this.eyeRef.nativeElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = this.mouseX() - centerX;
    const dy = this.mouseY() - centerY;
    
    // Calculate angle
    const angle = Math.atan2(dy, dx);
    const maxRadius = 10;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const normalizedDistance = Math.min(distance / 20, 1);
    const moveRadius = normalizedDistance * maxRadius;

    const x = Math.cos(angle) * moveRadius;
    const y = Math.sin(angle) * moveRadius;

    return `translate(0%, 0%) translate(${x}px, ${y}px)`;
  });

  ngAfterViewInit() {
    this.eyeButton.nativeElement.addEventListener('click', () => {
      this.toggleEye();
    });
  }

  private toggleEye() {
    const lidElement = this.lid.nativeElement;
    const pupilElement = this.pupil.nativeElement;

    if (lidElement.classList.contains('lid--open')) {
      lidElement.classList.remove('lid--open');
      pupilElement.classList.remove('pupil--open');
      this.isEyeClosed.set(false);
    } else {
      if (lidElement.classList.contains('lid--close')) {
        lidElement.classList.add('lid--open');
        pupilElement.classList.add('pupil--open');
        this.isEyeClosed.set(true);
      } else {
        lidElement.classList.add('lid--close');
        pupilElement.classList.add('pupil--close');
        this.isEyeClosed.set(false);
      }
    }
  }

}
