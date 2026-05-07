import { Injectable, signal } from '@angular/core';

export interface SearchProduct {
  name: string;
  variant: string;
  price: string;
  priceValue: number;
  image: string;
  badge: string;
  moreColors: string;
  swatches: string[];
  sizes: string[];
  colors: string[];
  productType: string;
  material: string;
  collectionSlug: string;
}

interface CollectionData {
  slug: string;
  products: SearchProduct[];
}

interface CollectionDataFile {
  collections: CollectionData[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly allProducts = signal<SearchProduct[]>([]);
  private loaded = false;

  async loadProducts(): Promise<void> {
    if (this.loaded) return;
    const response = await fetch('/mockData/collections.json');
    const data = (await response.json()) as CollectionDataFile;
    const products: SearchProduct[] = [];
    for (const collection of data.collections) {
      for (const product of collection.products) {
        products.push({ ...product, collectionSlug: collection.slug });
      }
    }
    this.allProducts.set(products);
    this.loaded = true;
  }

  search(query: string): SearchProduct[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.allProducts().filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.variant.toLowerCase().includes(q) ||
        p.productType.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.colors.some((c) => c.toLowerCase().includes(q)),
    );
  }

  getTopSuggestions(query: string, limit = 4): SearchProduct[] {
    return this.search(query).slice(0, limit);
  }
}
