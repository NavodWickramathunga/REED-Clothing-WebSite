import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductReview } from '../types';
import { formatCurrency, isLightColor } from '../utils';
import { X, ShieldCheck, Truck, RotateCcw, Plus, Minus, ShoppingBag, Ruler, ChevronLeft, ChevronRight, Star, Calendar, Grid, Image, Maximize2, ZoomIn } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  currency: 'USD' | 'LKR';
  onAddToCart: (product: Product, size: string, quantity: number, color?: string) => void;
  allProducts?: Product[];
  onSwitchProduct?: (product: Product) => void;
  whatsappNumber?: string;
  onAddReview?: (productId: string, review: ProductReview) => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
  currency,
  onAddToCart,
  allProducts,
  onSwitchProduct,
  whatsappNumber = '+94710761266',
  onAddReview,
}: ProductDetailsModalProps) {
  if (!product) return null;

  const rawImages = [
    ...(product.colors?.map((c) => c.imageUrl) || []),
    product.hoverImageUrl,
    ...(product.images || []),
  ].filter(Boolean) as string[];
  const galleryImages = rawImages.length > 0
    ? Array.from(new Set(rawImages))
    : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'];

  // Selected color variant state
  const [selectedColorState, setSelectedColorState] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0].name : 'Original'
  );

  // Set the default selected size to the first available size, or S if none is in stock
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes.length > 0 ? product.sizes[0] : 'S'
  );

  useEffect(() => {
    if (product) {
      setSelectedColorState(product.colors && product.colors.length > 0 ? product.colors[0].name : 'Original');
      setActiveImageIndex(0);
    }
  }, [product]);
  const [quantity, setQuantity] = useState<number>(1);
  const [showSizeChart, setShowSizeChart] = useState<boolean>(false);
  const [chartUnit, setChartUnit] = useState<'in' | 'cm'>('in');

  // Lightbox & image indices
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  // Custom display layout: 'carousel' or 'grid'
  const [galleryMode, setGalleryMode] = useState<'carousel' | 'grid'>('carousel');

  // Swipe and motion helpers
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [lightboxTouchStartX, setLightboxTouchStartX] = useState<number | null>(null);

  const handleNextImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleLightboxNext = () => {
    if (galleryImages.length <= 1) return;
    setLightboxIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handleLightboxPrev = () => {
    if (galleryImages.length <= 1) return;
    setLightboxIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleColorClick = (colorName: string, imageUrl: string) => {
    setSelectedColorState(colorName);
    const idx = galleryImages.indexOf(imageUrl);
    if (idx !== -1) {
      setActiveImageIndex(idx);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      handleNextImage();
    } else if (diff < -50) {
      handlePrevImage();
    }
    setTouchStartX(null);
  };

  const handleLightboxTouchStart = (e: React.TouchEvent) => {
    setLightboxTouchStartX(e.touches[0].clientX);
  };

  const handleLightboxTouchEnd = (e: React.TouchEvent) => {
    if (lightboxTouchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = lightboxTouchStartX - touchEndX;
    if (diff > 50) {
      handleLightboxNext();
    } else if (diff < -50) {
      handleLightboxPrev();
    }
    setLightboxTouchStartX(null);
  };

  // Keyboard Navigation Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input is active
      const activeEl = document.activeElement?.tagName;
      if (activeEl === 'INPUT' || activeEl === 'TEXTAREA') return;

      if (isLightboxOpen) {
        if (e.key === 'ArrowRight') {
          handleLightboxNext();
        } else if (e.key === 'ArrowLeft') {
          handleLightboxPrev();
        } else if (e.key === 'Escape') {
          setIsLightboxOpen(false);
        }
      } else {
        if (e.key === 'ArrowRight') {
          handleNextImage();
        } else if (e.key === 'ArrowLeft') {
          handlePrevImage();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, activeImageIndex, lightboxIndex, galleryImages.length]);


  const [interestEmail, setInterestEmail] = useState('');
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);
  const [notifyStatus, setNotifyStatus] = useState('');

  const handleNotifyMeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interestEmail.trim()) return;
    setIsSubmittingNotify(true);
    setNotifyStatus('');
    try {
      const id = 'INT-' + Math.floor(100000 + Math.random() * 900000);
      await setDoc(doc(db, 'interested', id), {
        id,
        email: interestEmail.trim(),
        productId: product.id,
        productName: product.name,
        size: selectedSize,
        timestamp: new Date().toISOString()
      });
      setNotifyStatus('Successfully registered! We will notify you dynamic restocks.');
      setInterestEmail('');
    } catch (err) {
      console.error(err);
      setNotifyStatus('Something went wrong. Please try again.');
    } finally {
      setIsSubmittingNotify(false);
    }
  };

  // Base raw measurements in inches for fully dynamic imperial/metric computing
  const baseSizeData = [
    { size: 'S', chest: 23.5, length: 26.5, sleeve: 22.0 },
    { size: 'M', chest: 24.5, length: 27.5, sleeve: 22.5 },
    { size: 'L', chest: 25.5, length: 28.5, sleeve: 23.0 },
    { size: 'XL', chest: 26.5, length: 29.5, sleeve: 23.5 },
    { size: 'XXL', chest: 27.5, length: 30.5, sleeve: 24.0 },
  ];

  // Automatic conversion helper function to calculate metric & imperial dynamically based on selection
  const formatMeasurement = (inches: number, unit: 'in' | 'cm'): string => {
    if (unit === 'in') {
      return `${inches.toFixed(1)}"`;
    }
    // Convert Inches to Centimeters (1 in = 2.54 cm), then round to nearest integer matching spec standards
    const cmValue = inches * 2.54;
    return `${Math.round(cmValue)} cm`;
  };

  const currentPrice = currency === 'USD' ? product.priceUSD : product.priceLKR;
  const isOutOfStock = product.status === 'Out of Stock';

  const suggestedProducts = (allProducts || [])
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const handleQtyChange = (type: 'inc' | 'dec') => {
    if (type === 'inc') {
      setQuantity((prev) => Math.min(prev + 1, 10));
    } else {
      setQuantity((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleAdd = () => {
    if (!selectedSize) {
      alert('Please choose a size first.');
      return;
    }
    onAddToCart(product, selectedSize, quantity, selectedColorState);
    onClose();
  };

  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ transformOrigin: 'top center' });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%` });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transformOrigin: 'top center' });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div 
        className="relative bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 w-full max-w-4xl rounded-xl shadow-2xl overflow-y-auto md:overflow-hidden my-8 max-h-[92vh] flex flex-col md:flex-row border border-neutral-100 dark:border-neutral-850 animate-slide-up" 
        id="quickview-modal-container"
      >
        {/* Close Button Pin */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-amber-400 hover:scale-105 transition-all"
          id="close-details-modal"
          title="Close details dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Aspect: Premium Product Photo Visual Frame */}
        <div className="w-full md:w-1/2 p-4 bg-neutral-50 dark:bg-neutral-900/40 flex flex-col items-center border-r border-neutral-100 dark:border-neutral-850/60 font-sans md:overflow-y-auto md:max-h-[92vh] scrollbar-thin">
          
          {/* Gallery View Header Controls */}
          {galleryImages.length > 1 && (
            <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-neutral-200/50 dark:border-neutral-800/40 text-[10px] uppercase tracking-wider font-mono font-bold text-neutral-400">
              <span className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 font-bold">
                <ZoomIn className="w-3.5 h-3.5 text-amber-500" />
                Hover to magnify
              </span>
              <div className="flex bg-neutral-150 dark:bg-neutral-900 p-0.5 rounded shadow-sm border border-neutral-200/40 dark:border-neutral-800/50">
                <button
                  type="button"
                  onClick={() => setGalleryMode('carousel')}
                  className={`px-2.5 py-1 rounded-xs flex items-center gap-1 transition-all cursor-pointer ${
                    galleryMode === 'carousel'
                      ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-amber-400 shadow-xs'
                      : 'hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                  title="Carousel layout with swiping"
                >
                  <Image className="w-3 h-3" />
                  <span>Carousel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryMode('grid')}
                  className={`px-2.5 py-1 rounded-xs flex items-center gap-1 transition-all cursor-pointer ${
                    galleryMode === 'grid'
                      ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-amber-400 shadow-xs'
                      : 'hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                  title="All-angles high resolution grid"
                >
                  <Grid className="w-3 h-3" />
                  <span>Grid</span>
                </button>
              </div>
            </div>
          )}

          {galleryMode === 'carousel' ? (
            <div className="w-full flex flex-col items-center">
              {/* Carousel Viewport Container */}
              <div 
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="group relative w-full aspect-[4/5] max-h-[440px] overflow-hidden rounded-lg shadow-sm bg-black select-none"
              >
                {/* Image display with elegant hover magnifier & framer motion keyframe transitions */}
                <div
                  onClick={() => {
                    setLightboxIndex(activeImageIndex);
                    setIsLightboxOpen(true);
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="w-full h-full cursor-zoom-in overflow-hidden relative"
                >
                  <img
                    key={activeImageIndex}
                    src={galleryImages[activeImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover object-top transition-transform duration-200 ease-out md:group-hover:scale-[2.2] animate-fade-in"
                    style={zoomStyle}
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Left Arrow (Desktop Hover / Keyboard helpful) */}
                {galleryImages.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 px-2.5 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xs border border-neutral-250/60 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-amber-400 hover:scale-105 active:scale-95 transition-all shadow-md opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100 pointer-events-auto flex items-center justify-center cursor-pointer z-10"
                    title="Previous Slide"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Right Arrow */}
                {galleryImages.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 px-2.5 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xs border border-neutral-250/60 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-amber-400 hover:scale-105 active:scale-95 transition-all shadow-md opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100 pointer-events-auto flex items-center justify-center cursor-pointer z-10"
                    title="Next Slide"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Slide Counter Indicator Badge */}
                {galleryImages.length > 1 && (
                  <div className="absolute top-3 left-3 bg-black/65 backdrop-blur-xs text-white text-[9px] font-mono font-bold px-2 py-1 rounded border border-white/10 select-none">
                    {activeImageIndex + 1} / {galleryImages.length}
                  </div>
                )}

                {/* Elegant expand lens button */}
                <div 
                  onClick={() => {
                    setLightboxIndex(activeImageIndex);
                    setIsLightboxOpen(true);
                  }}
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white p-2 rounded-full cursor-pointer transition-all border border-white/10 flex items-center justify-center pointer-events-auto backdrop-blur-xs shadow" 
                  title="Click to expand fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-white" />
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex items-end justify-between pointer-events-none">
                  <span className="text-[9px] font-mono font-extrabold tracking-widest text-[#000] bg-white/95 py-1 px-2.5 rounded shadow">
                    REƎD STITCH
                  </span>
                  <span className="text-[9px] font-sans font-semibold text-white tracking-wide bg-black/65 px-2 py-1 rounded">
                    Swipe or click arrows ⇆
                  </span>
                </div>
              </div>

              {/* Premium Thumbnails Row */}
              {galleryImages.length > 1 && (
                <div className="flex justify-center gap-2 mt-4 w-full px-2" id="thumbnail-gallery-row">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={`${imgUrl}-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-12 aspect-[4/5] rounded border overflow-hidden transition-all duration-300 relative cursor-pointer ${
                        activeImageIndex === idx 
                          ? 'border-black dark:border-amber-400 ring-1 ring-black dark:ring-amber-400 scale-105 shadow-sm' 
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 scale-100 opacity-70 hover:opacity-100'
                      }`}
                      id={`modal-thumb-btn-${idx}`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail view ${idx + 1}`}
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      {idx === galleryImages.length - 1 && product.hoverImageUrl === imgUrl && (
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[5.5px] font-mono tracking-widest uppercase font-bold text-center py-0.5 select-none scale-90 rounded-sm">
                          ALT
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Elegant high-resolution thumbnail grid showreel */
            <div className="w-full space-y-4 animate-fade-in animate-duration-300">
              <div className="text-[10px] text-neutral-500 dark:text-neutral-450 font-mono text-center flex items-center justify-center gap-1">
                <span>✦ Click any detail perspective to expand full view ✦</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {galleryImages.map((imgUrl, idx) => (
                  <div 
                    key={`grid-showcase-${imgUrl}-${idx}`}
                    onClick={() => {
                      setLightboxIndex(idx);
                      setIsLightboxOpen(true);
                    }}
                    className="group relative cursor-zoom-in overflow-hidden rounded-lg aspect-[4/5] bg-black border border-neutral-100 dark:border-neutral-850 shadow-xs hover:border-neutral-350 dark:hover:border-amber-400/60 transition-all duration-350"
                  >
                    <img
                      src={imgUrl}
                      alt={`Full Detail View ${idx + 1}`}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Corner Angle Badge */}
                    <div className="absolute top-3 left-3 bg-black/65 backdrop-blur-xs text-white text-[9px] font-mono font-bold px-2 py-1 rounded border border-white/10 flex items-center gap-1.5 shadow select-none">
                      <span>ANGLE {idx + 1}</span>
                      {idx === galleryImages.length - 1 && product.hoverImageUrl === imgUrl && (
                        <span className="text-[7px] text-amber-300 font-extrabold tracking-widest uppercase">
                          (ALT VIEW)
                        </span>
                      )}
                    </div>
                    
                    {/* Hover expand glass lens symbol */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <div className="p-3 rounded-full bg-white/90 dark:bg-neutral-900/95 backdrop-blur-xs text-neutral-900 dark:text-amber-400 shadow">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Aspect: Fully customizable configurations & specs */}
        <div className="w-full md:w-1/2 p-6 md:p-8 md:overflow-y-auto flex flex-col md:max-h-[92vh] bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
          <div>
            <span className="inline-block px-1.5 py-0.5 text-[8px] font-mono tracking-widest uppercase text-neutral-450 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-900 rounded-none mb-3">
              {product.category}
            </span>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight uppercase">
              {product.name}
            </h2>
            <div className="flex items-center space-x-4 mt-2 mb-4">
              <span className="text-sm font-bold text-black dark:text-white font-mono">
                {formatCurrency(currentPrice, currency)}
              </span>
              <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-none border ${
                isOutOfStock 
                  ? 'bg-neutral-105 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 border-neutral-100 dark:border-neutral-900' 
                  : product.status === 'Few Left' 
                    ? 'bg-amber-500 text-black border-amber-500' 
                    : 'bg-black dark:bg-amber-400 text-white dark:text-black border-black dark:border-amber-400'
              }`}>
                {product.status}
              </span>
            </div>
          </div>

          <div className="space-y-4 border-t border-neutral-100 dark:border-neutral-850 pt-4 flex-grow">
            {/* Description */}
            <div className="space-y-2">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {product.description}
              </p>
              <div className="flex items-center justify-between text-[10px] text-neutral-600 dark:text-neutral-450 font-mono">
                <span>Material: {product.material}</span>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Check out this ${product.name} on REƎD apparel: ${window.location.origin}/?product=${product.id}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1 px-2.5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/15 dark:border-emerald-500/25 rounded-md font-mono text-[9px] font-bold"
                  title="Share this product on WhatsApp"
                  id="share-whatsapp-btn"
                >
                  <svg className="w-3.5 h-3.5 fill-emerald-600 inline-block shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.449 5.49 0 9.951-4.461 9.953-9.952.002-2.661-1.034-5.161-2.91-7.04C16.438 1.732 13.935.694 11.93.694 6.44.694 1.979 5.155 1.977 10.648c-.001 1.57.42 2.99 1.454 4.3l-.382 1.393-.974 3.555 3.654-.958.92-.241zm.004-9.057c-.149-.074-.881-.435-1.017-.485-.136-.05-.235-.074-.335.074-.099.149-.383.483-.47.583-.087.099-.173.111-.322.037a4.062 4.062 0 01-1.189-.733c-.416-.371-.697-.83-.779-.968-.081-.137-.008-.211.066-.285.067-.066.149-.174.223-.261.074-.087.099-.149.148-.248a.262.262 0 00-.012-.248c-.038-.074-.335-.806-.459-1.104-.12-.29-.24-.251-.33-.256l-.28-.005c-.097 0-.255.037-.389.183-.134.146-.51.498-.51 1.213s.52 1.408.593 1.507c.074.099 1.025 1.565 2.483 2.193.347.15.617.24.828.307.35.111.667.096.918.058.28-.042.881-.36 1.005-.707.124-.347.124-.645.087-.707-.037-.062-.136-.099-.285-.173z"/>
                  </svg>
                  <span>WhatsApp Share</span>
                </a>
              </div>
            </div>

            {/* Visual Swatch Preview Option */}
            <div className="space-y-3 pb-1" id="swatch-preview-section">
              {/* Sibling Products (if any) */}
              {allProducts && allProducts.filter(p => p.name.split(' - ')[0] === product.name.split(' - ')[0]).length > 1 && (
                <div className="space-y-1.5">
                  <h4 className="text-[9px] uppercase tracking-widest text-neutral-400 dark:text-neutral-300 font-mono font-bold">
                    Select Base Color / Style:
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {allProducts.filter(p => p.name.split(' - ')[0] === product.name.split(' - ')[0]).map((variant) => {
                      const colorObj = variant.colors?.[0];
                      if (!colorObj) return null;
                      const isSelected = product.id === variant.id;
                      const isLight = isLightColor(colorObj.value);
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => {
                            if (onSwitchProduct) {
                              onSwitchProduct(variant);
                            }
                          }}
                          className={`group relative w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-3xs ${
                            isLight
                              ? 'border-neutral-300 dark:border-neutral-600 ring-1 ring-black/5 dark:ring-white/10'
                              : 'border-neutral-800/10 dark:border-neutral-700/80 ring-1 ring-white/10 dark:ring-black/10'
                          } ${
                            isSelected
                              ? 'border-neutral-900 dark:border-amber-400 ring-2 ring-neutral-900/20 dark:ring-amber-400/40 scale-110 z-10'
                              : 'hover:scale-105 hover:border-neutral-400 dark:hover:border-neutral-500'
                          }`}
                          style={{ backgroundColor: colorObj.value }}
                          title={colorObj.name}
                          id={`color-swatch-variant-${variant.id}`}
                        >
                          {isSelected && (
                            <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-black' : 'bg-white'} shadow-xs`} />
                          )}
                          <span className="absolute bottom-full mb-1.5 hidden group-hover:block bg-neutral-900 text-white text-[9.5px] font-mono px-2 py-0.5 rounded whitespace-nowrap z-20 pointer-events-none">
                            {colorObj.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Internal Colors Range */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <h4 className="text-[9px] uppercase tracking-widest text-neutral-400 dark:text-neutral-300 font-mono font-bold">
                    Select Color Tone:
                    <span className="text-neutral-900 dark:text-amber-400 font-sans font-bold normal-case text-xs ml-1.5 hover:underline decoration-amber-400/40">
                      {selectedColorState}
                    </span>
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((color) => {
                      const isSelected = selectedColorState === color.name;
                      const isLight = isLightColor(color.value);
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => handleColorClick(color.name, color.imageUrl)}
                          className={`group relative w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-3xs ${
                            isLight
                              ? 'border-neutral-300 dark:border-neutral-600 ring-1 ring-black/5 dark:ring-white/10'
                              : 'border-neutral-800/10 dark:border-neutral-700/80 ring-1 ring-white/10 dark:ring-black/10'
                          } ${
                            isSelected
                              ? 'border-neutral-900 dark:border-amber-400 ring-2 ring-neutral-900/20 dark:ring-amber-400/40 scale-110 z-10'
                              : 'hover:scale-105 hover:border-neutral-400 dark:hover:border-neutral-500'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                          id={`color-swatch-internal-${color.name.replace(/\s+/g, '-')}`}
                        >
                          {isSelected && (
                            <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-black' : 'bg-white'} shadow-xs`} />
                          )}
                          <span className="absolute bottom-full mb-1.5 hidden group-hover:block bg-neutral-900 text-white text-[9.5px] font-mono px-2 py-0.5 rounded whitespace-nowrap z-20 pointer-events-none">
                            {color.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sizes picker structure */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[9px] uppercase tracking-widest text-neutral-400 dark:text-neutral-300 font-mono font-bold">Select Size:</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] text-neutral-450 dark:text-neutral-300 font-mono bg-neutral-100 dark:bg-neutral-900 px-1 py-0.5 rounded">Heavy Boxy Fit</span>
                  <button 
                    type="button"
                    onClick={() => setShowSizeChart(true)}
                    className="text-[9px] text-black font-extrabold hover:underline font-mono inline-flex items-center cursor-pointer bg-amber-400 px-2 py-0.5 rounded-sm"
                    id="open-size-chart"
                  >
                    <Ruler className="w-2.5 h-2.5 mr-0.5 text-black" />
                    <span>View Size Chart</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                  const isAvailable = product.sizes.includes(size);
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] h-10 text-xs font-bold tracking-wider transition-all border rounded-none flex items-center justify-center cursor-pointer relative ${
                        isSelected
                          ? 'bg-black dark:bg-amber-400 text-white dark:text-neutral-950 border-black dark:border-amber-400 z-10'
                          : isAvailable
                            ? 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-250 dark:border-neutral-800 hover:border-black dark:hover:border-amber-400 hover:text-black dark:hover:text-amber-400'
                            : 'bg-neutral-50 dark:bg-neutral-950 text-neutral-400 dark:text-neutral-600 border-neutral-150 dark:border-neutral-850 hover:border-black/50 hover:text-neutral-700'
                      }`}
                      id={`size-select-btn-${size}`}
                    >
                      <span>{size}</span>
                      {!isAvailable && (
                        <span className="absolute text-[6.5px] bg-red-500/90 text-white px-1 leading-none py-0.5 rounded-sm -bottom-1 right-0 font-mono scale-95 font-bold uppercase select-none tracking-widest">
                          OUT
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selection of Quantity / Notify Me email capture block */}
            {!product.sizes.includes(selectedSize) ? (
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-850 space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <h4 className="text-[10px] uppercase tracking-widest text-neutral-750 dark:text-neutral-300 font-mono font-bold">
                    Size {selectedSize} is Out of Stock
                  </h4>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal font-sans">
                  Submit your email below and we will notify you instantly when this restock option is checked in.
                </p>
                
                <form onSubmit={handleNotifyMeSubmit} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="E.g. customer@domain.com"
                    value={interestEmail}
                    onChange={(e) => {
                      setInterestEmail(e.target.value);
                      setNotifyStatus('');
                    }}
                    className="flex-grow px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded text-xs focus:ring-1 focus:ring-black dark:focus:ring-amber-400 focus:border-black dark:focus:border-amber-400 outline-none font-sans bg-neutral-50 dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingNotify}
                    className="px-5 py-2.5 bg-neutral-900 dark:bg-amber-400 text-white dark:text-black hover:bg-black dark:hover:bg-amber-505 rounded-none text-[10px] font-bold tracking-widest uppercase transition-all whitespace-nowrap cursor-pointer"
                  >
                    {isSubmittingNotify ? 'Submitting...' : 'Notify Me'}
                  </button>
                </form>
                {notifyStatus && (
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">{notifyStatus}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-850">
                {/* ⚠️ Sleek selected size low inventory warning alert indicator */}
                {product.status === 'Few Left' && (
                  <div className="flex items-start space-x-2.5 p-3 bg-amber-500/10 dark:bg-amber-400/5 border border-amber-500/20 dark:border-amber-400/15 rounded-md animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400 mt-1" />
                    <div className="text-left select-none">
                      <p className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Low Stock Alert
                      </p>
                      <p className="text-[10px] text-neutral-650 dark:text-neutral-350 font-sans mt-0.5 leading-normal">
                        Size <strong>{selectedSize}</strong> is running extremely low in our Colombo Hub inventory. Reserve yours now!
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col gap-3 py-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-mono font-bold mb-1">Quantity:</h4>
                      <div className="flex items-center border border-neutral-250 dark:border-neutral-800 rounded-none overflow-hidden h-9 bg-neutral-50 dark:bg-neutral-900">
                        <button
                          type="button"
                          onClick={() => handleQtyChange('dec')}
                          className="px-2.5 h-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                          id="qty-dec-btn"
                        >
                          <Minus className="w-3" />
                        </button>
                        <span className="px-4 text-xs font-bold font-mono text-black dark:text-white">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange('inc')}
                          className="px-2.5 h-full hover:bg-neutral-105 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                          id="qty-inc-btn"
                        >
                          <Plus className="w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Confirm add Button */}
                    <div className="flex-grow pl-6 max-w-xs self-end">
                      <button
                        onClick={handleAdd}
                        className="w-full h-11 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-none text-[10px] font-bold tracking-widest uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer"
                        id="add-to-cart-confirm"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Bag</span>
                      </button>
                    </div>
                  </div>

                  {/* 💬 Quick Inquiry Custom WhatsApp Button */}
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hi REƎD, I have a quick inquiry about the "${product.name}" (Size: ${selectedSize}). Could you assist me with custom requests or fit questions? Product Link: ${window.location.origin}/?product=${product.id}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-10 border border-neutral-250 dark:border-neutral-800 hover:border-black dark:hover:border-amber-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-amber-400 text-[10px] font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer rounded-none"
                    id="quick-inquiry-whatsapp-btn"
                  >
                    <svg className="w-4 h-4 text-emerald-555 fill-emerald-505 shrink-0" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.449 5.49 0 9.951-4.461 9.953-9.952.002-2.661-1.034-5.161-2.91-7.04C16.438 1.732 13.935.694 11.93.694 6.44.694 1.979 5.155 1.977 10.648c-.001 1.57.42 2.99 1.454 4.3l-.382 1.393-.974 3.555 3.654-.958.92-.241zm.004-9.057c-.149-.074-.881-.435-1.017-.485-.136-.05-.235-.074-.335.074-.099.149-.383.483-.47.583-.087.099-.173.111-.322.037a4.062 4.062 0 01-1.189-.733c-.416-.371-.697-.83-.779-.968-.081-.137-.008-.211.066-.285.067-.066.149-.174.223-.261.074-.087.099-.149.148-.248a.262.262 0 00-.012-.248c-.038-.074-.335-.806-.459-1.104-.12-.29-.24-.251-.33-.256l-.28-.005c-.097 0-.255.037-.389.183-.134.146-.51.498-.51 1.213s.52 1.408.593 1.507c.074.099 1.025 1.565 2.483 2.193.347.15.617.24.828.307.35.111.667.096.918.058.28-.042.881-.36 1.005-.707.124-.347.124-.645.087-.707-.037-.062-.136-.099-.285-.173z" />
                    </svg>
                    <span>Quick Inquiry // WhatsApp fit help</span>
                  </a>
                </div>
              </div>
            )}

            {/* 🛡️ Guarantees Grid */}
            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-850">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-4 text-left">
                <div className="flex flex-col gap-3">
                  <Truck className="w-6 h-6 text-neutral-900 dark:text-neutral-100" strokeWidth={1.5} />
                  <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-snug">
                    Standard shipping (Estimated 3-5 days)
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <ShieldCheck className="w-6 h-6 text-neutral-900 dark:text-neutral-100" strokeWidth={1.5} />
                  <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-snug">
                    Payment is 100% secure
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <RotateCcw className="w-6 h-6 text-neutral-900 dark:text-neutral-100" strokeWidth={1.5} />
                  <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-snug">
                    30 days to change your mind!
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <svg className="w-6 h-6 text-neutral-900 dark:text-neutral-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22v-5" />
                    <path d="M12 17a4 4 0 0 1-3.5-6.1A4.5 4.5 0 1 1 12 2a4.5 4.5 0 1 1 3.5 8.9A4 4 0 0 1 12 17z" />
                  </svg>
                  <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-snug">
                    Made in Sri Lanka
                  </p>
                </div>
              </div>
            </div>

            {/* Complete the Look / You May Also Like Section */}
            {suggestedProducts.length > 0 && (
              <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-850 space-y-4 font-sans no-print text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono font-bold">
                    Complete The Look
                  </h4>
                  <span className="text-[8px] uppercase tracking-wider text-amber-500 font-mono font-bold">
                    Frequently Styled Together
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {suggestedProducts.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => onSwitchProduct?.(p)}
                      className="group/item cursor-pointer space-y-1.5 text-left border border-neutral-100 dark:border-neutral-850 p-1.5 hover:border-black dark:hover:border-amber-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-all rounded"
                    >
                      <div className="aspect-[4/5] bg-neutral-100 dark:bg-neutral-900 overflow-hidden relative">
                        <img 
                          src={p.colors[0]?.imageUrl} 
                          alt={p.name}
                          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover/item:scale-105"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-[9px] font-extrabold text-neutral-800 dark:text-neutral-200 uppercase tracking-tight line-clamp-1 group-hover/item:text-black dark:group-hover/item:text-amber-400">
                          {p.name}
                        </h5>
                        <p className="text-[9px] font-mono text-neutral-500 dark:text-neutral-450 font-bold">
                          {formatCurrency(currency === 'USD' ? p.priceUSD : p.priceLKR, currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sizing Chart Overlay Panel */}
        {showSizeChart && (
          <div className="absolute inset-0 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md z-45 flex flex-col p-6 sm:p-8 animate-fade-in animate-duration-300">
            <div className="flex justify-between items-center border-b border-neutral-105 dark:border-neutral-800 pb-4">
              <div className="flex items-center space-x-2">
                <Ruler className="w-5 h-5 text-black dark:text-amber-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-neutral-900 dark:text-white">REED Apparel Size Guide</h3>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-450 font-mono">Engineered 240~280 GSM Heavy Boxy Cut</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowSizeChart(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                id="close-size-chart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto py-6 space-y-6">
              {/* Unit Toggle Button */}
              <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-900 p-3 border border-neutral-150 dark:border-neutral-850">
                <div className="text-[10px] text-neutral-600 dark:text-neutral-300 font-medium font-mono uppercase tracking-wider">
                  Select Unit Metric:
                </div>
                <div className="flex bg-neutral-200 dark:bg-neutral-800 p-0.5 rounded shadow-inner">
                  <button
                    type="button"
                    onClick={() => setChartUnit('in')}
                    className={`px-3 py-1 font-mono text-[9px] font-bold uppercase transition-all tracking-wider cursor-pointer ${
                      chartUnit === 'in' ? 'bg-black text-white dark:bg-amber-400 dark:text-neutral-950 shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Inches (in)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartUnit('cm')}
                    className={`px-3 py-1 font-mono text-[9px] font-bold uppercase transition-all tracking-wider cursor-pointer ${
                      chartUnit === 'cm' ? 'bg-black text-white dark:bg-amber-400 dark:text-neutral-950 shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Centimeters (cm)
                  </button>
                </div>
              </div>

              {/* Sizing Table */}
              <div className="border border-neutral-100 dark:border-neutral-850 overflow-hidden font-mono text-xs">
                <div className="grid grid-cols-4 bg-neutral-900 text-white font-bold p-3 text-center uppercase tracking-wider text-[10px]">
                  <div>Size Tag</div>
                  <div>Chest Width</div>
                  <div>Overall Length</div>
                  <div>Sleeve Length</div>
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-850">
                  {baseSizeData.map((row) => (
                    <div 
                      key={row.size} 
                      className={`grid grid-cols-4 p-3 text-center transition-colors items-center ${
                        selectedSize === row.size ? 'bg-amber-400/10 dark:bg-amber-400/5 font-bold text-black dark:text-amber-400 border-l-4 border-l-amber-500' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                      }`}
                    >
                      <div className="font-extrabold text-sm">{row.size}</div>
                      <div>{formatMeasurement(row.chest, chartUnit)}</div>
                      <div>{formatMeasurement(row.length, chartUnit)}</div>
                      <div>{formatMeasurement(row.sleeve, chartUnit)}</div>
                    </div>
                  ))}
                </div>
              </div>
 
              {/* Sizing Note / Advice */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded border border-neutral-150 dark:border-neutral-800 space-y-2 text-xs">
                <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wide font-mono text-[10px]">Fit Specifications & Advice:</h4>
                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-[11px]">
                  All heavy crewnecks are crafted in a tailored <strong>Boxy Silhouette</strong> featuring a drop-shoulder shoulder line and slightly cropped height to eliminate awkward folding around the waist.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 bg-white dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-850 rounded">
                    <span className="font-bold block text-[10px] uppercase font-mono text-neutral-800 dark:text-neutral-200">For Streetwear Drape:</span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-normal">Go with your true size. It provides a generous silhouette without feeling overly long or sloppy.</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-850 rounded">
                    <span className="font-bold block text-[10px] uppercase font-mono text-neutral-800 dark:text-neutral-200">For Conventional Regular Fit:</span>
                    <span className="text-[10px] text-neutral-550 dark:text-neutral-400 leading-normal">Size down 1 full size. The cotton maintains its architectural drop structure beautifully.</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex justify-between items-center text-[10px] text-neutral-400 font-mono">
              <span>* Tolerances +/- 0.5 inches on garment specifications</span>
              <button
                type="button"
                onClick={() => setShowSizeChart(false)}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 text-[9px] uppercase font-bold tracking-widest cursor-pointer transition-colors"
              >
                Apply measurements
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Portal Overlay */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-55 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 text-white" 
          id="lightbox-fullscreen"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Header segment with meta and close button */}
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto border-b border-neutral-800/60 pb-3" onClick={(e) => e.stopPropagation()}>
            <div className="text-left font-sans">
              <h4 className="text-[10px] uppercase font-mono tracking-widest text-neutral-450 font-bold">
                {product.name}
              </h4>
              <p className="text-[10.5px] text-neutral-400 font-mono mt-0.5">
                Image {lightboxIndex + 1} of {galleryImages.length}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-neutral-900 border border-neutral-850 text-neutral-400 hover:text-white hover:border-neutral-500 transition-all cursor-pointer flex items-center justify-center shadow"
              id="close-lightbox"
              title="Close Fullscreen View"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Main Photo Visual Area with slide controls */}
          <div className="flex-grow flex items-center justify-center max-h-[72vh] relative w-full max-w-7xl mx-auto my-3 select-none">
            {/* Previous slide trigger */}
            {galleryImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
                }}
                className="absolute left-1 md:left-4 z-10 p-2.5 sm:p-3.5 rounded-full bg-black/50 hover:bg-neutral-900/95 text-white/80 hover:text-white border border-neutral-800/60 hover:border-neutral-500 transition-all cursor-pointer flex items-center justify-center shadow-lg"
                id="lightbox-prev-btn"
                title="Previous Image"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {/* Click on image to advance or dispatch, plus swipe to navigate */}
            <div 
              onTouchStart={handleLightboxTouchStart}
              onTouchEnd={handleLightboxTouchEnd}
              className="h-full max-h-[66vh] aspect-[4/5] overflow-hidden rounded-md border border-neutral-900 bg-neutral-950 flex items-center justify-center shadow-2xl relative select-none"
              onClick={(e) => {
                e.stopPropagation();
                if (galleryImages.length > 1) {
                  setLightboxIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
                }
              }}
              title="Click for Next Image or swipe to navigate"
            >
              <img
                key={lightboxIndex}
                src={galleryImages[lightboxIndex]}
                alt={`${product.name} large view ${lightboxIndex + 1}`}
                className="w-full h-full object-contain cursor-pointer animate-fade-in"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Next slide trigger */}
            {galleryImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-1 md:right-4 z-10 p-2.5 sm:p-3.5 rounded-full bg-black/50 hover:bg-neutral-900/95 text-white/80 hover:text-white border border-neutral-800/60 hover:border-neutral-500 transition-all cursor-pointer flex items-center justify-center shadow-lg"
                id="lightbox-next-btn"
                title="Next Image"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>

          {/* Footer visual indicators and carousel thumbnail strip */}
          <div className="w-full max-w-7xl mx-auto border-t border-neutral-800/60 pt-3 flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto max-w-full pb-1 justify-center">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={`lightbox-indicator-thumb-${idx}`}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className={`w-10 aspect-[4/5] rounded border overflow-hidden transition-all duration-300 relative cursor-pointer ${
                      lightboxIndex === idx
                        ? 'border-white ring-1 ring-white scale-105'
                        : 'border-neutral-800 hover:border-neutral-600 scale-95 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Lightbox thumbnail indicator ${idx + 1}`}
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="text-[8.5px] text-neutral-500 tracking-[0.25em] font-mono uppercase mt-1">
              REƎD APP-ENGINE PRINT ZOOM SYSTEM
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
