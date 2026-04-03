import { Component, computed, ElementRef,  HostListener, signal, ViewChild } from '@angular/core';
import { TransitionLink } from "../../../shared/components/transition-link/transition-link";
import { BlackButton } from "../../../shared/components/black-button/black-button";
import { AuthFrame } from "../../../layout/auth-frame/auth-frame";

@Component({
  selector: 'app-signup',
  imports: [TransitionLink, BlackButton, AuthFrame],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  showPassword = false;

togglePassword() {
  this.showPassword = !this.showPassword;
}

@ViewChild('eye', { static: true }) eyeRef!: ElementRef<HTMLDivElement>;

  mouseX = signal(0);
  mouseY = signal(0);

  // Track mouse globally
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseX.set(event.clientX);
    this.mouseY.set(event.clientY);
  }
  pupilTransform = computed(() => {
    const rect = this.eyeRef.nativeElement.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rawAngle = Math.atan2(
      this.mouseY() - centerY,
      this.mouseX() - centerX
    );
    const dx = this.mouseX() - centerX;
    const dy = this.mouseY() - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 8;
    const dynamicRadius = Math.min(distance / 10, maxRadius);

    const angle = rawAngle - Math.PI / 4;

    const x = Math.cos(angle) * dynamicRadius;
    const y = Math.sin(angle) * dynamicRadius;

    return `translate(-50%, -50%) translate(${x}px, ${y}px)`;
  });

}
