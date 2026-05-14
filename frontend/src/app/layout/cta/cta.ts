import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlackButton } from "../../shared/components/black-button/black-button";
import { emailFormatValidator } from '../../shared/validators/email.validator';

@Component({
  selector: 'app-cta',
  imports: [BlackButton, ReactiveFormsModule],
  templateUrl: './cta.html',
  styleUrl: './cta.css',
})
export class Cta {
  private readonly fb = inject(FormBuilder);

  submitted = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, emailFormatValidator]],
  });

  get emailInvalid(): boolean {
    const ctrl = this.form.controls.email;
    return ctrl.invalid && ctrl.touched;
  }

  get emailError(): string {
    const ctrl = this.form.controls.email;
    if (ctrl.hasError('required')) return 'Email address is required.';
    if (ctrl.hasError('invalidEmail')) return 'Please enter a valid email address.';
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.set(true);
  }
}
