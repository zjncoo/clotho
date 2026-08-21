'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { get } from 'idb-keyval';
import { Category, ClothingItem } from '@/types';
import {
  Download,
  RotateCcw,
  Loader2,
  X,
  Check,
  Plus,
  Tag,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import Link from 'next/link';
import { COLOR_PALETTE, getColorHex } from '@/utils/colorPalette';
import { FILTER_MATERIALS } from '@/utils/materialConstants';

const STORAGE_KEY = 'closet_catalog_items';

interface SlotDefinition {
  category: Category;
  label: string;
  shortLabel: string;
  icon: string;
}

const SLOTS: SlotDefinition[] = [
  { category: 'headwear', label: 'Headwear & Hats', shortLabel: 'Headwear', icon: '🧢' },
  { category: 'necklace', label: 'Necklaces & Chains', shortLabel: 'Necklace', icon: '📿' },
  { category: 'top', label: 'Tops & Outerwear', shortLabel: 'Tops', icon: '👕' },
  { category: 'bottom', label: 'Pants & Skirts', shortLabel: 'Bottoms', icon: '👖' },
  { category: 'bracelet', label: 'Bracelets & Watches', shortLabel: 'Bracelets', icon: '⌚' },
  { category: 'bag', label: 'Bags & Backpacks', shortLabel: 'Bags', icon: '👜' },
  { category: 'shoes', label: 'Shoes & Footwear', shortLabel: 'Shoes', icon: '👟' },
  { category: 'accessories', label: 'Other Accessories', shortLabel: 'Extras', icon: '🕶️' },
];

export default function OutfitStudioPage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  // Multi-item selection per category: Record<Category, ClothingItem[]>
  const [outfit, setOutfit] = useState<Partial<Record<Category, ClothingItem[]>>>({});
  const [activeDrawerCategory, setActiveDrawerCategory] = useState<Category | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Drawer filtering state
  const [drawerBrand, setDrawerBrand] = useState('All');
  const [drawerMaterial, setDrawerMaterial] = useState('All');
  const [drawerColor, setDrawerColor] = useState('All');

  const mannequinRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (activeDrawerCategory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeDrawerCategory]);

  useEffect(() => {
    async function loadCatalog() {
      const saved = await get<ClothingItem[]>(STORAGE_KEY);
      if (saved) setItems(saved);
    }
    loadCatalog();
  }, []);

  const activeSlotConfig = SLOTS.find((s) => s.category === activeDrawerCategory);

  // Available brands for the currently opened category
  const availableDrawerBrands = useMemo(() => {
    if (!activeDrawerCategory) return ['All'];
    const catItems = items.filter((i) => i.category === activeDrawerCategory);
    const brandsSet = new Set(catItems.map((i) => i.brand?.trim()).filter(Boolean) as string[]);
    return ['All', ...Array.from(brandsSet).sort()];
  }, [items, activeDrawerCategory]);

  // Filtered items in drawer by category + brand + material + color swatches
  const filteredCategoryItems = useMemo(() => {
    if (!activeDrawerCategory) return [];

    return items
      .filter((i) => i.category === activeDrawerCategory)
      .filter((i) => {
        const matchBrand = drawerBrand === 'All' || (i.brand && i.brand.toLowerCase() === drawerBrand.toLowerCase());
        const matchMat = drawerMaterial === 'All' || i.material === drawerMaterial;
        const itemColors = i.colors && i.colors.length > 0 ? i.colors : i.color ? [i.color] : [];
        const matchCol =
          drawerColor === 'All' ||
          itemColors.some((c) => c.toLowerCase() === drawerColor.toLowerCase() || c.includes(drawerColor));
        return matchBrand && matchMat && matchCol;
      });
  }, [items, activeDrawerCategory, drawerBrand, drawerMaterial, drawerColor]);

  const currentSlotSelectedItems = (activeDrawerCategory && outfit[activeDrawerCategory]) || [];

  // Toggle item in category (supports multiple items)
  const toggleItemInSlot = (item: ClothingItem) => {
    const cat = item.category;
    const existing = outfit[cat] || [];
    const isAlreadySelected = existing.some((i) => i.id === item.id);

    if (isAlreadySelected) {
      const updated = existing.filter((i) => i.id !== item.id);
      setOutfit((prev) => ({
        ...prev,
        [cat]: updated.length > 0 ? updated : undefined,
      }));
    } else {
      setOutfit((prev) => ({
        ...prev,
        [cat]: [...existing, item],
      }));
    }
  };

  const clearSlot = (cat: Category) => {
    setOutfit((prev) => {
      const copy = { ...prev };
      delete copy[cat];
      return copy;
    });
  };

  const openDrawer = (cat: Category) => {
    setDrawerBrand('All');
    setDrawerMaterial('All');
    setDrawerColor('All');
    setActiveDrawerCategory(cat);
  };

  const exportOutfitPNG = async () => {
    if (!mannequinRef.current) return;
    setIsExporting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const dataUrl = await toPng(mannequinRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: '#0c0d10',
      });
      const link = document.createElement('a');
      link.download = `clotho-outfit-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  // Total count of all items selected across all slots
  const totalItemsCount = Object.values(outfit).reduce(
    (acc, arr) => acc + (arr?.length || 0),
    0
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 pb-28 sm:pb-32 space-y-4 sm:space-y-6">
      {/* Action Header */}
      <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Studio</h1>
          <p className="text-xs font-mono opacity-50 mt-0.5">
            Tap slots to assemble outfit ({totalItemsCount} selected)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOutfit({})}
            disabled={totalItemsCount === 0}
            className="text-xs font-mono opacity-60 hover:opacity-100 disabled:opacity-20 flex items-center gap-1 transition-opacity px-3 py-2 rounded-xl liquid-control"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={exportOutfitPNG}
            disabled={totalItemsCount === 0 || isExporting}
            className="liquid-control text-xs font-semibold tracking-wider uppercase px-4 py-2.5 rounded-full flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed shadow-md active:scale-95 transition-all"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" /> : <Download className="w-3.5 h-3.5" />}
            <span>Export PNG</span>
          </button>
        </div>
      </div>

      {/* Interactive Mannequin Canvas */}
      <div className="flex flex-col items-center">
        <div
          ref={mannequinRef}
          className="w-full max-w-sm sm:max-w-md liquid-glass rounded-[2.5rem] p-4 sm:p-5 shadow-2xl border border-white/20 dark:border-white/10 relative overflow-hidden"
        >
          {/* Subtle Ambient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-white/[0.02] pointer-events-none" />

          {/* Mannequin Section Layout */}
          <div className="flex flex-col items-center gap-2.5 relative z-10">
            {/* 1. Headwear */}
            <MannequinSlotButton
              slotKey="headwear"
              title="Headwear"
              icon="🧢"
              items={outfit.headwear}
              onClick={() => openDrawer('headwear')}
              className="w-32 sm:w-36 h-16 sm:h-20"
            />

            {/* 2. Necklace */}
            <MannequinSlotButton
              slotKey="necklace"
              title="Necklace"
              icon="📿"
              items={outfit.necklace}
              onClick={() => openDrawer('necklace')}
              className="w-28 sm:w-32 h-11 sm:h-13 -mt-1.5 z-20"
            />

            {/* Middle Row: Bag + Tops + Bracelet */}
            <div className="w-full flex items-center justify-between gap-2">
              {/* Bag Slot */}
              <MannequinSlotButton
                slotKey="bag"
                title="Bag"
                icon="👜"
                items={outfit.bag}
                onClick={() => openDrawer('bag')}
                className="w-16 sm:w-20 h-28 sm:h-32"
              />

              {/* Tops / Outerwear Slot */}
              <MannequinSlotButton
                slotKey="top"
                title="Tops & Jackets"
                icon="👕"
                items={outfit.top}
                onClick={() => openDrawer('top')}
                className="flex-1 h-36 sm:h-42"
              />

              {/* Bracelet Slot */}
              <MannequinSlotButton
                slotKey="bracelet"
                title="Bracelet"
                icon="⌚"
                items={outfit.bracelet}
                onClick={() => openDrawer('bracelet')}
                className="w-16 sm:w-20 h-28 sm:h-32"
              />
            </div>

            {/* 4. Pants & Skirts */}
            <MannequinSlotButton
              slotKey="bottom"
              title="Pants & Skirts"
              icon="👖"
              items={outfit.bottom}
              onClick={() => openDrawer('bottom')}
              className="w-4/5 h-36 sm:h-42"
            />

            {/* Bottom Row: Shoes + Extras */}
            <div className="w-full flex items-center justify-center gap-2.5">
              {/* Shoes */}
              <MannequinSlotButton
                slotKey="shoes"
                title="Shoes"
                icon="👟"
                items={outfit.shoes}
                onClick={() => openDrawer('shoes')}
                className="w-36 sm:w-44 h-20 sm:h-22"
              />

              {/* Extras */}
              <MannequinSlotButton
                slotKey="accessories"
                title="Accessories"
                icon="🕶️"
                items={outfit.accessories}
                onClick={() => openDrawer('accessories')}
                className="w-24 sm:w-28 h-20 sm:h-22"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Drawer / Bottom Sheet Modal with Filter by Brand, Color & Material */}
      <AnimatePresence>
        {activeDrawerCategory && activeSlotConfig && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md overflow-hidden touch-none">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg liquid-glass rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 max-h-[85vh] max-h-[85dvh] flex flex-col shadow-2xl border border-white/20 dark:border-white/10 overscroll-contain"
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center pb-3 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{activeSlotConfig.icon}</span>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">{activeSlotConfig.label}</h2>
                    <p className="text-xs font-mono opacity-50">
                      {currentSlotSelectedItems.length} selected (tap pieces to toggle)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveDrawerCategory(null)}
                  className="p-2 liquid-control rounded-full hover:opacity-70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Filter Controls */}
              <div className="py-3 space-y-2.5 border-b border-black/5 dark:border-white/5 text-xs font-mono">
                {/* Brand & Material Selectors */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 liquid-control rounded-xl px-2.5 py-1">
                    <Tag className="w-3 h-3 opacity-40 flex-shrink-0" />
                    <select
                      value={drawerBrand}
                      onChange={(e) => setDrawerBrand(e.target.value)}
                      className="bg-transparent text-xs font-medium w-full focus:outline-none cursor-pointer"
                    >
                      <option value="All" className="text-black bg-white dark:bg-neutral-900 dark:text-white">
                        All Brands
                      </option>
                      {availableDrawerBrands
                        .filter((b) => b !== 'All')
                        .map((brand) => (
                          <option key={brand} value={brand} className="text-black bg-white dark:bg-neutral-900 dark:text-white">
                            {brand}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="liquid-control rounded-xl px-2.5 py-1">
                    <select
                      value={drawerMaterial}
                      onChange={(e) => setDrawerMaterial(e.target.value)}
                      className="bg-transparent text-xs font-medium w-full focus:outline-none cursor-pointer"
                    >
                      {FILTER_MATERIALS.map((m) => (
                        <option key={m} value={m} className="text-black bg-white dark:bg-neutral-900 dark:text-white">
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Color Swatches */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                  <button
                    onClick={() => setDrawerColor('All')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] whitespace-nowrap transition-all flex items-center gap-1 ${
                      drawerColor === 'All'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
                        : 'liquid-control opacity-60 hover:opacity-100'
                    }`}
                  >
                    All Colors
                  </button>
                  {COLOR_PALETTE.map((c) => {
                    const isSelected = drawerColor === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => setDrawerColor(isSelected ? 'All' : c.name)}
                        className={`px-2 py-1 rounded-lg text-[10px] whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${
                          isSelected
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs ring-1 ring-blue-500 font-semibold'
                            : 'liquid-control opacity-70 hover:opacity-100'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-sm border border-white/20 flex-shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>

                {(drawerBrand !== 'All' || drawerMaterial !== 'All' || drawerColor !== 'All') && (
                  <div className="flex justify-end pt-0.5">
                    <button
                      onClick={() => {
                        setDrawerBrand('All');
                        setDrawerMaterial('All');
                        setDrawerColor('All');
                      }}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      Reset drawer filters
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto py-4 pr-1 overscroll-contain">
                {filteredCategoryItems.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-black/10 dark:border-white/10 rounded-2xl space-y-2">
                    <p className="text-xs font-mono opacity-50">
                      No matching pieces found with current filters.
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:underline pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add one in your Wardrobe
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredCategoryItems.map((item) => {
                      const isSelected = currentSlotSelectedItems.some((i) => i.id === item.id);
                      const itemColors = item.colors && item.colors.length > 0 ? item.colors : item.color ? [item.color] : [];
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleItemInSlot(item)}
                          className={`aspect-square p-2.5 rounded-2xl liquid-control flex flex-col items-center justify-between transition-all relative ${
                            isSelected
                              ? 'ring-2 ring-blue-500 bg-blue-500/10 shadow-lg scale-[0.98]'
                              : 'hover:scale-[1.02] hover:shadow-md'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-md z-10">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                          <div className="flex-1 w-full flex items-center justify-center overflow-hidden p-1">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                            />
                          </div>
                          <div className="w-full text-center px-1 pt-1">
                            {item.brand && (
                              <p className="text-[9px] font-mono uppercase tracking-wider text-blue-400 font-semibold truncate">
                                {item.brand}
                              </p>
                            )}
                            <p className="text-[11px] font-medium truncate">{item.name}</p>
                            <div className="flex items-center justify-center gap-1 pt-0.5">
                              {itemColors.map((colName) => (
                                <span
                                  key={colName}
                                  className="w-2 h-2 rounded-full border border-white/20"
                                  style={{ backgroundColor: getColorHex(colName) }}
                                  title={colName}
                                />
                              ))}
                              <span className="text-[9px] font-mono opacity-50 truncate ml-0.5">
                                {item.material}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-black/5 dark:border-white/5">
                {currentSlotSelectedItems.length > 0 && (
                  <button
                    onClick={() => clearSlot(activeDrawerCategory)}
                    className="py-3 px-4 text-xs font-mono text-red-400 hover:text-red-300 liquid-control rounded-2xl"
                  >
                    Clear Slot
                  </button>
                )}
                <button
                  onClick={() => setActiveDrawerCategory(null)}
                  className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-lg transition-all"
                >
                  Done ({currentSlotSelectedItems.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusable Component for Each Mannequin Slot
function MannequinSlotButton({
  slotKey,
  title,
  icon,
  items,
  onClick,
  className = '',
}: {
  slotKey: Category;
  title: string;
  icon: string;
  items?: ClothingItem[];
  onClick: () => void;
  className?: string;
}) {
  const hasItems = items && items.length > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl liquid-control flex items-center justify-center p-1.5 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95 relative overflow-hidden group ${
        hasItems ? 'border-white/30 dark:border-white/20' : 'border-dashed'
      } ${className}`}
    >
      {hasItems ? (
        <div className="w-full h-full flex items-center justify-center relative">
          {items.length === 1 ? (
            <img
              src={items[0].image}
              alt={items[0].name}
              className="h-full w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            // Multi-item layered preview
            <div className="w-full h-full flex items-center justify-center relative">
              {items.map((item, idx) => (
                <img
                  key={item.id}
                  src={item.image}
                  alt={item.name}
                  style={{
                    transform: `translateX(${(idx - (items.length - 1) / 2) * 14}px) scale(${
                      1 - idx * 0.05
                    })`,
                    zIndex: idx + 1,
                  }}
                  className="absolute max-h-full max-w-[85%] object-contain filter drop-shadow-md"
                />
              ))}
            </div>
          )}

          {/* Multi-item badge count */}
          {items.length > 1 && (
            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full z-30 shadow-md">
              {items.length}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center opacity-40 select-none text-center px-1">
          <span className="text-xs">{icon}</span>
          <span className="text-[9px] font-mono tracking-wider uppercase truncate mt-0.5">
            + {title}
          </span>
        </div>
      )}
    </button>
  );
}
