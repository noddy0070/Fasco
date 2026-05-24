import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminService } from '../admin.service';
import type {
    AdminBrandModel,
    AdminCategoryModel,
    CreateBrandPayload,
    CreateCategoryPayload,
} from '../admin.models';

type CatalogTab = 'brands' | 'categories' | 'subcategories';

function apiErrorMessage(err: unknown): string {
    const e = err as { error?: { message?: string }; message?: string };
    return e.error?.message ?? e.message ?? 'Operation failed';
}

function parentName(cat: AdminCategoryModel): string {
    const p = cat.parent;
    if (!p) return '—';
    return typeof p === 'string' ? p : p.name;
}

@Component({
    selector: 'app-catalog-management',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './catalog-management.html',
    styleUrl: './catalog-management.css',
})
export class CatalogManagement implements OnInit {
    private readonly adminService = inject(AdminService);
    private readonly fb = inject(FormBuilder);

    readonly activeTab = signal<CatalogTab>('brands');
    readonly isLoading = signal(false);
    readonly error = signal<string | null>(null);
    readonly formError = signal<string | null>(null);
    readonly isSubmitting = signal(false);
    readonly showModal = signal(false);

    readonly brands = signal<AdminBrandModel[]>([]);
    readonly mainCategories = signal<AdminCategoryModel[]>([]);
    readonly subCategories = signal<AdminCategoryModel[]>([]);

    readonly editBrand = signal<AdminBrandModel | null>(null);
    readonly editCategory = signal<AdminCategoryModel | null>(null);
    readonly editSubCategory = signal<AdminCategoryModel | null>(null);

    readonly modalTitle = computed(() => {
        if (this.activeTab() === 'brands') {
            return this.editBrand() ? 'Edit Brand' : 'Add Brand';
        }
        if (this.activeTab() === 'categories') {
            return this.editCategory() ? 'Edit Category' : 'Add Category';
        }
        return this.editSubCategory() ? 'Edit Sub-category' : 'Add Sub-category';
    });

    readonly brandForm = this.fb.nonNullable.group({
        title: ['', Validators.required],
        slug: [''],
        description: [''],
        isActive: [true],
        isFeatured: [false],
    });

    readonly categoryForm = this.fb.nonNullable.group({
        name: ['', Validators.required],
        slug: [''],
    });

    readonly subCategoryForm = this.fb.nonNullable.group({
        name: ['', Validators.required],
        slug: [''],
        parent: ['', Validators.required],
    });

    ngOnInit(): void {
        void this.loadAll();
    }

    setTab(tab: CatalogTab): void {
        this.activeTab.set(tab);
        this.error.set(null);
    }

    async loadAll(): Promise<void> {
        this.isLoading.set(true);
        this.error.set(null);
        try {
            const [brandsRes, mainRes, subRes] = await Promise.all([
                firstValueFrom(this.adminService.getBrands()),
                firstValueFrom(this.adminService.getCategories('main')),
                firstValueFrom(this.adminService.getCategories('sub')),
            ]);
            this.brands.set(brandsRes.data);
            this.mainCategories.set(mainRes.data);
            this.subCategories.set(subRes.data);
        } catch (err: unknown) {
            this.error.set(apiErrorMessage(err));
        } finally {
            this.isLoading.set(false);
        }
    }

    openCreate(): void {
        this.formError.set(null);
        this.editBrand.set(null);
        this.editCategory.set(null);
        this.editSubCategory.set(null);

        if (this.activeTab() === 'brands') {
            this.brandForm.reset({ isActive: true, isFeatured: false });
        } else if (this.activeTab() === 'categories') {
            this.categoryForm.reset();
        } else {
            this.subCategoryForm.reset({ parent: this.mainCategories()[0]?._id ?? '' });
        }

        this.showModal.set(true);
    }

    openEditBrand(brand: AdminBrandModel): void {
        this.activeTab.set('brands');
        this.editBrand.set(brand);
        this.brandForm.patchValue({
            title: brand.title,
            slug: brand.slug,
            description: brand.description ?? '',
            isActive: brand.isActive,
            isFeatured: brand.isFeatured,
        });
        this.formError.set(null);
        this.showModal.set(true);
    }

