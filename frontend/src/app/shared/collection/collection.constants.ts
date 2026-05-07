import { FilterColorOption, PriceRangeOption } from './collection.types';

export const SIZE_OPTIONS = [
  'XS', 'S', 'M', 'L', 'XL',
  'XXL', 'XXXL', '8', '8.5', '9',
  '9.5', '10', '10.5', '11', '11.5',
  '12', '12.5', '13', '13.5', '14',
  '15', 'One Size',
] as const;

export const COLOR_OPTIONS: FilterColorOption[] = [
  { label: 'Black', swatch: '#1E1F23' },
  { label: 'Grey', swatch: '#778092' },
  { label: 'White', swatch: '#F4F5F6' },
  { label: 'Beige', swatch: '#EFE2B4' },
  { label: 'Brown', swatch: '#AF4B02' },
  { label: 'Red', swatch: '#FF3040' },
  { label: 'Pink', swatch: '#EE9AC7' },
  { label: 'Orange', swatch: '#FF6C00' },
  { label: 'Yellow', swatch: '#F6BE00' },
  { label: 'Green', swatch: '#0FA748' },
  { label: 'Blue', swatch: '#3079E9' },
  { label: 'Purple', swatch: '#A54AEA' },
];

export const PRICE_OPTIONS: PriceRangeOption[] = [
  { label: 'Under $75', min: 0, max: 74 },
  { label: '$75 - $100', min: 75, max: 100 },
  { label: '$101 - $125', min: 101, max: 125 },
  { label: '$126 - $150', min: 126, max: 150 },
  { label: 'Over $150', min: 151, max: Number.POSITIVE_INFINITY },
];

export const PRODUCT_TYPE_OPTIONS = [
  'Everyday Sneakers',
  'Golf',
  'High Tops',
  'Hiking Shoes',
  'Hoodies',
  'Insoles',
  'Long Sleeve Tees',
  'Running Shoes',
  'Shirts',
  'Slip Ons',
  'Slippers',
  'Socks',
  'Sweatpants',
  'Sweatshirts',
  'Tees',
  'Water-Repellent Shoes',
] as const;

export const MATERIAL_OPTIONS = [
  'Alternative-Leather',
  'Canvas',
  'Cotton',
  'Sugar',
  'Tree',
  'Tree-Fiber-Blend',
  'Wool',
] as const;
