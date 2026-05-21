import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminStore } from '../../../core/store/admin-store';
import { AdminService } from '../admin.service';
import type { AdminUserModel } from '../admin.models';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './user-management.html',
    styleUrl: './user-management.css',
})
export class UserManagement implements OnInit {
    private readonly adminStore = inject(AdminStore);
    private readonly adminService = inject(AdminService);
    private readonly fb = inject(FormBuilder);
    private readonly destroyRef = inject(DestroyRef);

    readonly users = computed(() => this.adminStore.users());
    readonly userTotal = computed(() => this.adminStore.userTotal());
    readonly isLoading = computed(() => this.adminStore.isLoading());
    readonly error = computed(() => this.adminStore.error());

    readonly showModal = signal(false);
    readonly editTarget = signal<AdminUserModel | null>(null);
    readonly formError = signal<string | null>(null);
    readonly isSubmitting = signal(false);

    readonly form = this.fb.nonNullable.group({
        firstName: ['', Validators.required],
        lastName: [''],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        password: ['', Validators.minLength(6)],
        role: ['user', Validators.required],
        isBlocked: [false],
        isVerified: [true],
    });

    ngOnInit(): void {
        this.adminStore.loadUsers();
    }

    openCreate(): void {
        this.editTarget.set(null);
        this.form.reset({ role: 'user', isBlocked: false, isVerified: true });
        this.form.controls.email.enable();
        this.form.controls.password.setValidators([Validators.required, Validators.minLength(6)]);
        this.form.controls.password.updateValueAndValidity();
        this.formError.set(null);
        this.showModal.set(true);
    }

    openEdit(user: AdminUserModel): void {
        this.editTarget.set(user);
        this.form.patchValue({
            firstName: user.firstName,
            lastName: user.lastName ?? '',
            email: user.email,
            phone: user.phone ?? '',
            role: user.role,
            isBlocked: user.isBlocked,
            isVerified: user.isVerified,
        });
        this.form.controls.email.disable();
        this.form.controls.password.clearValidators();
        this.form.controls.password.updateValueAndValidity();
        this.formError.set(null);
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
    }

    async onSubmit(): Promise<void> {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        this.formError.set(null);

        const raw = this.form.getRawValue();
        const target = this.editTarget();
        let success: boolean;

        if (target) {
            const { email: _e, password: _p, ...updatePayload } = raw;
            success = await this.adminStore.updateUser(target._id, updatePayload);
        } else {
            success = await this.adminStore.createUser(raw as Parameters<typeof this.adminStore.createUser>[0]);
        }

        this.isSubmitting.set(false);

        if (success) {
            this.showModal.set(false);
        } else {
            this.formError.set(this.adminStore.error() ?? 'Operation failed');
        }
    }

    async onDelete(user: AdminUserModel): Promise<void> {
        if (!confirm(`Delete user ${user.email}? This cannot be undone.`)) return;
        await this.adminStore.deleteUser(user._id);
    }

    onToggleBlock(user: AdminUserModel): void {
        this.adminService
            .updateUser(user._id, { isBlocked: !user.isBlocked })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => this.adminStore.loadUsers(this.adminStore.userPage()),
            });
    }
}
