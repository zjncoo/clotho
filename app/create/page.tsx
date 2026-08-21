'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { get } from 'idb-keyval';
import { Category, ClothingItem } from '@/types';
import {
  Download,
  RotateCcw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Shirt,
  Layers,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import Link from 'next/link';

const STORAGE_KEY = 'closet_catalog_items';

interface StepConfig {
  category: Category;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
}

const STEPS: StepConfig[] = [
  {
    category: 'headwear',
    label: 'Headwear & Hats',
    shortLabel: 'Hat',
    description: 'Select a cap, beanie, or hat to top off your look',
    icon: '🧢',
  },
  {
    category: 'necklace',
    label: 'Necklaces & Chains',
    shortLabel: 'Necklace',
    description: 'Add a pendant, chain, or statement necklace',
    icon: '📿',
  },
  {
    category: 'top',
    label: 'Tops & Jackets',
    shortLabel: 'Top',
    description: 'Choose your t-shirt, shirt, hoodie, or outerwear',
    icon: '👕',
  },
  {
    category: 'bottom',
    label: 'Pants & Skirts',
    shortLabel: 'Bottom',
    description: 'Pick jeans, trousers, shorts, or a skirt',
    icon: '👖',
  },
  {
    category: 'bracelet',
    label: 'Bracelets & Watches',
    shortLabel: 'Bracelet',
    description: 'Add wristwear, a timepiece, or cuff',
    icon: '⌚',
  },
  {
    category: 'bag',
    label: 'Bags & Backpacks',
    shortLabel: 'Bag',
    description: 'Choose your tote, crossbody, or backpack',
    icon: '👜',
  },
  {
    category: 'shoes',
    label: 'Shoes & Footwear',
    shortLabel: 'Shoes',
    description: 'Select matching sneakers, boots, or shoes',
    icon: '👟',
  },
  {
    category: 'accessories',
    label: 'Other Accessories',
    shortLabel: 'Extras',
    description: 'Complete the fit with sunglasses, belts, or rings',
    icon: '🕶️',
  },
];

export default function OutfitStudioPage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfit, setOutfit] = useState<Partial<Record<Category, ClothingItem>>>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const mannequinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadCatalog() {
      const saved = await get<ClothingItem[]>(STORAGE_KEY);
      if (saved) setItems(saved);
    }
    loadCatalog();
  }, []);

  const currentStep = STEPS[currentStepIndex];
  const categoryItems = items.filter((i) => i.category === currentStep.category);
  const selectedItemForCurrentStep = outfit[currentStep.category];

  const handleSelectItem = (item: ClothingItem) => {
    if (outfit[item.category]?.id === item.id) {
      // Toggle off if already selected
      setOutfit((prev) => {
        const copy = { ...prev };
        delete copy[item.category];
        return copy;
      });
    } else {
      setOutfit((prev) => ({ ...prev, [item.category]: item }));
    }
  };

  const handleClearSlot = (cat: Category) => {
    setOutfit((prev) => {
      const copy = { ...prev };
      delete copy[cat];
      return copy;
    });
  };

  const handlePrevStep = () => {
    setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : STEPS.length - 1));
  };

  const handleNextStep = () => {
    setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : 0));
  };

  const exportOutfitPNG = async () => {
    if (!mannequinRef.current) return;
    setIsExporting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const dataUrl = await toPng(mannequinRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: '#0d0e11',
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

  const selectedCount = Object.keys(outfit).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-36 space-y-6">
      {/* Studio Header */}
      <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Outfit Studio</h1>
          </div>
          <p className="text-xs font-mono opacity-60 mt-0.5">
            Step {currentStepIndex + 1} of {STEPS.length}: {currentStep.label} ({selectedCount} pieces selected)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setOutfit({})}
            disabled={selectedCount === 0}
            className="text-xs font-mono opacity-60 hover:opacity-100 disabled:opacity-20 flex items-center gap-1 transition-opacity px-2.5 py-1.5 rounded-lg liquid-control"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={exportOutfitPNG}
            disabled={selectedCount === 0 || isExporting}
            className="liquid-control text-xs font-semibold tracking-wider uppercase px-4 py-2.5 rounded-full flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed shadow-md hover:scale-102 active:scale-95 transition-all"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" /> : <Download className="w-3.5 h-3.5" />}
            <span>Export PNG</span>
          </button>
        </div>
      </div>

      {/* Main Studio Canvas: Center Outfit Composition */}
      <div className="flex flex-col items-center">
        <div
          ref={mannequinRef}
          className="w-full max-w-md liquid-glass rounded-[2.5rem] p-5 sm:p-6 shadow-2xl border border-white/20 dark:border-white/10 relative overflow-hidden"
        >
          {/* Subtle Ambient Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

          {/* Mannequin Layers */}
          <div className="flex flex-col items-center gap-3 relative z-10">
            {/* 1. Headwear */}
            <div
              onClick={() => setCurrentStepIndex(0)}
              className={`w-32 h-20 rounded-2xl liquid-control flex items-center justify-center p-1.5 cursor-pointer transition-all duration-300 ${
                currentStepIndex === 0 ? 'ring-2 ring-blue-500 shadow-lg scale-105' : 'hover:scale-102'
              }`}
            >
              {outfit.headwear ? (
                <img
                  src={outfit.headwear.image}
                  alt={outfit.headwear.name}
                  className="h-full w-full object-contain filter drop-shadow-md"
                />
              ) : (
                <span className="text-[10px] font-mono tracking-wider uppercase opacity-40 select-none">
                  + Headwear
                </span>
              )}
            </div>

            {/* 2. Necklace (Directly under headwear / on collar) */}
            <div
              onClick={() => setCurrentStepIndex(1)}
              className={`w-28 h-14 rounded-2xl liquid-control flex items-center justify-center p-1 -mt-1 cursor-pointer transition-all duration-300 z-20 ${
                currentStepIndex === 1 ? 'ring-2 ring-blue-500 shadow-lg scale-105' : 'hover:scale-102'
              }`}
            >
              {outfit.necklace ? (
                <img
                  src={outfit.necklace.image}
                  alt={outfit.necklace.name}
                  className="h-full w-full object-contain filter drop-shadow-md"
                />
              ) : (
                <span className="text-[9px] font-mono tracking-wider uppercase opacity-40 select-none">
                  + Necklace
                </span>
              )}
            </div>

            {/* Middle Section: Top with Side Slots for Bag & Bracelet */}
            <div className="w-full flex items-center justify-between gap-2.5">
              {/* Left Side: Bag */}
              <div
                onClick={() => setCurrentStepIndex(5)}
                className={`w-20 h-24 rounded-2xl liquid-control flex items-center justify-center p-1.5 cursor-pointer transition-all duration-300 ${
                  currentStepIndex === 5 ? 'ring-2 ring-blue-500 shadow-lg scale-105' : 'hover:scale-102'
                }`}
              >
                {outfit.bag ? (
                  <img
                    src={outfit.bag.image}
                    alt={outfit.bag.name}
                    className="h-full w-full object-contain filter drop-shadow-md"
                  />
                ) : (
                  <span className="text-[9px] font-mono tracking-wider uppercase opacity-40 select-none text-center">
                    + Bag
                  </span>
                )}
              </div>

              {/* Center: Top / Jacket */}
              <div
                onClick={() => setCurrentStepIndex(2)}
                className={`flex-1 h-44 rounded-2xl liquid-control flex items-center justify-center p-2 cursor-pointer transition-all duration-300 ${
                  currentStepIndex === 2 ? 'ring-2 ring-blue-500 shadow-lg scale-105' : 'hover:scale-102'
                }`}
              >
                {outfit.top ? (
                  <img
                    src={outfit.top.image}
                    alt={outfit.top.name}
                    className="h-full w-full object-contain filter drop-shadow-md"
                  />
                ) : (
                  <span className="text-[11px] font-mono tracking-wider uppercase opacity-40 select-none">
                    + Top / Jacket
                  </span>
                )}
              </div>

              {/* Right Side: Bracelet / Watch */}
              <div
                onClick={() => setCurrentStepIndex(4)}
                className={`w-20 h-24 rounded-2xl liquid-control flex items-center justify-center p-1.5 cursor-pointer transition-all duration-300 ${
                  currentStepIndex === 4 ? 'ring-2 ring-blue-500 shadow-lg scale-105' : 'hover:scale-102'
                }`}
              >
                {outfit.bracelet ? (
                  <img
                    src={outfit.bracelet.image}
                    alt={outfit.bracelet.name}
                    className="h-full w-full object-contain filter drop-shadow-md"
                  />
                ) : (
                  <span className="text-[9px] font-mono tracking-wider uppercase opacity-40 select-none text-center">
                    + Bracelet
                  </span>
                )}
              </div>
            </div>

            {/* 4. Bottoms (Pants / Skirt) */}
            <div
              onClick={() => setCurrentStepIndex(3)}
              className={`w-3/4 h-44 rounded-2xl liquid-control flex items-center justify-center p-2 cursor-pointer transition-all duration-300 ${
                currentStepIndex === 3 ? 'ring-2 ring-blue-500 shadow-lg scale-105' : 'hover:scale-102'
              }`}
            >
              {outfit.bottom ? (
                <img
                  src={outfit.bottom.image}
                  alt={outfit.bottom.name}
                  className="h-full w-full object-contain filter drop-shadow-md"
                />
              ) : (
                <span className="text-[11px] font-mono tracking-wider uppercase opacity-40 select-none">
                  + Pants / Skirt
                </span>
              )}
            </div>

            {/* Bottom Row: Shoes & Extras */}
            <div className="w-full flex items-center justify-center gap-3">
              {/* 7. Shoes */}
              <div
                onClick={() => setCurrentStepIndex(6)}
                className={`w-44 h-24 rounded-2xl liquid-control flex items-center justify-center p-1.5 cursor-pointer transition-all duration-300 ${
                  currentStepIndex === 6 ? 'ring-2 ring-blue-500 shadow-lg scale-105' : 'hover:scale-102'
                }`}
              >
                {outfit.shoes ? (
                  <img
                    src={outfit.shoes.image}
                    alt={outfit.shoes.name}
                    className="h-full w-full object-contain filter drop-shadow-md"
                  />
                ) : (
                  <span className="text-[10px] font-mono tracking-wider uppercase opacity-40 select-none">
                    + Shoes
                  </span>
                )}
              </div>

              {/* 8. Other Accessories */}
              <div
                onClick={() => setCurrentStepIndex(7)}
                className={`w-28 h-24 rounded-2xl liquid-control flex items-center justify-center p-1.5 cursor-pointer transition-all duration-300 ${
                  currentStepIndex === 7 ? 'ring-2 ring-blue-500 shadow-lg scale-105' : 'hover:scale-102'
                }`}
              >
                {outfit.accessories ? (
                  <img
                    src={outfit.accessories.image}
                    alt={outfit.accessories.name}
                    className="h-full w-full object-contain filter drop-shadow-md"
                  />
                ) : (
                  <span className="text-[9px] font-mono tracking-wider uppercase opacity-40 select-none text-center">
                    + Extras
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigator Bar & Item Selector Carousel */}
      <div className="liquid-glass rounded-[2rem] p-4 sm:p-5 space-y-4 shadow-xl border border-white/20 dark:border-white/10">
        {/* Step Header with Navigation Arrows */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handlePrevStep}
            aria-label="Previous step"
            className="liquid-control p-2.5 rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1 text-xs font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">{currentStep.icon}</span>
              <h2 className="text-base font-bold tracking-tight">{currentStep.label}</h2>
            </div>
            <p className="text-xs font-mono opacity-60 truncate">{currentStep.description}</p>
          </div>

          <button
            onClick={handleNextStep}
            aria-label="Next step"
            className="liquid-control p-2.5 rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1 text-xs font-medium"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Pills */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STEPS.map((step, idx) => {
            const isFilled = !!outfit[step.category];
            const isActive = idx === currentStepIndex;
            return (
              <button
                key={step.category}
                onClick={() => setCurrentStepIndex(idx)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md font-semibold scale-105'
                    : isFilled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'liquid-control opacity-50 hover:opacity-100'
                }`}
              >
                <span>{step.icon}</span>
                <span className="hidden md:inline">{step.shortLabel}</span>
                {isFilled && <Check className="w-2.5 h-2.5" />}
              </button>
            );
          })}
        </div>

        {/* Step Item Selector Area */}
        <div className="pt-2 border-t border-black/5 dark:border-white/5">
          {selectedItemForCurrentStep && (
            <div className="mb-3 flex items-center justify-between p-2.5 liquid-control rounded-2xl">
              <div className="flex items-center gap-3">
                <img
                  src={selectedItemForCurrentStep.image}
                  alt={selectedItemForCurrentStep.name}
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <p className="text-xs font-semibold">{selectedItemForCurrentStep.name}</p>
                  <p className="text-[10px] font-mono opacity-60">
                    {selectedItemForCurrentStep.color} • {selectedItemForCurrentStep.material}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleClearSlot(currentStep.category)}
                className="text-xs text-red-400 hover:text-red-300 font-mono px-3 py-1.5 rounded-xl liquid-control"
              >
                Remove from slot
              </button>
            </div>
          )}

          {categoryItems.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-black/10 dark:border-white/10 rounded-2xl space-y-2">
              <p className="text-xs font-mono opacity-50">
                No items saved under &ldquo;{currentStep.label}&rdquo; in your wardrobe yet.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:underline pt-1"
              >
                <Plus className="w-3.5 h-3.5" /> Go to Wardrobe to add one
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-48 overflow-y-auto pr-1">
              {categoryItems.map((item) => {
                const isSelected = outfit[currentStep.category]?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`aspect-square p-2 rounded-2xl liquid-control flex flex-col items-center justify-between transition-all ${
                      isSelected
                        ? 'ring-2 ring-blue-500 bg-blue-500/10 shadow-lg scale-95'
                        : 'hover:scale-102 hover:shadow-md'
                    }`}
                  >
                    <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                      />
                    </div>
                    <span className="text-[10px] font-medium opacity-80 mt-1 truncate w-full text-center">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
