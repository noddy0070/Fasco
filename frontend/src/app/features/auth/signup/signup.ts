import { Component, computed, ElementRef,  HostListener, signal, ViewChild } from '@angular/core';
import { TransitionLink } from "../../../shared/components/transition-link/transition-link";
import { BlackButton } from "../../../shared/components/black-button/black-button";
import { AuthFrame } from "../../../layout/auth-frame/auth-frame";
import { EyeTrack } from "../../../shared/components/eye-track/eye-track";

@Component({
  selector: 'app-signup',
  imports: [TransitionLink, BlackButton, AuthFrame, EyeTrack],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
 isEyeClosed = signal(true);
 isEyeClosed2 = signal(true);

}
