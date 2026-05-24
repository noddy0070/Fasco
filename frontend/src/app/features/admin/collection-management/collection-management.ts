import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminService } from '../admin.service';
import type {
    AdminCollectionModel,
    CollectionProductFilter,
    CreateCollectionPayload,
} from '../admin.models';

const PRODUCT_FILTERS: CollectionProductFilter[] = ['men', 'women', 'sale', 'featured', 'all'];

type TabFormValue = { label: string; slug: string };
type ActionFormValue = { label: string; slug: string };

function apiErrorMessage(err: unknown): string {
    const e = err as { error?: { message?: string }; message?: string };
    return e.error?.message ?? e.message ?? 'Operation failed';
}

@Component({
    selector: 'app-collection-management',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './collection-management.html',
    styleUrl: './collection-management.css',
})
export class CollectionManagement implements OnInit {
    private readonly adminService = inject(AdminService);
    private readonly fb = inject(FormBuilder);

    readonly productFilters = PRODUCT_FILTERS;

    readonly collections = signal<AdminCollectionModel[]>([]);
    readonly isLoading = signal(false);
    readonly error = signal<string | null>(null);
    readonly formError = signal<string | null>(null);
    readonly isSubmitting = signal(false);
    readonly showModal = signal(false);
    readonly editTarget = signal<AdminCollectionModel | null>(null);

    readonly form = this.fb.nonNullable.group({
        title: ['', Validators.required],
        slug: [''],
        eyebrow: [''],
        description: [''],
        heroImage: [''],
        sortOptionsText: ['Featured, Best Selling, Price: Low to High, Price: High to Low'],
        productFilter: ['men' as CollectionProductFilter, Validators.required],
        isActive: [true],
        displayOrder: [0],
        promoEyebrow: [''],
        promoTitle: [''],
        promoDescription: [''],
        tabs: this.fb.array([this.createTabGroup()]),
        promoActions: this.fb.array([this.createActionGroup()]),
    });

    get tabs(): FormArray<FormGroup> {
        return this.form.controls.tabs;
    }

    get promoActions(): FormArray<FormGroup> {
        return this.form.controls.promoActions;
    }

    ngOnInit(): void {
        void this.loadCollections();
    }

    createTabGroup(tab?: { label: string; slug: string }): FormGroup {
        return this.fb.nonNullable.group({
            label: [tab?.label ?? '', Validators.required],
            slug: [tab?.slug ?? '', Validators.required],
        });
    }

    createActionGroup(action?: { label: string; slug: string }): FormGroup {
        return this.fb.nonNullable.group({
            label: [action?.label ?? '', Validators.required],
            slug: [action?.slug ?? '', Validators.required],
        });
    }

    addTab(): void {
        this.tabs.push(this.createTabGroup());
    }

    removeTab(index: number): void {
        if (this.tabs.length > 1) this.tabs.removeAt(index);
    }

    addPromoAction(): void {
        this.promoActions.push(this.createActionGroup());
    }

    removePromoAction(index: number): void {
        if (this.promoActions.length > 1) this.promoActions.removeAt(index);
    }

    async loadCollections(): Promise<void> {
        this.isLoading.set(true);
        this.error.set(null);
        try {
            const res = await firstValueFrom(this.adminService.getCollections());
            this.collections.set(res.data);
        } catch (err: unknown) {
            this.error.set(apiErrorMessage(err));
        } finally {
            this.isLoading.set(false);
        }
    }

    private resetArrays(): void {
        this.tabs.clear();
        this.tabs.push(this.createTabGroup());
        this.promoActions.clear();
        this.promoActions.push(this.createActionGroup());
    }

    private patchForm(collection: AdminCollectionModel): void {
        this.resetArrays();
        collection.tabs.forEach((t) => this.tabs.push(this.createTabGroup(t)));
        if (collection.tabs.length > 0) this.tabs.removeAt(0);

        const actions = collection.promo?.actions ?? [];
        actions.forEach((a) => this.promoActions.push(this.createActionGroup(a)));
        if (actions.length > 0) this.promoActions.removeAt(0);

        this.form.patchValue({
            title: collection.title,
            slug: collection.slug,
            eyebrow: collection.eyebrow,
            description: collection.description,
            heroImage: collection.heroImage,
            sortOptionsText: collection.sortOptions.join(', '),
            productFilter: collection.productFilter,
            isActive: collection.isActive,
            displayOrder: collection.displayOrder,
            promoEyebrow: collection.promo?.eyebrow ?? '',
            promoTitle: collection.promo?.title ?? '',
            promoDescription: collection.promo?.description ?? '',
        });
    }

    openCreate(): void {
        this.editTarget.set(null);
        this.form.reset({
            title: '',
            slug: '',
            eyebrow: '',
            description: '',
            heroImage: '',
            sortOptionsText: 'Featured, Best Selling, Price: Low to High, Price: High to Low',
            productFilter: 'men',
            isActive: true,
            displayOrder: this.collections().length,
            promoEyebrow: '',
            promoTitle: '',
            promoDescription: '',
        });
        this.resetArrays();
        this.formError.set(null);
        this.showModal.set(true);
    }

    openEdit(collection: AdminCollectionModel): void {
        this.editTarget.set(collection);
        this.patchForm(collection);
        this.formError.set(null);
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
    }

    private buildPayload(): CreateCollectionPayload {
        const raw = this.form.getRawValue();
        return {
            title: raw.title.trim(),
            slug: raw.slug.trim() || undefined,
            eyebrow: raw.eyebrow.trim(),
            description: raw.description.trim(),
            heroImage: raw.heroImage.trim(),
            sortOptions: raw.sortOptionsText
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            productFilter: raw.productFilter,
            isActive: raw.isActive,
            displayOrder: Number(raw.displayOrder) || 0,
            tabs: (raw.tabs as TabFormValue[]).map((t) => ({
                label: t.label.trim(),
                slug: t.slug.trim(),
            })),
            promo: {
                eyebrow: raw.promoEyebrow.trim(),
                title: raw.promoTitle.trim(),
                description: raw.promoDescription.trim(),
                actions: (raw.promoActions as ActionFormValue[]).map((a) => ({
                    label: a.label.trim(),
                    slug: a.slug.trim(),
                })),
            },
        };
    }

    async onSubmit(): Promise<void> {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        this.formError.set(null);

        try {
            const payload = this.buildPayload();
            const target = this.editTarget();
            if (target) {
                await firstValueFrom(this.adminService.updateCollection(target._id, payload));
            } else {
                await firstValueFrom(this.adminService.createCollection(payload));
            }
            this.showModal.set(false);
            await this.loadCollections();
        } catch (err: unknown) {
            this.formError.set(apiErrorMessage(err));
        } finally {
            this.isSubmitting.set(false);
        }
    }

    async onDelete(collection: AdminCollectionModel): Promise<void> {
        if (!confirm(`Delete collection "${collection.title}"?`)) return;
        try {
            await firstValueFrom(this.adminService.deleteCollection(collection._id));
            await this.loadCollections();
        } catch (err: unknown) {
            this.error.set(apiErrorMessage(err));
        }
    }

    previewUrl(slug: string): string {
        return `/collections/${slug}`;
    }
}
