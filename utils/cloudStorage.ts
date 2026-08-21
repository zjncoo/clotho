'use client';

import { ClothingItem } from '@/types';
import { set, get } from 'idb-keyval';

export interface ClothoBackupPayload {
  clothoVersion: string;
  timestamp: number;
  userName: string;
  accentColor?: string;
  totalPieces: number;
  items: ClothingItem[];
}

const STORAGE_KEY = 'closet_catalog_items';

/**
 * Exports data and triggers native iOS "Save to Files" (iCloud Drive) or file download
 */
export async function exportWardrobeToFiles(
  items: ClothingItem[],
  userName: string,
  accentColor?: string
): Promise<{ success: boolean; filename: string }> {
  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanName = userName ? userName.toLowerCase().replace(/[^a-z0-9]/gi, '-') : 'user';
  const filename = `clotho-wardrobe-${cleanName}-${dateStr}.json`;

  const payload: ClothoBackupPayload = {
    clothoVersion: '1.0',
    timestamp: Date.now(),
    userName: userName || 'Your',
    accentColor: accentColor || '#2563eb',
    totalPieces: items.length,
    items,
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });

  // On iOS / Mobile devices with Web Share API (Level 2 with file support)
  const file = new File([blob], filename, { type: 'application/json' });
  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        title: `Clotho Wardrobe Backup`,
        text: `Clotho digital wardrobe backup for ${userName} (${items.length} pieces)`,
        files: [file],
      });
      return { success: true, filename };
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') {
        return { success: false, filename };
      }
      // Fallback to direct anchor download if share fails
    }
  }

  // Fallback / Standard Desktop: Anchor download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { success: true, filename };
}

/**
 * Reads and restores backup from a JSON file selected by the user (from iCloud / Files)
 */
export async function importWardrobeFromFiles(file: File): Promise<{
  success: boolean;
  items: ClothingItem[];
  userName?: string;
  accentColor?: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        let itemsToRestore: ClothingItem[] = [];
        let restoredName: string | undefined = undefined;
        let restoredAccent: string | undefined = undefined;

        // Standard ClothoBackupPayload format
        if (parsed && Array.isArray(parsed.items)) {
          itemsToRestore = parsed.items;
          restoredName = parsed.userName;
          restoredAccent = parsed.accentColor;
        } else if (Array.isArray(parsed)) {
          // Direct array of ClothingItem
          itemsToRestore = parsed;
        } else {
          resolve({ success: false, items: [], error: 'Invalid backup format' });
          return;
        }

        // Save to IndexedDB
        await set(STORAGE_KEY, itemsToRestore);

        // Update name and accent if present
        if (restoredName && typeof window !== 'undefined') {
          localStorage.setItem('clotho_user_name', restoredName);
        }
        if (restoredAccent && typeof window !== 'undefined') {
          localStorage.setItem('clotho_custom_accent', restoredAccent);
        }

        resolve({
          success: true,
          items: itemsToRestore,
          userName: restoredName,
          accentColor: restoredAccent,
        });
      } catch (err) {
        console.error('Import parse error:', err);
        resolve({ success: false, items: [], error: 'Failed to parse JSON backup' });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, items: [], error: 'Failed to read file' });
    };

    reader.readAsText(file);
  });
}
