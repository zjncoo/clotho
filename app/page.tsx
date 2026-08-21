'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  CheckCircle2,
  Edit3,
  Check,
} from 'lucide-react';
import { ClothingItem, Category } from '@/types';
import { processAndCompressImage } from '@/utils/imageProcessor';
import { COLOR_PALETTE, getColorHex } from '@/utils/colorPalette';

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

  // New Item Upload Form Modal State
  const [pendingItem, setPendingItem] = useState<{ image: string; color: string } | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('top');
  const [formMaterial, setFormMaterial] = useState('Cotton');
  const [formColors, setFormColors] = useState<string[]>([]);

  // Expanded Card / Edit Item Modal State
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<Category>('top');
  const [editMaterial, setEditMaterial] = useState('Cotton');
  const [editColors, setEditColors] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function initStorage() {
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
      setFormColors(dominantColor !== 'N/D' ? [dominantColor] : ['Black']);
      setFormName(file.name.replace(/\.[^/.]+$/, ''));
      setStatus('');
      setLoading(false);
    } catch (err) {
      console.error(err);
      setStatus('Processing failed');
      setLoading(false);
    }
  };

  const handleSaveNewItem = async () => {
    if (!pendingItem) return;

    const chosenColors = formColors.length > 0 ? formColors : [pendingItem.color || 'Black'];

    const newItem: ClothingItem = {
      id: crypto.randomUUID(),
      image: pendingItem.image,
      category: formCategory,
      color: chosenColors[0],
      colors: chosenColors,
      material: formMaterial,
      name: formName.trim() || 'Untitled Piece',
      createdAt: Date.now(),
    };

    const updated = [newItem, ...items];
    setItems(updated);
    await set(STORAGE_KEY, updated);
    setPendingItem(null);
  };

  // Open Edit Modal
  const openEditModal = (item: ClothingItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditMaterial(item.material);
    const initialColors = item.colors && item.colors.length > 0 ? item.colors : item.color ? [item.color] : ['Black'];
    setEditColors(initialColors);
  };

  // Toggle color helper
  const toggleColorSelection = (colorName: string, currentList: string[], setter: (v: string[]) => void) => {
    if (currentList.includes(colorName)) {
      if (currentList.length > 1) {
        setter(currentList.filter((c) => c !== colorName));
      }
    } else {
      setter([...currentList, colorName]);
    }
  };

  // Save Edits to existing item
  const handleSaveEditedItem = async () => {
    if (!editingItem) return;

    const chosenColors = editColors.length > 0 ? editColors : ['Black'];

    const updated = items.map((i) => {
      if (i.id === editingItem.id) {
        return {
          ...i,
          name: editName.trim() || 'Untitled Piece',
          category: editCategory,
          material: editMaterial,
          color: chosenColors[0],
          colors: chosenColors,
        };
      }
      return i;
    });

    setItems(updated);
    await set(STORAGE_KEY, updated);
    setEditingItem(null);
    showBackupNotice('Piece updated successfully');
  };

  const removeItem = async (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    await set(STORAGE_KEY, updated);
    if (editingItem?.id === id) {
      setEditingItem(null);
    }
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
          showBackupNotice(`${parsed.length} pieces restored successfully!`);
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
    setTimeout(() => setBackupSuccess(null), 3200);
  };

  const hasActiveFilters =
    searchTerm !== '' || selectedCategory !== 'all' || selectedMaterial !== 'All' || selectedColor !== 'All';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedMaterial('All');
    setSelectedColor('All');
  };

  // Filtered Items (handles multi-color matching)
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchMat = selectedMaterial === 'All' || item.material === selectedMaterial;

      const itemColors = item.colors && item.colors.length > 0 ? item.colors : item.color ? [item.color] : [];
      const matchCol =
        selectedColor === 'All' ||
        itemColors.some((c) => c.toLowerCase() === selectedColor.toLowerCase() || c.includes(selectedColor));

      return matchSearch && matchCat && matchMat && matchCol;
    });
  }, [items, searchTerm, selectedCategory, selectedMaterial, selectedColor]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-32 space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {backupSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 liquid-glass rounded-full px-4 py-2 flex items-center gap-2 shadow-2xl border border-emerald-500/40 text-xs font-mono text-emerald-400"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{backupSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Your Wardrobe</h1>
          <p className="text-xs font-mono opacity-50 mt-1">
            {filteredItems.length} of {items.length} pieces displayed
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Backup & Restore Buttons */}
          <button
            onClick={exportBackupJSON}
            title="Export Wardrobe Backup"
            className="liquid-control p-3 rounded-2xl text-xs font-mono flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-all hover:scale-102"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Backup</span>
          </button>

          <label
            title="Restore from JSON Backup"
            className="cursor-pointer liquid-control p-3 rounded-2xl text-xs font-mono flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-all hover:scale-102"
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
          <label className="cursor-pointer liquid-control px-5 py-3 rounded-2xl text-xs font-semibold tracking-wide uppercase flex items-center justify-center gap-2.5 shadow-md active:scale-95 transition-all hover:scale-102">
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

        {/* Category Pills */}
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

        {/* Material Selector & Color Swatches Bar */}
        <div className="space-y-3 pt-1">
          {/* Material Row */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono opacity-50 whitespace-nowrap">Material:</span>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="liquid-control rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none flex-1 max-w-xs cursor-pointer"
            >
              {MATERIALS.map((m) => (
                <option key={m} value={m} className="text-black bg-white dark:bg-neutral-900 dark:text-white">
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Color Swatches (Visual squares with selection ring) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono opacity-50">Filter by Color:</span>
              {selectedColor !== 'All' && (
                <button
                  onClick={() => setSelectedColor('All')}
                  className="text-[10px] font-mono text-blue-400 hover:underline"
                >
                  Clear color ({selectedColor})
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
              <button
                onClick={() => setSelectedColor('All')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedColor === 'All'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-md font-semibold'
                    : 'liquid-control opacity-60 hover:opacity-100'
                }`}
              >
                All Colors
              </button>

              {COLOR_PALETTE.map((c) => {
                const isSelected = selectedColor === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(isSelected ? 'All' : c.name)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 flex-shrink-0 ${
                      isSelected
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-md ring-2 ring-blue-500 font-semibold'
                        : 'liquid-control opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-md border border-white/20 shadow-xs flex-shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                );
              })}
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

      {/* Grid of Clothes with Expandable Cards */}
      {filteredItems.length === 0 ? (
        <div className="liquid-glass rounded-[2rem] p-12 text-center space-y-3">
          <p className="text-xs font-mono opacity-50">No clothing items match your current filters.</p>
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
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.03 },
            },
          }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {filteredItems.map((item) => {
            const itemColors = item.colors && item.colors.length > 0 ? item.colors : item.color ? [item.color] : [];
            return (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 12, scale: 0.98 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
                }}
                onClick={() => openEditModal(item)}
                className="liquid-glass rounded-3xl p-3 sm:p-4 flex flex-col justify-between group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-white/30 dark:hover:border-white/20 active:scale-[0.98]"
              >
                {/* Image Container: Full Viewport, Auto-Trimmed */}
                <div className="aspect-square relative rounded-2xl liquid-control flex items-center justify-center p-2 overflow-hidden bg-black/5 dark:bg-white/[0.03]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Edit Indicator overlay badge on hover */}
                  <div className="absolute top-2 right-2 p-1.5 liquid-control rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <Edit3 className="w-3.5 h-3.5 opacity-70" />
                  </div>
                </div>

                {/* Item Info */}
                <div className="mt-3.5 space-y-1.5 px-0.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider opacity-40 font-semibold truncate">
                    {item.category}
                  </div>
                  <div className="text-sm font-semibold leading-snug line-clamp-1 group-hover:text-blue-400 transition-colors" title={item.name}>
                    {item.name}
                  </div>

                  {/* Multi-Color Swatches & Material */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
                    {itemColors.map((colName) => (
                      <span
                        key={colName}
                        className="liquid-control px-2 py-0.5 rounded-lg opacity-90 flex items-center gap-1 truncate max-w-full"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/20 flex-shrink-0"
                          style={{ backgroundColor: getColorHex(colName) }}
                        />
                        <span className="truncate">{colName}</span>
                      </span>
                    ))}
                    <span className="liquid-control px-2 py-0.5 rounded-lg opacity-70 truncate max-w-full">
                      {item.material}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Expanded Card / Edit Item Modal (Multi-Color Swatch Selector) */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="liquid-glass rounded-[2.5rem] max-w-md w-full p-6 space-y-5 shadow-2xl border border-white/20 dark:border-white/10 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-400" />
                  <h2 className="text-base font-bold tracking-tight">Edit Piece Details</h2>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className="p-1.5 liquid-control rounded-full hover:opacity-70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Large Image View */}
              <div className="aspect-square max-h-52 liquid-control rounded-2xl flex items-center justify-center p-3 overflow-hidden bg-black/5 dark:bg-white/[0.03]">
                <img
                  src={editingItem.image}
                  alt={editingItem.name}
                  className="w-full h-full object-contain filter drop-shadow-lg"
                />
              </div>

              {/* Edit Fields */}
              <div className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="block opacity-50 mb-1">Piece Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full liquid-control rounded-xl px-3.5 py-2.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block opacity-50 mb-1">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as Category)}
                      className="w-full liquid-control rounded-xl px-3.5 py-2.5 text-sm font-sans focus:outline-none cursor-pointer"
                    >
                      {CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                        <option key={c.value} value={c.value} className="text-black bg-white dark:bg-neutral-900 dark:text-white">
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block opacity-50 mb-1">Material</label>
                    <select
                      value={editMaterial}
                      onChange={(e) => setEditMaterial(e.target.value)}
                      className="w-full liquid-control rounded-xl px-3.5 py-2.5 text-sm font-sans focus:outline-none cursor-pointer"
                    >
                      {MATERIALS.filter((m) => m !== 'All').map((m) => (
                        <option key={m} value={m} className="text-black bg-white dark:bg-neutral-900 dark:text-white">
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Multi-Color Selection Swatches */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="opacity-50">Colors ({editColors.length} selected)</label>
                    <span className="text-[10px] opacity-40">Tap swatches to toggle</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                    {COLOR_PALETTE.map((col) => {
                      const isSelected = editColors.includes(col.name);
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => toggleColorSelection(col.name, editColors, setEditColors)}
                          className={`p-2 rounded-xl text-[10px] font-medium flex items-center gap-1.5 transition-all ${
                            isSelected
                              ? 'ring-2 ring-blue-500 bg-blue-500/10 font-semibold'
                              : 'liquid-control opacity-70 hover:opacity-100'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-md border border-white/20 shadow-xs flex-shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span className="truncate flex-1 text-left">{col.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-blue-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center gap-2.5 pt-2 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => removeItem(editingItem.id)}
                  className="p-3 text-red-400 hover:text-red-300 liquid-control rounded-xl transition-all"
                  title="Delete piece"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="py-3 px-4 text-xs font-semibold uppercase tracking-wider liquid-control rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedItem}
                  className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Item Upload Form Modal (Multi-Color Swatch Selector) */}
      <AnimatePresence>
        {pendingItem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="liquid-glass rounded-[2.5rem] max-w-md w-full p-6 space-y-5 shadow-2xl border border-white/20 dark:border-white/10 max-h-[90vh] overflow-y-auto"
            >
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
              <div className="aspect-square max-h-52 liquid-control rounded-2xl flex items-center justify-center p-3 overflow-hidden bg-black/5 dark:bg-white/[0.03]">
                <img
                  src={pendingItem.image}
                  alt="Preview"
                  className="w-full h-full object-contain filter drop-shadow-lg"
                />
              </div>

              <div className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="block opacity-60 mb-1">Piece Name</label>
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
                    <label className="block opacity-60 mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as Category)}
                      className="w-full liquid-control rounded-xl px-3.5 py-2.5 text-sm font-sans focus:outline-none cursor-pointer"
                    >
                      {CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                        <option key={c.value} value={c.value} className="text-black bg-white dark:bg-neutral-900 dark:text-white">
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block opacity-60 mb-1">Material</label>
                    <select
                      value={formMaterial}
                      onChange={(e) => setFormMaterial(e.target.value)}
                      className="w-full liquid-control rounded-xl px-3.5 py-2.5 text-sm font-sans focus:outline-none cursor-pointer"
                    >
                      {MATERIALS.filter((m) => m !== 'All').map((m) => (
                        <option key={m} value={m} className="text-black bg-white dark:bg-neutral-900 dark:text-white">
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Multi-Color Selection Swatches */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="opacity-60">Colors ({formColors.length} selected)</label>
                    <span className="text-[10px] opacity-40">Tap multiple colors if applicable</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                    {COLOR_PALETTE.map((col) => {
                      const isSelected = formColors.includes(col.name);
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => toggleColorSelection(col.name, formColors, setFormColors)}
                          className={`p-2 rounded-xl text-[10px] font-medium flex items-center gap-1.5 transition-all ${
                            isSelected
                              ? 'ring-2 ring-blue-500 bg-blue-500/10 font-semibold'
                              : 'liquid-control opacity-70 hover:opacity-100'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-md border border-white/20 shadow-xs flex-shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span className="truncate flex-1 text-left">{col.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-blue-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setPendingItem(null)}
                  className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider liquid-control rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewItem}
                  className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all"
                >
                  Save Piece
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
