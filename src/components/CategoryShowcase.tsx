import React from 'react';
import { ArrowRight, Layers, Sparkles, Star } from 'lucide-react';

interface CategoryShowcaseProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

interface CategoryCard {
  id: string;
  name: string;
  label: string;
  tagline: string;
  desc: string;
  imageUrl: string;
  specs: string;
}

const CATEGORY_CARDS: CategoryCard[] = [
  {
    id: 'signature',
    name: 'Signature',
    label: 'SIGNATURE DROP 01',
    tagline: 'PREMIUM HEAVY EMBROIDERY',
    desc: 'Our flagship collections engineered around double-backed embroidered geometry and boxy structures.',
    imageUrl: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&auto=format&fit=crop&q=80',
    specs: '240 GSM TWIN-NEEDLE'
  },
  {
    id: 'essentials',
    name: 'Essentials',
    label: 'ESSENTIALS ROTATION',
    tagline: 'DAILY SHAPE-LOCK CORES',
    desc: 'High density, pristine opaque cotton styles that retain their structured collar alignments forever.',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    specs: 'DOUBLE SHAPE RETENTION'
  },
  {
    id: 'limited',
    name: 'Limited',
    label: 'LIMITED EDITIONS',
    tagline: 'EXCLUSIVELY CRAFTED PALETTES',
    desc: 'Limited batch, plant-derived dye washed series highlighting unique heavyweight colorways.',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80',
    specs: 'ORGANIC SPECIAL WASH'
  }
];

export default function CategoryShowcase({ onSelectCategory, selectedCategory }: CategoryShowcaseProps) {

  const handleCategoryClick = (categoryName: string) => {
    onSelectCategory(categoryName);
    
    // Smooth scroll down to the catalog grid
    const targetEl = document.getElementById('collection');
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="categories-showcase" className="py-14 sm:py-24 lg:py-32 bg-neutral-50/50 border-b border-neutral-100 select-none transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* SECTION TITLE */}
        <div className="max-w-xl mx-auto space-y-3 mb-10 sm:mb-16">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-neutral-200/50 text-neutral-600 rounded-full text-[8.5px] font-mono tracking-widest uppercase font-extrabold">
            <Layers className="w-3.5 h-3.5 text-neutral-500" />
            <span>CATEGORIES FILTERS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-neutral-900 tracking-tight uppercase">
            SHOP BY CATEGORY
          </h2>
          <p className="text-xs text-neutral-500 font-light tracking-wide max-w-sm mx-auto">
            Choose a signature weight profile to dynamically view catalog listings sorted by their physical knit specifications.
          </p>
        </div>

        {/* THREE COLUMNS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {CATEGORY_CARDS.map((cat) => {
            const isCurrentlySelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className={`group relative aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] rounded-xl overflow-hidden cursor-pointer transition-all duration-350 ${
                  isCurrentlySelected 
                    ? 'ring-4 ring-black shadow-lg scale-[1.01]' 
                    : 'hover:shadow-xl hover:scale-[1.01]'
                }`}
              >
                {/* background image */}
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover object-top filter contrast-[1.02] brightness-75 group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />

                {/* dark overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10 transition-all duration-300" />

                {/* content alignment */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between text-left relative z-10 select-none">
                  
                  {/* Top line specs */}
                  <div className="flex justify-between items-center text-[7.5px] font-mono text-white/50 tracking-widest">
                    <span className="font-bold">{cat.label}</span>
                    <span className="px-2 py-0.5 bg-white/10 rounded-sm border border-white/5 uppercase">{cat.specs}</span>
                  </div>

                  {/* Bottom Text and Action button */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-[7.5px] font-mono text-amber-400 font-bold tracking-widest block uppercase">
                        {cat.tagline}
                      </span>
                      <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-none">
                        {cat.name}
                      </h3>
                    </div>

                    <p className="text-[10px] text-neutral-300 leading-relaxed font-light">
                      {cat.desc}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[8px] font-mono text-white font-black tracking-widest uppercase border-t border-white/10">
                      <span>EXPLORE CATEGORY</span>
                      <span className="p-1 rounded-full bg-white text-black group-hover:translate-x-1.5 transition-transform">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                </div>

                {/* Active category state corner dot indicator */}
                {isCurrentlySelected && (
                  <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded border border-white/20 flex items-center space-x-1.5 text-[8px] font-mono tracking-widest font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>ACTIVE</span>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
