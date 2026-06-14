import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';

interface LatestStylesProps {
  products: Product[];
  onQuickView?: (product: Product) => void;
}

// Each badge type has its own dedicated color tied to its MEANING
// — so the color itself communicates urgency or value to the customer
function getProductBadge(product: Product): { label: string; color: string } | null {
  const stock = product.stock ?? 0;
  const isNewlyLaunched = product.createdAt
    ? (Date.now() - new Date(product.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000
    : false;
  const isLimitedColoured =
    (product.colors?.length ?? 0) >= 3 || product.category === 'Limited';

  if (product.status === 'Out of Stock') return null;

  // 🔴 RED — Urgent scarcity: customer must act fast
  if (product.status === 'Few Left' || stock < 5)
    return { label: 'FEW LEFT', color: 'bg-red-600 text-white' };

  // 🟠 ORANGE — Exciting deal: save money now
  if (product.isOnSale)
    return { label: 'SALE', color: 'bg-orange-500 text-white' };

  // 🟡 GOLD — Social proof: trusted & loved by customers
  if (product.featured)
    return { label: 'BEST SELLER', color: 'bg-amber-500 text-black' };

  // 🔵 BLUE — Fresh & modern: just arrived
  if (isNewlyLaunched)
    return { label: 'NEW LAUNCHED', color: 'bg-blue-600 text-white' };

  // 🟣 VIOLET — Exclusive & rare: special edition
  if (isLimitedColoured)
    return { label: 'LIMITED COLOURED', color: 'bg-violet-600 text-white' };

  // 🟢 GREEN — Reassurance: plenty available, safe to buy
  if (product.status === 'In Stock' && stock >= 5)
    return { label: 'ACTIVE STOCK', color: 'bg-emerald-600 text-white' };

  return null;
}

export default function LatestStyles({ products, onQuickView }: LatestStylesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get 8 featured or most recent products to display in the slider
  const featuredProducts = [...products]
    .sort((a, b) => {
      const featA = a.featured ? 1 : 0;
      const featB = b.featured ? 1 : 0;
      if (featA !== featB) {
        return featB - featA; // featured first
      }
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // newest first
    })
    .slice(0, 8);
  const itemsPerSlide = isMobile ? 1 : 4;
  const totalSlides = Math.ceil(featuredProducts.length / itemsPerSlide);

  // Ensure currentSlide is within bounds if featuredProducts length changes dynamically
  useEffect(() => {
    if (currentSlide >= totalSlides && totalSlides > 0) {
      setCurrentSlide(totalSlides - 1);
    }
  }, [totalSlides, currentSlide]);

  if (featuredProducts.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  return (
    <section className="py-8 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-2 text-black">
            Shop the Latest Styles
          </h2>
          <p className="text-sm lg:text-base text-neutral-600">
            Discover our newest and most exclusive collections
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div 
            className="overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIdx) => {
                const slideProducts = featuredProducts.slice(
                  slideIdx * itemsPerSlide,
                  (slideIdx + 1) * itemsPerSlide
                );
                return (
                  <div key={slideIdx} className="w-full flex-shrink-0">
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-4'} gap-4 lg:gap-6`}>
                      {slideProducts.map((product, idx) => (
                      <div
                        key={product.id}
                        className="group cursor-pointer bg-neutral-50 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105"
                        onClick={() => onQuickView?.(product)}
                      >
                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden bg-neutral-200">
                          <img
                            src={product.colors?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />

                          {/* Badge — label from product data, color from card position */}
                          {(() => {
                            const badge = getProductBadge(product);
                            return badge ? (
                              <div className={`absolute top-3 right-3 ${badge.color} px-3 py-1 rounded text-xs font-bold tracking-widest uppercase shadow-md`}>
                                {badge.label}
                              </div>
                            ) : null;
                          })()}
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <h3 className="font-semibold text-sm lg:text-base mb-2 truncate text-black">
                            {product.name}
                          </h3>

                          {product.category && (
                            <p className="text-xs mb-2 text-neutral-600">
                              {product.category}
                            </p>
                          )}

                          {/* Price */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-bold text-lg text-black">
                              Rs. {product.priceLKR.toLocaleString()}
                            </span>
                          </div>

                          {/* Stock Info */}
                          {product.stock !== undefined && (
                            <p className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 lg:left-0 top-1/2 -translate-y-1/2 lg:-translate-x-6 z-10 p-2 rounded-full transition-colors bg-white hover:bg-neutral-100 text-black border border-neutral-300"
                aria-label="Previous slide"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 lg:right-0 top-1/2 -translate-y-1/2 lg:translate-x-6 z-10 p-2 rounded-full transition-colors bg-white hover:bg-neutral-100 text-black border border-neutral-300"
                aria-label="Next slide"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Slide Indicators */}
        {totalSlides > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'bg-black w-6'
                    : 'bg-neutral-300 w-2'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
