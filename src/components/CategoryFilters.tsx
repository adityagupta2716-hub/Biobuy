import React from 'react';
import { 
  FlaskConical, 
  Dna, 
  TestTubes, 
  Microscope, 
  Box, 
  Gauge, 
  Sparkles, 
  Layers
} from 'lucide-react';
import { ProductCategory } from '../types';
import { useBioBuy } from '../context/BioBuyContext';

interface CategoryFiltersProps {
  onCategorySelect?: (cat: ProductCategory | 'All') => void;
}

interface CategoryMeta {
  id: ProductCategory | 'All';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const CATEGORIES: CategoryMeta[] = [
  {
    id: 'All',
    label: 'All Products',
    icon: Layers,
    description: 'Complete research catalog',
  },
  {
    id: 'Laboratory Equipment',
    label: 'Laboratory Equipment',
    icon: Microscope,
    description: 'Pipettes, mixers, centrifuges, stirrers',
  },
  {
    id: 'Reagents and Raw Materials',
    label: 'Reagents & Raw Materials',
    icon: FlaskConical,
    description: 'Buffers, agarose, salts, grade water',
  },
  {
    id: 'Assay Kits',
    label: 'Assay Kits',
    icon: Sparkles,
    description: 'Bradford, BCA, glucose, cell viability',
  },
  {
    id: 'Molecular Biology',
    label: 'Molecular Biology',
    icon: Dna,
    description: 'Extraction kits, PCR mix, DNA ladders',
  },
  {
    id: 'Cell Culture',
    label: 'Cell Culture',
    icon: TestTubes,
    description: 'Media, flasks, serological pipettes',
  },
  {
    id: 'Laboratory Consumables',
    label: 'Laboratory Consumables',
    icon: Box,
    description: 'Tips, microcentrifuge tubes, gloves',
  },
  {
    id: 'Analytical and Testing Equipment',
    label: 'Analytical & Testing',
    icon: Gauge,
    description: 'Spectrophotometers, pH & TDS meters',
  },
];

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({ onCategorySelect }) => {
  const { selectedCategory, setSelectedCategory, products } = useBioBuy();

  const handleSelect = (cat: ProductCategory | 'All') => {
    setSelectedCategory(cat);
    if (onCategorySelect) onCategorySelect(cat);
  };

  const getProductCount = (catId: ProductCategory | 'All') => {
    if (catId === 'All') return products.length;
    return products.filter(p => p.category === catId).length;
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          const count = getProductCount(cat.id);

          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  isSelected
                    ? 'bg-slate-800 text-slate-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
