import { Component, inject, signal, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserStore } from '../../../core/store/user-store';
import { AdminService } from '../admin.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-login',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './admin-login.html',
    styleUrl: './admin-login.css',
})
export class AdminLogin {
    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly adminService = inject(AdminService);
    private readonly userStore = inject(UserStore);
    private readonly destroyRef = inject(DestroyRef);

    readonly isSubmitting = signal(false);
    readonly errorMessage = signal<string | null>(null);
    readonly passwordVisible = signal(false);

    readonly form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
    });

    get emailControl() { return this.form.controls.email; }
    get passwordControl() { return this.form.controls.password; }

    togglePasswordVisibility(): void {
        this.passwordVisible.update((v) => !v);
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessage.set(null);

        const payload = this.form.getRawValue();

        this.adminService
            .login(payload)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    this.userStore.setUser(res.data);
                    this.isSubmitting.set(false);
                    this.router.navigate(['/admin/dashboard']);
                },
                error: (err: { error?: { message?: string } }) => {
                    this.errorMessage.set(err.error?.message ?? 'Login failed. Please try again.');
                    this.isSubmitting.set(false);
                },
            });
    }
}
