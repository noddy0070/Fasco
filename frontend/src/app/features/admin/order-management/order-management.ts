import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminStore } from '../../../core/store/admin-store';
import type { AdminOrderModel } from '../admin.models';

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'] as const;

@Component({
    selector: 'app-order-management',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './order-management.html',
    styleUrl: './order-management.css',
})
export class OrderManagement implements OnInit {
    private readonly adminStore = inject(AdminStore);
    private readonly fb = inject(FormBuilder);

    readonly orders = computed(() => this.adminStore.orders());
    readonly orderTotal = computed(() => this.adminStore.orderTotal());
    readonly isLoading = computed(() => this.adminStore.isLoading());
    readonly error = computed(() => this.adminStore.error());

    readonly statusOptions = ORDER_STATUSES;
    readonly activeFilter = signal('');

    readonly showStatusModal = signal(false);
    readonly editTarget = signal<AdminOrderModel | null>(null);
    readonly isSubmitting = signal(false);
    readonly formError = signal<string | null>(null);

    readonly statusForm = this.fb.nonNullable.group({
        status: ['', Validators.required],
        trackingId: [''],
    });

    ngOnInit(): void {
        this.adminStore.loadOrders();
    }

    applyFilter(status: string): void {
        this.activeFilter.set(status);
        this.adminStore.loadOrders(1, 20, status || undefined);
    }

    openStatusEdit(order: AdminOrderModel): void {
        this.editTarget.set(order);
        this.statusForm.patchValue({ status: order.orderStatus, trackingId: order.trackingId ?? '' });
        this.formError.set(null);
        this.showStatusModal.set(true);
    }

    closeModal(): void {
        this.showStatusModal.set(false);
    }

    async onStatusSubmit(): Promise<void> {
        if (this.statusForm.invalid) {
            this.statusForm.markAllAsTouched();
            return;
        }

        const target = this.editTarget();
        if (!target) return;

        this.isSubmitting.set(true);
        this.formError.set(null);

        const raw = this.statusForm.getRawValue();
        const success = await this.adminStore.updateOrderStatus(target._id, {
            status: raw.status,
            trackingId: raw.trackingId || undefined,
        });

        this.isSubmitting.set(false);

        if (success) {
            this.showStatusModal.set(false);
        } else {
            this.formError.set(this.adminStore.error() ?? 'Update failed');
        }
    }
}
