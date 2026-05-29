import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, CornerDownRight } from 'lucide-react';
import { Product } from '../types';

interface LatestStylesProps {
  products: Product[];
  onInspectProduct: (productId: string) => void;
  onViewAllClick: () => void;
}

interface StyleLook {
  id: string;
  productId: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  fitting: string;
}

const STYLE_LOOKS: StyleLook[] = [
  {
    id: 'look-01',
    productId: 'reed-black-crewneck',
    title: 'Onyx Heavy Drop Silhouette',
    subtitle: 'RAW SHAPE LOCK APPAREL',
    badge: 'ACTIVE STOCK',
    imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&auto=format&fit=crop&q=80',
    fitting: 'LOOSE FIT // 240 GSM TWILL'
  },
  {
    id: 'look-02',
    productId: 'reed-navy-crewneck',
    title: 'Admiral Sea Double Knit',
    subtitle: 'MILITARY ARCHIVE WEAVE',
    badge: 'NEW LAUNCHED',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=900&auto=format&fit=crop&q=80',
    fitting: 'BOXY SLOPED SHOULDER // XL'
  },
  {
    id: 'look-03',
    productId: 'reed-green-crewneck',
    title: 'Forest Jewel Dye Finished',
    subtitle: 'HIGH-DENSITY EMBROIDERY',
    badge: 'LIMITED COLOURED',
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&auto=format&fit=crop&q=80',
    fitting: 'PRE-SHRUNK RELAXED DRAPE'
  },
  {
    id: 'look-04',
    productId: 'reed-white-crewneck',
    title: 'Arctic Crisp Silicon Shield',
    subtitle: 'OPTICAL HIGH-OPAQUE KNIT',
    badge: 'BEST SELLER',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&auto=format&fit=crop&q=80',
    fitting: 'THICK REINFORCED RIB-COLLAR'
  }
];

export default function LatestStyles({ products, onInspectProduct, onViewAllClick }: LatestStylesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 380;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="latest-styles" className="py-14 sm:py-24 lg:py-32 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 border-b border-neutral-100 dark:border-neutral-850 transition-colors select-none overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER BLOCK - Solidly matching Screenshot 2 */}
        <div className="flex items-end justify-between mb-8 sm:mb-12 border-b border-neutral-100 dark:border-neutral-850 pb-6">
          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.3em] font-mono font-bold text-neutral-400 dark:text-neutral-500 block uppercase">Viva REƎD Drops</span>
            <h2 className="text-2xl sm:text-4xl font-display font-black tracking-tight text-black dark:text-white uppercase leading-none">
              SHOP THE LATEST STYLES
            </h2>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={onViewAllClick}
              className="group inline-flex items-center space-x-2 text-[10px] font-black tracking-[0.25em] text-neutral-900 dark:text-neutral-100 uppercase hover:text-neutral-500 dark:hover:text-amber-400 transition-colors"
            >
              <span>SHOP ALL</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Slide Arrows */}
            <div className="flex items-center space-x-1.5 hidden sm:flex">
              <button
                onClick={() => scroll('left')}
                className="p-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white transition-all cursor-pointer shadow-xs active:scale-95"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white transition-all cursor-pointer shadow-xs active:scale-95"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* LOOKS HORIZONTAL CYLINDER */}
        <div 
          ref={containerRef}
          className="flex space-x-6 overflow-x-auto scrollbar-none pb-4 snap-x snap-mandatory"
          style={{ scrollBarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {STYLE_LOOKS.map((look) => {
            // Find corresponding functional product if exists
            const hasProduct = products.some(p => p.id === look.productId);

            return (
              <div 
                key={look.id}
                className="min-w-[280px] sm:min-w-[340px] w-[340px] shrink-0 snap-start group relative flex flex-col bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden cursor-pointer"
                onClick={() => onInspectProduct(look.productId)}
              >
                {/* Visual Label Tag in corner of image */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 bg-black/85 text-[8.5px] font-mono tracking-widest text-white uppercase font-bold backdrop-blur-xs">
                    {look.badge}
                  </span>
                </div>

                {/* Main Lookbook Framing */}
                <div className="aspect-[3/4] w-full overflow-hidden bg-neutral-200 relative">
                  <img 
                    src={look.imageUrl} 
                    alt={look.title}
                    className="w-full h-full object-cover object-top filter grayscale-[5%] group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Backdrop Gradient subtle blur overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-60 group-hover:opacity-80 transition-all duration-300" />
                  
                  {/* Floating Action Hint */}
                  <div className="absolute bottom-4 right-4 bg-white/95 text-black px-4 py-2.5 text-[8.5px] font-black tracking-widest uppercase transition-all duration-300 transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 shadow-md">
                    Inspect Fit Drape
                  </div>
                </div>

                {/* Custom details line under image */}
                <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-b-xl flex flex-col flex-grow text-left">
                  <span className="text-[7.5px] font-mono tracking-[0.2em] text-neutral-400 dark:text-neutral-500 uppercase font-extrabold block">
                    {look.subtitle}
                  </span>
                  <h4 className="text-[12.5px] font-black text-neutral-900 dark:text-white tracking-tight uppercase mt-1 group-hover:text-black dark:group-hover:text-amber-400 transition-colors">
                    {look.title}
                  </h4>
                  
                  <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[8px] font-mono text-neutral-500 dark:text-neutral-400 font-bold uppercase">
                    <span>{look.fitting}</span>
                    <span className="text-black dark:text-amber-400 group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                      Explore <CornerDownRight className="w-3 h-3 text-neutral-400" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Drag hints on mobile screens */}
        <div className="text-center mt-3 sm:hidden">
          <span className="text-[8px] font-mono tracking-[0.15em] text-neutral-400 dark:text-neutral-500 uppercase">Swipe horizontally to view styles</span>
        </div>

      </div>
    </section>
  );
}
