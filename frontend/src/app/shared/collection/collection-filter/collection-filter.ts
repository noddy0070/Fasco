import { Component, input, output } from '@angular/core';
import { FilterSlugOption, PriceRangeOption } from '../collection.types';

@Component({
  selector: 'app-collection-filter',
  imports: [],
  templateUrl: './collection-filter.html',
  styleUrl: './collection-filter.css',
})
export class CollectionFilter {
  filteredCount = input.required<number>();
  isOpen = input.required<boolean>();
  sizeOptions = input.required<readonly string[]>();
  colorOptions = input.required<readonly string[]>();
  priceOptions = input.required<PriceRangeOption[]>();
  categoryOptions = input.required<FilterSlugOption[]>();
  subCategoryOptions = input.required<FilterSlugOption[]>();
  isSizeSelected = input.required<(value: string) => boolean>();
  isColorSelected = input.required<(value: string) => boolean>();
  isPriceSelected = input.required<(value: string) => boolean>();
  isCategorySelected = input.required<(value: string) => boolean>();
  isSubCategorySelected = input.required<(value: string) => boolean>();

  open = output<void>();
  close = output<void>();
  clearFilters = output<void>();
  toggleSize = output<string>();
  toggleColor = output<string>();
  togglePrice = output<string>();
  toggleCategory = output<string>();
  toggleSubCategory = output<string>();
}
