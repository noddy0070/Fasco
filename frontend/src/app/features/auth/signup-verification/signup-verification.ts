import { Component, signal } from '@angular/core';
import { AuthFrame } from "../../../layout/auth-frame/auth-frame";
import { BlackButton } from "../../../shared/components/black-button/black-button";
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-signup-verification',
  imports: [AuthFrame, BlackButton],
  templateUrl: './signup-verification.html',
  styleUrl: './signup-verification.css',
})
export class SignupVerification {
  token=signal('');
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    this.token.set(token || '');
  }
}
