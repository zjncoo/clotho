export type Category =
  | 'headwear'
  | 'necklace'
  | 'top'
  | 'bottom'
  | 'bracelet'
  | 'bag'
  | 'shoes'
  | 'accessories';

export interface ClothingItem {
  id: string;
  image: string; // Base64 WebP
  category: Category;
  color: string;
  material: string;
  name: string;
  createdAt: number;
}
