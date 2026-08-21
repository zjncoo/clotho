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
  color?: string; // Legacy single color string
  colors?: string[]; // Multi-color support
  material: string;
  name: string;
  createdAt: number;
}
