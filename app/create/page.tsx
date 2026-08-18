'use client';

import { useState, useEffect, useRef } from 'react';
import { get } from 'idb-keyval';
import { Category, ClothingItem } from '@/types';
import { Download, RotateCcw, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogClose,
} from '@/components/core/morphing-dialog';

const STORAGE_KEY = 'closet_catalog_items';

const SLOTS: { category: Category; label: string; height: string }[] = [
  { category: 'headwear', label: 'Copricapo', height: 'h-24' },
  { category: 'top', label: 'Top / Giacca', height: 'h-48' },
  { category: 'bottom', label: 'Pantaloni / Gonna', height: 'h-52' },
  { category: 'shoes', label: 'Scarpe', height: 'h-28' },
];

export default function CreateOutfitPage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfit, setOutfit] = useState<Partial<Record<Category, ClothingItem>>>({});
  const [isExporting, setIsExporting] = useState(false);

  const mannequinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadCatalog() {
      const saved = await get<ClothingItem[]>(STORAGE_KEY);
      if (saved) setItems(saved);
    }
    loadCatalog();
  }, []);

  const selectItemForSlot = (item: ClothingItem, closeFn?: () => void) => {
    setOutfit((prev) => ({ ...prev, [item.category]: item }));
    if (closeFn) closeFn();
  };

  const removeSlot = (cat: Category) => {
    setOutfit((prev) => {
      const copy = { ...prev };
      delete copy[cat];
      return copy;
    });
  };

  const exportOutfitPNG = async () => {
    if (!mannequinRef.current) return;
    setIsExporting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const dataUrl = await toPng(mannequinRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `outfit-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const hasItems = Object.keys(outfit).length > 0;

  return (
    <div className="max-w-3xl mx-auto px-6 pt-8 pb-32 space-y-6">
      <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Studio Abbinamento</h1>
          <p className="text-xs font-mono opacity-60">Clicca su uno slot per aprire il selettore Morphing</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOutfit({})}
            className="text-xs font-mono opacity-60 hover:opacity-100 flex items-center gap-1 transition-opacity px-2 py-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={exportOutfitPNG}
            disabled={!hasItems || isExporting}
            className="liquid-control text-xs font-mono tracking-wider uppercase px-4 py-2 rounded-full flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Esporta PNG</span>
          </button>
        </div>
      </div>

      {/* Manichino con Morphing Dialog integrato su ogni slot */}
      <div
        ref={mannequinRef}
        className="w-full max-w-sm mx-auto flex flex-col gap-4 p-6 liquid-glass rounded-[2.5rem]"
      >
        {SLOTS.map(({ category, label, height }) => {
          const currentItem = outfit[category];
          const categoryItems = items.filter((i) => i.category === category);

          return (
            <MorphingDialog
              key={category}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            >
              <MorphingDialogTrigger
                className={`w-full ${height} rounded-2xl liquid-control flex items-center justify-center p-3 transition-transform hover:scale-[1.01]`}
              >
                {currentItem ? (
                  <img
                    src={currentItem.image}
                    alt={currentItem.name}
                    className="h-full w-full object-contain filter drop-shadow-md"
                  />
                ) : (
                  <span className="text-[11px] font-mono tracking-wider uppercase opacity-40 select-none">
                    + {label}
                  </span>
                )}
              </MorphingDialogTrigger>

              <MorphingDialogContainer>
                <MorphingDialogContent className="w-full max-w-md liquid-glass rounded-[2.5rem] p-6 max-h-[85vh] flex flex-col">
                  <div className="mb-4">
                    <MorphingDialogTitle className="text-lg">
                      Seleziona {label}
                    </MorphingDialogTitle>
                    <MorphingDialogSubtitle>
                      {categoryItems.length} capi disponibili nel guardaroba
                    </MorphingDialogSubtitle>
                  </div>

                  {currentItem && (
                    <div className="mb-4 flex items-center justify-between p-3 liquid-control rounded-xl">
                      <div className="flex items-center gap-3">
                        <img src={currentItem.image} alt={currentItem.name} className="w-10 h-10 object-contain" />
                        <div>
                          <p className="text-xs font-medium">{currentItem.name}</p>
                          <p className="text-[10px] font-mono opacity-60">{currentItem.color} • {currentItem.material}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeSlot(category)}
                        className="text-xs text-red-500 hover:underline font-mono px-2 py-1"
                      >
                        Rimuovi
                      </button>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto pr-1">
                    {categoryItems.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-black/10 dark:border-white/10 rounded-2xl">
                        <p className="text-xs font-mono opacity-50">Nessun capo trovato in questa categoria.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {categoryItems.map((item) => {
                          const isSelected = outfit[category]?.id === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => selectItemForSlot(item)}
                              className={`aspect-square p-2 rounded-2xl liquid-control flex flex-col items-center justify-center transition ${
                                isSelected ? 'ring-2 ring-blue-500 shadow-md scale-95' : 'hover:scale-102'
                              }`}
                            >
                              <img src={item.image} alt={item.name} className="max-h-20 max-w-full object-contain" />
                              <span className="text-[10px] font-medium opacity-80 mt-1.5 truncate w-full text-center">
                                {item.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <MorphingDialogClose />
                </MorphingDialogContent>
              </MorphingDialogContainer>
            </MorphingDialog>
          );
        })}
      </div>
    </div>
  );
}
