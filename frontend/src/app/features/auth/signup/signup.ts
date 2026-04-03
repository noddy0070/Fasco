import { Component } from '@angular/core';
import { TransitionLink } from "../../../shared/components/transition-link/transition-link";
import { BlackButton } from "../../../shared/components/black-button/black-button";

@Component({
  selector: 'app-signup',
  imports: [TransitionLink, BlackButton],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  showPassword = false;

togglePassword() {
  this.showPassword = !this.showPassword;
}

}
