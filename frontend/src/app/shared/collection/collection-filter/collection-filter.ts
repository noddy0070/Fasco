import { Component, input, output } from '@angular/core';
import { FilterColorOption, PriceRangeOption } from '../collection.types';

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
  colorOptions = input.required<FilterColorOption[]>();
  priceOptions = input.required<PriceRangeOption[]>();
  productTypeOptions = input.required<readonly string[]>();
  materialOptions = input.required<readonly string[]>();
  isSizeSelected = input.required<(value: string) => boolean>();
  isColorSelected = input.required<(value: string) => boolean>();
  isPriceSelected = input.required<(value: string) => boolean>();
  isProductTypeSelected = input.required<(value: string) => boolean>();
  isMaterialSelected = input.required<(value: string) => boolean>();

  open = output<void>();
  close = output<void>();
  clearFilters = output<void>();
  toggleSize = output<string>();
  toggleColor = output<string>();
  togglePrice = output<string>();
  toggleProductType = output<string>();
  toggleMaterial = output<string>();
}
