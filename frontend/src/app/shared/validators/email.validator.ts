import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Reusable email format validator.
 * Use alongside Validators.required when the field is mandatory.
 * Returns { invalidEmail: true } when the value is present but not a valid email.
 */
export function emailFormatValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) {
    return null; // let Validators.required handle empty case
  }
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(value) ? null : { invalidEmail: true };
}
