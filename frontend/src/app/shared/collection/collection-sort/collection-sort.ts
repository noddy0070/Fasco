import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { TransitionLink } from '../../components/transition-link/transition-link';
import { CollectionData, CollectionTab } from '../collection.types';

@Component({
  selector: 'app-collection-sort',
  imports: [CommonModule, TransitionLink],
  templateUrl: './collection-sort.html',
  styleUrl: './collection-sort.css',
})
export class CollectionSort {
  collection = input.required<CollectionData>();
  activeSortLabel = input.required<string>();
  isSortMenuOpen = input.required<boolean>();
  isTabActive = input.required<(tab: CollectionTab, collection: CollectionData, index: number) => boolean>();

  toggleSortMenu = output<void>();
  selectSortOption = output<string>();
}
