import { Component } from '@angular/core';
import { BlackButton } from "../../../shared/components/black-button/black-button";
import { TransitionLink } from "../../../shared/components/transition-link/transition-link";
import { AuthFrame } from "../../../layout/auth-frame/auth-frame";

@Component({
  selector: 'app-login',
  imports: [BlackButton, TransitionLink, AuthFrame],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login{
  showPassword = false;
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
