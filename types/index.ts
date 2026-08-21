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
  brand?: string; // Brand / Label
  color?: string; // Legacy single color string
  colors?: string[]; // Multi-color support
  material: string;
  name: string;
  createdAt: number;
}

export interface CalendarEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title?: string;
  outfitImage?: string; // Snapshot base64 generated from mannequin canvas
  slotItems: Partial<Record<Category, ClothingItem[]>>;
  createdAt: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate: string | null; // YYYY-MM-DD
  history: string[]; // List of YYYY-MM-DD dates logged
}
