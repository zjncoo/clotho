'use client';

import { useState, useEffect, useMemo } from 'react';
import Script from 'next/script';
import { get, set } from 'idb-keyval';
import { UploadCloud, Loader2, Trash2, X, Search, Filter } from 'lucide-react';
import { ClothingItem, Category } from '@/types';
import { processAndCompressImage } from '@/utils/imageProcessor';

const STORAGE_KEY = 'closet_catalog_items';

const MATERIALS = ['Tutti', 'Cotone', 'Denim', 'Lana', 'Lino', 'Seta', 'Pelle', 'Pelle Scamosciata', 'Cashmere', 'Tecnico / Nylon', 'Velluto'];
const CATEGORIES: { value: string; label: string }[] = [
  { value: 'all', label: 'Tutti' },
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

  // Filtri di ricerca
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('Tutti');
  const [selectedColor, setSelectedColor] = useState('Tutti');

  // Stato Modale Inserimento
  const [pendingItem, setPendingItem] = useState<{ image: string; color: string } | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('top');
  const [formMaterial, setFormMaterial] = useState('Cotone');

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
      setStatus('Rimozione sfondo...');
      let transparentBlob: Blob = file;

      // @ts-expect-error imgly caricato via CDN
      if (typeof window !== 'undefined' && window.imglyRemoveBackground) {
        // @ts-expect-error imgly caricato via CDN
        transparentBlob = await window.imglyRemoveBackground(file, {
          publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.4.5/dist/',
        });
      }

      setStatus('Compressione WebP...');
      const { webpBase64, dominantColor } = await processAndCompressImage(transparentBlob, 0.82);

      setPendingItem({ image: webpBase64, color: dominantColor });
      setFormName(file.name.replace(/\.[^/.]+$/, ''));
      setStatus('');
      setLoading(false);
    } catch (err) {
      console.error(err);
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

  // Elenco colori unici presenti nel catalogo
  const availableColors = useMemo(() => {
    const colors = new Set(items.map((i) => i.color).filter(Boolean));
    return ['Tutti', ...Array.from(colors)];
  }, [items]);

  // Capi filtrati
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchMat = selectedMaterial === 'Tutti' || item.material === selectedMaterial;
      const matchCol = selectedColor === 'Tutti' || item.color === selectedColor;
      return matchSearch && matchCat && matchMat && matchCol;
    });
  }, [items, searchTerm, selectedCategory, selectedMaterial, selectedColor]);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/bundle.js"
        strategy="afterInteractive"
      />

      <div className="max-w-6xl mx-auto px-6 pt-8 pb-32 space-y-6">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Il tuo Guardaroba</h1>
            <p className="text-xs font-mono opacity-60 mt-1">
              {filteredItems.length} di {items.length} capi visualizzati
            </p>
          </div>

          <label className="cursor-pointer liquid-control px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide uppercase flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            <span>{loading ? status : 'Aggiungi Capo'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={loading} />
          </label>
        </header>

        {/* Barra di Ricerca e Filtri */}
        <div className="liquid-glass rounded-[2rem] p-5 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="text"
              placeholder="Cerca per nome capo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full liquid-control rounded-full pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filtro Categorie */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedCategory(c.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                  selectedCategory === c.value
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm font-medium'
                    : 'liquid-control opacity-70 hover:opacity-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Filtri Materiali e Colori */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono opacity-50">Materiale:</span>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="liquid-control rounded-lg px-2.5 py-1 text-xs focus:outline-none flex-1"
              >
                {MATERIALS.map((m) => (
                  <option key={m} value={m} className="text-black">{m}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono opacity-50">Colore:</span>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="liquid-control rounded-lg px-2.5 py-1 text-xs focus:outline-none flex-1"
              >
                {availableColors.map((col) => (
                  <option key={col} value={col} className="text-black">{col}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Griglia Capi */}
        {filteredItems.length === 0 ? (
          <div className="liquid-glass rounded-3xl p-12 text-center">
            <p className="text-xs font-mono opacity-50">Nessun capo trovato con i filtri attuali.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
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
        )}

        {/* Modale Inserimento */}
        {pendingItem && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
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
                      {CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                        <option key={c.value} value={c.value} className="text-black">{c.label}</option>
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
                      {MATERIALS.filter((m) => m !== 'Tutti').map((m) => (
                        <option key={m} value={m} className="text-black">{m}</option>
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
    </>
  );
}
