'use client';

import { useState, useEffect, useRef } from 'react';
import { get } from 'idb-keyval';
import { Category, ClothingItem } from '@/types';
import Mannequin from '@/components/Mannequin';
import { Download, RotateCcw, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';

const STORAGE_KEY = 'closet_catalog_items';

export default function CreateOutfitPage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>('top');
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

  const selectItemForSlot = (item: ClothingItem) => {
    setOutfit((prev) => ({ ...prev, [item.category]: item }));
  };

  const clearSlot = (cat: Category) => {
    setOutfit((prev) => {
      const copy = { ...prev };
      delete copy[cat];
      return copy;
    });
  };

  const exportOutfitPNG = async () => {
    if (!mannequinRef.current) return;
    
    setActiveCategory(null);
    setIsExporting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 120));

      const dataUrl = await toPng(mannequinRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

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
  const filteredItems = activeCategory 
    ? items.filter((item) => item.category === activeCategory)
    : [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Studio Crea</h1>
          <p className="text-xs font-mono opacity-60">Seleziona una parte del corpo e componi l'outfit</p>
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
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Esporta PNG</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 flex flex-col items-center">
          <Mannequin 
            ref={mannequinRef}
            outfit={outfit} 
            activeCategory={activeCategory} 
            onSelectSlot={(cat) => setActiveCategory(cat)} 
          />
        </div>

        <div className="md:col-span-7 liquid-glass rounded-[2rem] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-mono uppercase tracking-widest font-semibold opacity-70">
              {activeCategory ? `Categoria: ${activeCategory}` : 'Seleziona una categoria sul manichino'}
            </h2>
            {activeCategory && outfit[activeCategory] && (
              <button 
                onClick={() => clearSlot(activeCategory)} 
                className="text-xs text-red-500 hover:underline font-mono"
              >
                Rimuovi slot
              </button>
            )}
          </div>

          {filteredItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 liquid-control border-dashed rounded-2xl">
              <p className="text-xs font-mono opacity-50">Nessun capo trovato in questa categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 overflow-y-auto max-h-[500px] pr-2">
              {filteredItems.map((item) => {
                const isSelected = outfit[item.category]?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => selectItemForSlot(item)}
                    className={`aspect-square p-2.5 rounded-2xl liquid-control flex flex-col items-center justify-center transition
                      ${isSelected ? 'ring-2 ring-blue-500 shadow-md scale-95' : 'hover:scale-102'}`}
                  >
                    <img src={item.image} alt={item.name} className="max-h-24 max-w-full object-contain" />
                    <span className="text-[10px] font-medium opacity-80 mt-2 truncate w-full text-center">
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
