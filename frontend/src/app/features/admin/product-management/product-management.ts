import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators,
    FormArray,
    FormGroup,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminStore } from '../../../core/store/admin-store';
import { AdminService } from '../admin.service';
import type {
    AdminProductModel,
    AdminProductVariant,
    AdminBrandModel,
    AdminCategoryModel,
    CreateProductPayload,
    ProductGender,
} from '../admin.models';

const GENDERS: ProductGender[] = ['men', 'women', 'kids', 'unisex'];

type VariantFormValue = {
    sku: string;
    price: number;
    discount: number;
    stock: number;
    size: string;
    color: string;
    colorCode: string;
    images: string;
};

type SpecFormValue = {
    title: string;
    value: string;
};

function refId(value: string | { _id: string } | undefined): string {
    if (!value) return '';
    return typeof value === 'string' ? value : value._id;
}

function apiErrorMessage(err: unknown): string {
    const e = err as { error?: { message?: string }; message?: string };
    return e.error?.message ?? e.message ?? 'Operation failed';
}

@Component({
    selector: 'app-product-management',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './product-management.html',
    styleUrl: './product-management.css',
})
export class ProductManagement implements OnInit {
    private readonly adminStore = inject(AdminStore);
    private readonly adminService = inject(AdminService);
    private readonly fb = inject(FormBuilder);

    readonly genders = GENDERS;

    readonly products = computed(() => this.adminStore.products());
    readonly productTotal = computed(() => this.adminStore.productTotal());
    readonly isLoading = computed(() => this.adminStore.isLoading());
    readonly error = computed(() => this.adminStore.error());

    readonly showModal = signal(false);
    readonly editTarget = signal<AdminProductModel | null>(null);
    readonly formError = signal<string | null>(null);
    readonly isSubmitting = signal(false);
    readonly isLoadingProduct = signal(false);
    readonly includeDeleted = signal(false);

    readonly brands = signal<AdminBrandModel[]>([]);
    readonly mainCategories = signal<AdminCategoryModel[]>([]);
    readonly subCategoryOptions = signal<AdminCategoryModel[]>([]);
    readonly catalogLoading = signal(false);

    readonly form = this.fb.nonNullable.group({
        title: ['', Validators.required],
        slug: [''],
        description: [''],
        brand: [''],
        gender: ['' as '' | ProductGender],
        category: [''],
        subCategory: [''],
        isActive: [true],
        isTrending: [false],
        isLimitedOffer: [false],
        tags: [''],
        metaTitle: [''],
        metaDescription: [''],
        variants: this.fb.nonNullable.array([this.createVariantGroup()]),
        specifications: this.fb.array<FormGroup>([]),
    });

    get variants(): FormArray {
        return this.form.controls.variants;
    }

    get specifications(): FormArray<FormGroup> {
        return this.form.controls.specifications;
    }

    ngOnInit(): void {
        this.adminStore.loadProducts();
        void this.loadCatalogOptions();
    }

    async loadCatalogOptions(): Promise<void> {
        this.catalogLoading.set(true);
        try {
            const [brandsRes, mainRes] = await Promise.all([
                firstValueFrom(this.adminService.getBrands()),
                firstValueFrom(this.adminService.getCategories('main')),
            ]);
            this.brands.set(brandsRes.data);
            this.mainCategories.set(mainRes.data);
        } catch {
            // Catalog may be empty until seed — dropdowns stay empty
        } finally {
            this.catalogLoading.set(false);
        }
    }

    async loadSubCategories(parentId: string): Promise<void> {
        if (!parentId) {
            this.subCategoryOptions.set([]);
            return;
        }
        try {
            const res = await firstValueFrom(this.adminService.getCategories('sub', parentId));
            this.subCategoryOptions.set(res.data);
        } catch {
            this.subCategoryOptions.set([]);
        }
    }

    onCategoryChange(): void {
        const parentId = this.form.controls.category.value;
        const currentSub = this.form.controls.subCategory.value;
        void this.loadSubCategories(parentId).then(() => {
            const valid = this.subCategoryOptions().some((s) => s._id === currentSub);
            if (!valid) {
                this.form.patchValue({ subCategory: '' });
            }
        });
    }

    createVariantGroup(v?: Partial<AdminProductVariant>): FormGroup {
        return this.fb.nonNullable.group({
            sku: [v?.sku ?? '', Validators.required],
            price: [v?.price ?? 0, [Validators.required, Validators.min(0)]],
            discount: [v?.discount ?? 0, Validators.min(0)],
            stock: [v?.stock ?? 0, [Validators.required, Validators.min(0)]],
            size: [v?.size ?? ''],
            color: [v?.color ?? ''],
            colorCode: [v?.colorCode ?? ''],
            images: [v?.images?.join(', ') ?? ''],
        });
    }

    createSpecGroup(s?: { title: string; value: string }): FormGroup {
        return this.fb.nonNullable.group({
            title: [s?.title ?? ''],
            value: [s?.value ?? ''],
        });
    }

    addVariant(): void {
        this.variants.push(this.createVariantGroup());
    }

    removeVariant(index: number): void {
        if (this.variants.length > 1) {
            this.variants.removeAt(index);
        }
    }

    addSpecification(): void {
        this.specifications.push(this.createSpecGroup());
    }

    removeSpecification(index: number): void {
        this.specifications.removeAt(index);
    }

    toggleDeleted(): void {
        this.includeDeleted.update((v) => !v);
        this.adminStore.loadProducts(1, 20, this.includeDeleted());
    }

    private resetFormArrays(): void {
        this.variants.clear();
        this.variants.push(this.createVariantGroup());
        this.specifications.clear();
    }

