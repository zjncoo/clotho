'use client';

import { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';
import { UploadCloud, Loader2, Trash2, X } from 'lucide-react';
import { ClothingItem, Category } from '@/types';
import { processAndCompressImage } from '@/utils/imageProcessor';

const STORAGE_KEY = 'closet_catalog_items';

const MATERIALS = [
  'Cotone',
  'Denim',
  'Lana',
  'Lino',
  'Seta',
  'Pelle',
  'Pelle Scamosciata',
  'Cashmere',
  'Tecnico / Nylon',
  'Velluto',
];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'headwear', label: 'Copricapo' },
  { value: 'top', label: 'Top / Giacche' },
  { value: 'bottom', label: 'Pantaloni / Gonne' },
  { value: 'shoes', label: 'Scarpe' },
  { value: 'accessories', label: 'Accessori' },
];

export default function CatalogPage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const [pendingItem, setPendingItem] = useState<{ image: string; color: string } | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('top');
  const [formMaterial, setFormMaterial] = useState(MATERIALS[0]);

  useEffect(() => {
    async function loadStoredItems() {
      const stored = await get<ClothingItem[]>(STORAGE_KEY);
      if (stored) setItems(stored);
    }
    loadStoredItems();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      setStatus('Caricamento modulo IA...');
      const { default: removeBackground } = await import('@imgly/background-removal');

      setStatus('Rimozione sfondo...');
      const transparentBlob = await removeBackground(file);

      setStatus('Compressione WebP...');
      const { webpBase64, dominantColor } = await processAndCompressImage(transparentBlob, 0.82);

      setPendingItem({ image: webpBase64, color: dominantColor });
      setFormName(file.name.replace(/\.[^/.]+$/, ''));
      setStatus('');
      setLoading(false);
    } catch (err) {
      console.error("Errore durante l'elaborazione:", err);
      setStatus('Errore elaborazione');
      setLoading(false);
    }
  };

  const handleSaveItem = async () => {
    if (!pendingItem) return;

    const newItem: ClothingItem = {
      id: crypto.randomUUID(),
      image: pendingItem.image,
      category: formCategory,
      color: pendingItem.color,
      material: formMaterial,
      name: formName.trim() || 'Capo senza nome',
      createdAt: Date.now(),
    };

    const updated = [newItem, ...items];
    setItems(updated);
    await set(STORAGE_KEY, updated);
    setPendingItem(null);
  };

  const removeItem = async (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    await set(STORAGE_KEY, updated);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Il tuo Guardaroba</h1>
          <p className="text-xs font-mono opacity-60 mt-1">{items.length} Capi in memoria locale</p>
        </div>

        <label className="cursor-pointer liquid-control px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide uppercase flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
          <span>{loading ? status : 'Aggiungi Capo'}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={loading} />
        </label>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="liquid-glass rounded-3xl p-4 flex flex-col justify-between group">
            <div className="aspect-square relative rounded-2xl liquid-control flex items-center justify-center p-4 overflow-hidden">
              <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-2 right-2 p-2 liquid-control rounded-full opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider opacity-50">{item.category}</div>
              <div className="text-sm font-medium leading-snug truncate">{item.name}</div>
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-mono">
                <span className="liquid-control px-2.5 py-0.5 rounded-md opacity-80">{item.color}</span>
                <span className="liquid-control px-2.5 py-0.5 rounded-md opacity-80">{item.material}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pendingItem && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="liquid-glass rounded-[2rem] max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold">Catalogazione Capo</h2>
              <button onClick={() => setPendingItem(null)} className="p-1.5 liquid-control rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video liquid-control rounded-2xl flex items-center justify-center p-4">
              <img src={pendingItem.image} alt="Preview" className="max-h-full max-w-full object-contain" />
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block opacity-60 mb-1.5">Nome</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full liquid-control rounded-xl px-3 py-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block opacity-60 mb-1.5">Categoria</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Category)}
                    className="w-full liquid-control rounded-xl px-3 py-2 text-sm font-sans focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value} className="text-black">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block opacity-60 mb-1.5">Materiale</label>
                  <select
                    value={formMaterial}
                    onChange={(e) => setFormMaterial(e.target.value)}
                    className="w-full liquid-control rounded-xl px-3 py-2 text-sm font-sans focus:outline-none"
                  >
                    {MATERIALS.map((m) => (
                      <option key={m} value={m} className="text-black">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block opacity-60 mb-1.5">Colore Rilevato</label>
                <input
                  type="text"
                  value={pendingItem.color}
                  onChange={(e) => setPendingItem({ ...pendingItem, color: e.target.value })}
                  className="w-full liquid-control rounded-xl px-3 py-2 text-sm font-sans focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPendingItem(null)}
                className="flex-1 py-2.5 text-xs font-mono liquid-control rounded-xl"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveItem}
                className="flex-1 py-2.5 text-xs font-mono bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600 transition"
              >
                Salva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
