import { FormControl } from '@angular/forms';
import { emailFormatValidator } from './email.validator';

describe('emailFormatValidator', () => {
  const validate = (value: string) =>
    emailFormatValidator(new FormControl(value) as InstanceType<typeof FormControl>);

  it('should return null for empty string (defer to required validator)', () => {
    expect(validate('')).toBeNull();
  });

  it('should return null for a valid email', () => {
    expect(validate('user@example.com')).toBeNull();
    expect(validate('user.name+tag@sub.domain.org')).toBeNull();
    expect(validate('a@b.io')).toBeNull();
  });

  it('should return { invalidEmail: true } when "@" is missing', () => {
    expect(validate('userexample.com')).toEqual({ invalidEmail: true });
  });

  it('should return { invalidEmail: true } when domain is missing', () => {
    expect(validate('user@')).toEqual({ invalidEmail: true });
  });

  it('should return { invalidEmail: true } when TLD is missing', () => {
    expect(validate('user@example')).toEqual({ invalidEmail: true });
  });

  it('should return { invalidEmail: true } for spaces in email', () => {
    expect(validate('user @example.com')).toEqual({ invalidEmail: true });
  });
});
