'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { get, set } from 'idb-keyval';
import {
  UploadCloud,
  Loader2,
  Trash2,
  X,
  Search,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Download,
  Upload,
  HardDriveDownload,
  CheckCircle2,
} from 'lucide-react';
import { ClothingItem, Category } from '@/types';
import { processAndCompressImage } from '@/utils/imageProcessor';

const STORAGE_KEY = 'closet_catalog_items';

const MATERIALS = [
  'All',
  'Cotton',
  'Denim',
  'Wool',
  'Linen',
  'Silk',
  'Leather',
  'Suede',
  'Cashmere',
  'Technical / Nylon',
  'Velvet',
  'Knitwear',
  'Synthetic',
];

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'all', label: 'All Items' },
  { value: 'headwear', label: 'Headwear' },
  { value: 'necklace', label: 'Necklaces' },
  { value: 'top', label: 'Tops & Jackets' },
  { value: 'bottom', label: 'Pants & Skirts' },
  { value: 'bracelet', label: 'Bracelets' },
  { value: 'bag', label: 'Bags' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
];

export default function WardrobePage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');

  // New Item Form Modal State
  const [pendingItem, setPendingItem] = useState<{ image: string; color: string } | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('top');
  const [formMaterial, setFormMaterial] = useState('Cotton');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function initStorage() {
      // Request persistent storage in browser
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
      }

      const stored = await get<ClothingItem[]>(STORAGE_KEY);
      if (stored) setItems(stored);
    }
    initStorage();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setLoading(true);
    try {
      setStatus('AI Initializing...');
      let transparentBlob: Blob = file;

      try {
        const importDynamic = new Function('url', 'return import(url)');
        const { removeBackground } = await importDynamic(
          'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/+esm'
        );
        setStatus('Removing background...');
        transparentBlob = await removeBackground(file, {
          progress: (key: string, current: number, total: number) => {
            const pct = total > 0 ? Math.round((current / total) * 100) : 0;
            if (pct > 0) {
              setStatus(`Removing bg ${pct}%`);
            }
          },
        });
      } catch (bgError) {
        console.warn('AI background removal fallback to original file:', bgError);
        transparentBlob = file;
      }

      setStatus('Optimizing item...');
      const { webpBase64, dominantColor } = await processAndCompressImage(transparentBlob, 0.88, 900);

      setPendingItem({ image: webpBase64, color: dominantColor });
      setFormName(file.name.replace(/\.[^/.]+$/, ''));
      setStatus('');
      setLoading(false);
    } catch (err) {
      console.error(err);
      setStatus('Processing failed');
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
      name: formName.trim() || 'Untitled Piece',
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

  // Backup & Restore
  const exportBackupJSON = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clotho-wardrobe-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showBackupNotice('Backup exported successfully!');
  };

  const importBackupJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (Array.isArray(parsed)) {
          setItems(parsed);
          await set(STORAGE_KEY, parsed);
          showBackupNotice(`${parsed.length} items restored successfully!`);
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        console.error(err);
        alert('Could not read backup file.');
      }
    };
    reader.readAsText(file);
  };

  const showBackupNotice = (msg: string) => {
    setBackupSuccess(msg);
    setTimeout(() => setBackupSuccess(null), 3500);
  };

  const hasActiveFilters =
    searchTerm !== '' || selectedCategory !== 'all' || selectedMaterial !== 'All' || selectedColor !== 'All';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedMaterial('All');
    setSelectedColor('All');
  };

  // Colors available in the wardrobe
  const availableColors = useMemo(() => {
    const colors = new Set(items.map((i) => i.color).filter(Boolean));
    return ['All', ...Array.from(colors)];
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchMat = selectedMaterial === 'All' || item.material === selectedMaterial;
      const matchCol = selectedColor === 'All' || item.color === selectedColor;
      return matchSearch && matchCat && matchMat && matchCol;
    });
  }, [items, searchTerm, selectedCategory, selectedMaterial, selectedColor]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-32 space-y-6">
      {/* Toast Notification */}
      {backupSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 liquid-glass rounded-full px-4 py-2 flex items-center gap-2 shadow-2xl border border-emerald-500/40 text-xs font-mono text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>{backupSuccess}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Your Wardrobe</h1>
          <p className="text-xs font-mono opacity-60 mt-1">
            {filteredItems.length} of {items.length} pieces displayed
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Backup & Restore Buttons */}
          <button
            onClick={exportBackupJSON}
            title="Export Wardrobe Backup"
            className="liquid-control p-3 rounded-2xl text-xs font-mono flex items-center gap-1.5 opacity-80 hover:opacity-100"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Backup</span>
          </button>

          <label
            title="Restore from JSON Backup"
            className="cursor-pointer liquid-control p-3 rounded-2xl text-xs font-mono flex items-center gap-1.5 opacity-80 hover:opacity-100"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Restore</span>
            <input
              ref={backupInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={importBackupJSON}
            />
          </label>

          {/* Add Piece Primary Button */}
          <label className="cursor-pointer liquid-control px-5 py-3 rounded-2xl text-xs font-semibold tracking-wide uppercase flex items-center justify-center gap-2.5 shadow-md active:scale-95 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> : <UploadCloud className="w-4 h-4" />}
            <span className="truncate max-w-[200px]">{loading ? status : 'Add Piece'}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={loading}
            />
          </label>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div className="liquid-glass rounded-[2rem] p-4 sm:p-5 space-y-4">
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 opacity-40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by piece name or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full liquid-control rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 p-1 rounded-full opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills with Smooth Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setSelectedCategory(c.value)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                selectedCategory === c.value
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-md scale-[1.02]'
                  : 'liquid-control opacity-70 hover:opacity-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Material and Color Selectors (Responsive, No Overlap) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {/* Material */}
          <div className="liquid-control rounded-2xl px-3.5 py-2 flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono opacity-50 whitespace-nowrap">Material:</span>
            <div className="relative flex-1 flex items-center justify-end">
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-right pr-6 appearance-none focus:outline-none cursor-pointer"
              >
                {MATERIALS.map((m) => (
                  <option key={m} value={m} className="text-black bg-white dark:bg-neutral-900 dark:text-white">
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 opacity-40 absolute right-0 pointer-events-none" />
            </div>
          </div>

          {/* Color */}
          <div className="liquid-control rounded-2xl px-3.5 py-2 flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono opacity-50 whitespace-nowrap">Color:</span>
            <div className="relative flex-1 flex items-center justify-end">
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-right pr-6 appearance-none focus:outline-none cursor-pointer"
              >
                {availableColors.map((col) => (
                  <option key={col} value={col} className="text-black bg-white dark:bg-neutral-900 dark:text-white">
                    {col}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 opacity-40 absolute right-0 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <div className="flex justify-end pt-1">
            <button
              onClick={resetFilters}
              className="text-[11px] font-mono opacity-60 hover:opacity-100 flex items-center gap-1.5 transition-opacity px-2 py-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset active filters
            </button>
          </div>
        )}
      </div>

      {/* Grid of Clothes with Large High-Res Visuals */}
      {filteredItems.length === 0 ? (
        <div className="liquid-glass rounded-[2rem] p-12 text-center space-y-3">
          <p className="text-xs font-mono opacity-60">No clothing items match your current filters.</p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="liquid-control px-4 py-2 rounded-full text-xs font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="liquid-glass rounded-3xl p-3 sm:p-4 flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            >
              {/* Image Container: Full Viewport, Auto-Trimmed */}
              <div className="aspect-square relative rounded-2xl liquid-control flex items-center justify-center p-2 overflow-hidden bg-black/5 dark:bg-white/[0.03]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove item"
                  className="absolute top-2 right-2 p-2 liquid-control rounded-full opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:text-red-500 transition-all shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Item Info */}
              <div className="mt-3.5 space-y-1.5 px-0.5">
                <div className="text-[10px] font-mono uppercase tracking-wider opacity-50 font-semibold truncate">
                  {item.category}
                </div>
                <div className="text-sm font-medium leading-snug line-clamp-1" title={item.name}>
                  {item.name}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-mono">
                  <span className="liquid-control px-2.5 py-0.5 rounded-lg opacity-80 truncate max-w-full">
                    {item.color}
                  </span>
                  <span className="liquid-control px-2.5 py-0.5 rounded-lg opacity-80 truncate max-w-full">
                    {item.material}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Cataloging Modal */}
      {pendingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="liquid-glass rounded-[2rem] max-w-md w-full p-6 space-y-5 shadow-2xl border border-white/20 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <h2 className="text-base font-semibold">Catalog Piece</h2>
              </div>
              <button
                onClick={() => setPendingItem(null)}
                className="p-1.5 liquid-control rounded-full hover:opacity-70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview */}
            <div className="aspect-square max-h-56 liquid-control rounded-2xl flex items-center justify-center p-3 overflow-hidden bg-black/5 dark:bg-white/[0.03]">
              <img
                src={pendingItem.image}
                alt="Preview"
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block opacity-60 mb-1.5">Piece Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Striped Cotton Shorts"
                  className="w-full liquid-control rounded-xl px-3.5 py-2.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block opacity-60 mb-1.5">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Category)}
                    className="w-full liquid-control rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                      <option key={c.value} value={c.value} className="text-black bg-white dark:bg-neutral-900 dark:text-white">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block opacity-60 mb-1.5">Material</label>
                  <select
                    value={formMaterial}
                    onChange={(e) => setFormMaterial(e.target.value)}
                    className="w-full liquid-control rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none cursor-pointer"
                  >
                    {MATERIALS.filter((m) => m !== 'All').map((m) => (
                      <option key={m} value={m} className="text-black bg-white dark:bg-neutral-900 dark:text-white">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block opacity-60 mb-1.5">Detected Color (editable)</label>
                <input
                  type="text"
                  value={pendingItem.color}
                  onChange={(e) => setPendingItem({ ...pendingItem, color: e.target.value })}
                  className="w-full liquid-control rounded-xl px-3.5 py-2.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPendingItem(null)}
                className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider liquid-control rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all"
              >
                Save Piece
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
