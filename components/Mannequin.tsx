'use client';

import { forwardRef } from 'react';
import { Category, ClothingItem } from '@/types';

interface MannequinProps {
  outfit: Partial<Record<Category, ClothingItem>>;
  activeCategory: Category | null;
  onSelectSlot: (category: Category) => void;
}

const Mannequin = forwardRef<HTMLDivElement, MannequinProps>(
  ({ outfit, activeCategory, onSelectSlot }, ref) => {
    const slots: { category: Category; label: string; height: string }[] = [
      { category: 'headwear', label: 'Copricapo', height: 'h-24' },
      { category: 'top', label: 'Top / Giacca', height: 'h-48' },
      { category: 'bottom', label: 'Pantaloni / Gonna', height: 'h-52' },
      { category: 'shoes', label: 'Scarpe', height: 'h-28' },
    ];

    return (
      <div
        ref={ref}
        className="w-full max-w-sm mx-auto flex flex-col gap-3.5 p-6 liquid-glass rounded-[2.5rem]"
      >
        {slots.map(({ category, label, height }) => {
          const item = outfit[category];
          const isSelected = activeCategory === category;

          return (
            <div
              key={category}
              onClick={() => onSelectSlot(category)}
              className={`${height} relative rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-center p-3
                ${
                  isSelected
                    ? 'ring-2 ring-blue-500/70 bg-blue-500/10 border-transparent shadow-inner'
                    : 'liquid-control border-dashed'
                }`}
            >
              {item ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-contain filter drop-shadow-md transition-transform duration-200 active:scale-95"
                />
              ) : (
                <span className="text-[11px] font-mono tracking-wider uppercase opacity-40 select-none">
                  + {label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

Mannequin.displayName = 'Mannequin';

export default Mannequin;