    openEditCategory(cat: AdminCategoryModel): void {
        this.activeTab.set('categories');
        this.editCategory.set(cat);
        this.categoryForm.patchValue({ name: cat.name, slug: cat.slug });
        this.formError.set(null);
        this.showModal.set(true);
    }

    openEditSubCategory(cat: AdminCategoryModel): void {
        this.activeTab.set('subcategories');
        this.editSubCategory.set(cat);
        const parentId = typeof cat.parent === 'string' ? cat.parent : cat.parent?._id ?? '';
        this.subCategoryForm.patchValue({ name: cat.name, slug: cat.slug, parent: parentId });
        this.formError.set(null);
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
    }

    async onSubmit(): Promise<void> {
        const tab = this.activeTab();
        this.isSubmitting.set(true);
        this.formError.set(null);

        try {
            if (tab === 'brands') {
                if (this.brandForm.invalid) {
                    this.brandForm.markAllAsTouched();
                    return;
                }
                const raw = this.brandForm.getRawValue();
                const payload: CreateBrandPayload = {
                    title: raw.title.trim(),
                    description: raw.description.trim() || undefined,
                    isActive: raw.isActive,
                    isFeatured: raw.isFeatured,
                };
                if (raw.slug.trim()) payload.slug = raw.slug.trim();

                const target = this.editBrand();
                if (target) {
                    await firstValueFrom(this.adminService.updateBrand(target._id, payload));
                } else {
                    await firstValueFrom(this.adminService.createBrand(payload));
                }
            } else if (tab === 'categories') {
                if (this.categoryForm.invalid) {
                    this.categoryForm.markAllAsTouched();
                    return;
                }
                const raw = this.categoryForm.getRawValue();
                const payload: CreateCategoryPayload = {
                    name: raw.name.trim(),
                    level: 'main',
                };
                if (raw.slug.trim()) payload.slug = raw.slug.trim();

                const target = this.editCategory();
                if (target) {
                    await firstValueFrom(this.adminService.updateCategory(target._id, payload));
                } else {
                    await firstValueFrom(this.adminService.createCategory(payload));
                }
            } else {
                if (this.subCategoryForm.invalid) {
                    this.subCategoryForm.markAllAsTouched();
                    return;
                }
                const raw = this.subCategoryForm.getRawValue();
                const payload: CreateCategoryPayload = {
                    name: raw.name.trim(),
                    level: 'sub',
                    parent: raw.parent,
                };
                if (raw.slug.trim()) payload.slug = raw.slug.trim();

                const target = this.editSubCategory();
                if (target) {
                    await firstValueFrom(this.adminService.updateCategory(target._id, payload));
                } else {
                    await firstValueFrom(this.adminService.createCategory(payload));
                }
            }

            this.showModal.set(false);
            await this.loadAll();
        } catch (err: unknown) {
            this.formError.set(apiErrorMessage(err));
        } finally {
            this.isSubmitting.set(false);
        }
    }

    async onDeleteBrand(brand: AdminBrandModel): Promise<void> {
        if (!confirm(`Delete brand "${brand.title}"?`)) return;
        try {
            await firstValueFrom(this.adminService.deleteBrand(brand._id));
            await this.loadAll();
        } catch (err: unknown) {
            this.error.set(apiErrorMessage(err));
        }
    }

    async onDeleteCategory(cat: AdminCategoryModel): Promise<void> {
        if (!confirm(`Delete "${cat.name}"?`)) return;
        try {
            await firstValueFrom(this.adminService.deleteCategory(cat._id));
            await this.loadAll();
        } catch (err: unknown) {
            this.error.set(apiErrorMessage(err));
        }
    }

    async onDeleteSubCategory(cat: AdminCategoryModel): Promise<void> {
        await this.onDeleteCategory(cat);
    }

    parentLabel(cat: AdminCategoryModel): string {
        return parentName(cat);
    }
}
