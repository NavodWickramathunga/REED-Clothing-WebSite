import React from 'react';
import { Product } from '../types';
import { formatCurrency, isLightColor } from '../utils';
import { BadgeCheck, Flame, ShoppingCart, Eye, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currency: 'USD' | 'LKR';
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  key?: React.Key | string | number;
  index?: number;
}

export default function ProductCard({
  product,
  currency,
  onQuickView,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist,
  index,
}: ProductCardProps) {
  const currentPrice = currency === 'USD' ? product.priceUSD : product.priceLKR;
  const isOutOfStock = product.status === 'Out of Stock';
  const isFewLeft = product.status === 'Few Left';

  const defaultSize = product.sizes[0] || 'L';

  const [zoomStyle, setZoomStyle] = React.useState<React.CSSProperties>({ transformOrigin: 'top center' });
  const [isCoverHovered, setIsCoverHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 105;
    const y = ((e.clientY - top) / height) * 105;
    setZoomStyle({ transformOrigin: `${x}% ${y}%` });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transformOrigin: 'top center' });
    setIsCoverHovered(false);
  };

  return (
    <div 
      className={`group relative flex flex-col bg-white dark:bg-neutral-900 border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in opacity-0 ${
        isFewLeft
          ? 'border-amber-400 ring-1 ring-amber-400/20'
          : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
      style={{ animationDelay: `${(index || 0) * 0.05}s` }}
    >
      {/* Badge container */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {isOutOfStock ? (
          <span className="px-3 py-1 bg-black text-white text-[9px] font-bold tracking-widest uppercase">
            Sold Out
          </span>
        ) : isFewLeft ? (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500 text-black text-[9px] font-black tracking-widest uppercase animate-pulse shadow-sm">
            <Flame className="w-3 h-3 text-black fill-black" />
            <span>Few Left</span>
          </span>
        ) : null}
        {product.isOnSale && (
          <span className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-[9px] font-black tracking-widest uppercase shadow-sm">
            Sale
          </span>
        )}
      </div>

      {/* Wishlist Heart button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleWishlist) {
              onToggleWishlist(product.id);
            }
          }}
          type="button"
          className="p-2 rounded-full bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md shadow-sm hover:bg-white dark:hover:bg-neutral-900 hover:scale-110 active:scale-95 transition-all text-neutral-400 hover:text-red-500 border border-neutral-100/50 dark:border-neutral-800 cursor-pointer"
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          id={`wishlist-toggle-${product.id}`}
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-550 dark:text-neutral-400'}`} />
        </button>
      </div>
 
      {/* Image Frame */}
      <div 
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsCoverHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={() => onQuickView(product)}
        className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden cursor-pointer"
      >
        {/* Primary Image */}
        <img
          src={product.colors[0]?.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-110 ${
            isOutOfStock ? 'opacity-40 grayscale' : 'opacity-100'
          } ${isCoverHovered && product.hoverImageUrl ? 'opacity-0' : 'opacity-100'}`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Secondary Hover Image */}
        {product.hoverImageUrl && (
          <img
            src={product.hoverImageUrl}
            alt={`${product.name} Alternate View`}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-110 ${
              isOutOfStock ? 'opacity-20 grayscale' : 'opacity-100'
            } ${isCoverHovered ? 'opacity-100' : 'opacity-0'}`}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex items-center justify-center space-x-3 z-10">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="px-4 py-2 bg-white text-black hover:bg-black hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-none transition-all duration-300 shadow-md cursor-pointer"
            title="Quick Details"
          >
            Quick View
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-grow bg-white dark:bg-neutral-900 transition-colors">
        <span className="text-[9px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono font-semibold mb-1">
          {product.category}
        </span>
        <h3 
          onClick={() => onQuickView(product)}
          className="text-xs font-semibold text-neutral-900 dark:text-white tracking-tight hover:text-neutral-500 dark:hover:text-amber-400 cursor-pointer transition-colors"
        >
          {product.name}
        </h3>
        
        {/* Colors swatch visual preview */}
        <div className="flex items-center space-x-1.5 mt-2 mb-4">
          {product.colors.map((color, idx) => {
            const isLight = isLightColor(color.value);
            return (
              <span
                key={idx}
                className={`w-2.5 h-2.5 rounded-full border inline-block ring-1 shadow-3xs ${
                  isLight
                    ? 'border-neutral-300 dark:border-neutral-600 ring-black/5 dark:ring-white/10'
                    : 'border-neutral-800/10 dark:border-neutral-700/60 ring-white/10 dark:ring-black/10'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            );
          })}
        </div>

        {/* Pricing & Button Split */}
        <div className="mt-auto pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <span className="text-xs font-bold tracking-tight text-black dark:text-neutral-100">
            {formatCurrency(currentPrice, currency)}
          </span>
          {isOutOfStock ? (
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-550 uppercase tracking-widest">
              Sold Out
            </span>
          ) : (
            <button
              onClick={() => onQuickView(product)}
              className="text-[10px] font-bold tracking-widest uppercase text-black dark:text-amber-450 hover:text-neutral-500 dark:hover:text-amber-350 transition-colors cursor-pointer flex items-center space-x-1"
              id={`product-card-view-${product.id}`}
            >
              <span>View Product</span>
              <span>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