    private patchFormFromProduct(product: AdminProductModel): void {
        this.variants.clear();
        const variantList = product.variants.length ? product.variants : [undefined];
        variantList.forEach((v) => this.variants.push(this.createVariantGroup(v)));

        this.specifications.clear();
        product.specifications?.forEach((s) => this.specifications.push(this.createSpecGroup(s)));

        const categoryId = refId(product.category);
        const subCategoryId = refId(product.subCategory);

        this.form.patchValue({
            title: product.title,
            slug: product.slug ?? '',
            description: product.description ?? '',
            brand: refId(product.brand),
            gender: product.gender ?? '',
            category: categoryId,
            subCategory: subCategoryId,
            isActive: product.isActive,
            isTrending: product.isTrending,
            isLimitedOffer: product.isLimitedOffer,
            tags: product.tags?.join(', ') ?? '',
            metaTitle: product.metaTitle ?? '',
            metaDescription: product.metaDescription ?? '',
        });

        void this.loadSubCategories(categoryId);
    }

    openCreate(): void {
        this.editTarget.set(null);
        this.form.reset({
            title: '',
            slug: '',
            description: '',
            brand: '',
            gender: '',
            category: '',
            subCategory: '',
            isActive: true,
            isTrending: false,
            isLimitedOffer: false,
            tags: '',
            metaTitle: '',
            metaDescription: '',
        });
        this.resetFormArrays();
        this.subCategoryOptions.set([]);
        this.formError.set(null);
        void this.loadCatalogOptions();
        this.showModal.set(true);
    }

    async openEdit(product: AdminProductModel): Promise<void> {
        this.editTarget.set(product);
        this.formError.set(null);
        this.isLoadingProduct.set(true);
        this.showModal.set(true);
        void this.loadCatalogOptions();

        try {
            const res = await firstValueFrom(this.adminService.getProductById(product._id));
            this.patchFormFromProduct(res.data);
        } catch (err: unknown) {
            this.patchFormFromProduct(product);
            this.formError.set(apiErrorMessage(err));
        } finally {
            this.isLoadingProduct.set(false);
        }
    }

    closeModal(): void {
        this.showModal.set(false);
        this.isLoadingProduct.set(false);
    }

    private buildPayload(): CreateProductPayload {
        const raw = this.form.getRawValue();

        const variants = (raw.variants as VariantFormValue[]).map((v) => {
            const variant: AdminProductVariant = {
                sku: v.sku.trim(),
                price: Number(v.price),
                discount: Number(v.discount) || 0,
                stock: Number(v.stock),
            };
            if (v.size.trim()) variant.size = v.size.trim();
            if (v.color.trim()) variant.color = v.color.trim();
            if (v.colorCode.trim()) variant.colorCode = v.colorCode.trim();
            const images = v.images
                .split(',')
                .map((url: string) => url.trim())
                .filter(Boolean);
            if (images.length) variant.images = images;
            return variant;
        });

        const specifications = (raw.specifications as SpecFormValue[])
            .map((s) => ({
                title: s.title.trim(),
                value: s.value.trim(),
            }))
            .filter((s) => s.title || s.value);

        const payload: CreateProductPayload = {
            title: raw.title.trim(),
            isActive: raw.isActive,
            isTrending: raw.isTrending,
            isLimitedOffer: raw.isLimitedOffer,
            variants,
        };

        if (raw.slug.trim()) payload.slug = raw.slug.trim();
        if (raw.description.trim()) payload.description = raw.description.trim();
        if (raw.brand.trim()) payload.brand = raw.brand.trim();
        if (raw.gender) payload.gender = raw.gender;
        if (raw.category.trim()) payload.category = raw.category.trim();
        if (raw.subCategory.trim()) payload.subCategory = raw.subCategory.trim();
        if (raw.tags.trim()) {
            payload.tags = raw.tags.split(',').map((t) => t.trim()).filter(Boolean);
        }
        if (specifications.length) payload.specifications = specifications;
        if (raw.metaTitle.trim()) payload.metaTitle = raw.metaTitle.trim();
        if (raw.metaDescription.trim()) payload.metaDescription = raw.metaDescription.trim();

        return payload;
    }

    variantCount(product: AdminProductModel): number {
        return product.variants?.length ?? 0;
    }

    totalStock(product: AdminProductModel): number {
        return product.variants?.reduce((sum, v) => sum + (v.stock ?? 0), 0) ?? 0;
    }

    minPrice(product: AdminProductModel): number | null {
        const prices = product.variants?.map((v) => v.price).filter((p) => p != null);
        if (!prices?.length) return null;
        return Math.min(...prices);
    }

    async onSubmit(): Promise<void> {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        this.formError.set(null);

        const payload = this.buildPayload();
        const target = this.editTarget();

        try {
            const success = target
                ? await this.adminStore.updateProduct(target._id, payload)
                : await this.adminStore.createProduct(payload);

            if (success) {
                this.showModal.set(false);
                this.adminStore.loadProducts(1, 20, this.includeDeleted());
            } else {
                this.formError.set(this.adminStore.error() ?? 'Operation failed');
            }
        } catch (err: unknown) {
            this.formError.set(apiErrorMessage(err));
        } finally {
            this.isSubmitting.set(false);
        }
    }

    async onDelete(product: AdminProductModel): Promise<void> {
        if (!confirm(`Soft-delete "${product.title}"?`)) return;
        await this.adminStore.deleteProduct(product._id);
        this.adminStore.loadProducts(1, 20, this.includeDeleted());
    }

    async onRestore(product: AdminProductModel): Promise<void> {
        try {
            await firstValueFrom(this.adminService.restoreProduct(product._id));
            this.adminStore.loadProducts(1, 20, this.includeDeleted());
        } catch (err: unknown) {
            this.formError.set(apiErrorMessage(err));
        }
    }
}
