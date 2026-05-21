import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminStore } from '../../../core/store/admin-store';
import type { AdminProductModel } from '../admin.models';

@Component({
    selector: 'app-product-management',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './product-management.html',
    styleUrl: './product-management.css',
})
export class ProductManagement implements OnInit {
    private readonly adminStore = inject(AdminStore);
    private readonly fb = inject(FormBuilder);

    readonly products = computed(() => this.adminStore.products());
    readonly productTotal = computed(() => this.adminStore.productTotal());
    readonly isLoading = computed(() => this.adminStore.isLoading());
    readonly error = computed(() => this.adminStore.error());

    readonly showModal = signal(false);
    readonly editTarget = signal<AdminProductModel | null>(null);
    readonly formError = signal<string | null>(null);
    readonly isSubmitting = signal(false);
    readonly includeDeleted = signal(false);

    readonly form = this.fb.nonNullable.group({
        title: ['', Validators.required],
        description: [''],
        isActive: [true],
        isTrending: [false],
        isLimitedOffer: [false],
        // Single variant for simplicity; extend as needed
        variantSku: ['', Validators.required],
        variantPrice: [0, [Validators.required, Validators.min(0.01)]],
        variantDiscount: [0, Validators.min(0)],
        variantStock: [0, Validators.min(0)],
    });

    ngOnInit(): void {
        this.adminStore.loadProducts();
    }

    toggleDeleted(): void {
        this.includeDeleted.update((v) => !v);
        this.adminStore.loadProducts(1, 20, this.includeDeleted());
    }

    openCreate(): void {
        this.editTarget.set(null);
        this.form.reset({ isActive: true, isTrending: false, isLimitedOffer: false, variantDiscount: 0, variantStock: 0, variantPrice: 0 });
        this.formError.set(null);
        this.showModal.set(true);
    }

    openEdit(product: AdminProductModel): void {
        const v = product.variants[0];
        this.editTarget.set(product);
        this.form.patchValue({
            title: product.title,
            isActive: product.isActive,
            isTrending: product.isTrending,
            isLimitedOffer: product.isLimitedOffer,
            variantSku: v?.sku ?? '',
            variantPrice: v?.price ?? 0,
            variantDiscount: v?.discount ?? 0,
            variantStock: v?.stock ?? 0,
        });
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
        const payload = {
            title: raw.title,
            description: raw.description,
            isActive: raw.isActive,
            isTrending: raw.isTrending,
            isLimitedOffer: raw.isLimitedOffer,
            variants: [{
                sku: raw.variantSku,
                price: raw.variantPrice,
                discount: raw.variantDiscount,
                stock: raw.variantStock,
            }],
        };

        const target = this.editTarget();
        const success = target
            ? await this.adminStore.updateProduct(target._id, payload)
            : await this.adminStore.createProduct(payload);

        this.isSubmitting.set(false);

        if (success) {
            this.showModal.set(false);
        } else {
            this.formError.set(this.adminStore.error() ?? 'Operation failed');
        }
    }

    async onDelete(product: AdminProductModel): Promise<void> {
        if (!confirm(`Soft-delete "${product.title}"?`)) return;
        await this.adminStore.deleteProduct(product._id);
    }
}
