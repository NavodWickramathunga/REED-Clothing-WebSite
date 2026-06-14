import React, { useState, useEffect } from 'react';
import { MessageSquare, ShoppingBag, Send, X, ShieldCheck, Heart, HelpCircle } from 'lucide-react';
import { CartItem } from '../types';

interface FloatingWhatsAppProps {
  whatsappNumber: string;
  cartItems: CartItem[];
  currency: 'USD' | 'LKR';
  onOpenCheckout: () => void;
  onOpenCart: () => void;
}

export default function FloatingWhatsApp({
  whatsappNumber,
  cartItems,
  currency,
  onOpenCheckout,
  onOpenCart
}: FloatingWhatsAppProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [animatePing, setAnimatePing] = useState(true);
  const [isScrollVisible, setIsScrollVisible] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  // Clean phone number for URL
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');

  // Track scrolling to toggle visibility of floating FAB
  useEffect(() => {
    const handleScroll = () => {
      const collectionEl = document.getElementById('collection');
      if (collectionEl) {
        const rect = collectionEl.getBoundingClientRect();
        const topOfCollection = rect.top + window.scrollY;
        // Stay hidden until the user reaches the product collection section (with a minor buffer)
        if (window.scrollY >= topOfCollection - 240) {
          setIsScrollVisible(true);
        } else {
          setIsScrollVisible(false);
          // Clean close the menu when scrolling back to the top
          setIsOpen(false);
        }
      } else {
        // Fallback calculation based on hero section viewport height
        if (window.scrollY > 400) {
          setIsScrollVisible(true);
        } else {
          setIsScrollVisible(false);
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto pulsing stop after some interactions
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatePing(false);
    }, 15000); // Pulse for 15 seconds originally to capture visual attention, then remain steady
    return () => clearTimeout(timer);
  }, []);

  const handleGeneralInquiry = () => {
    const defaultText = encodeURIComponent(
      `Hi REƎD, I am exploring your latest streetwear drop. I'd love to learn more about the sizing specifications and current stock availability!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${defaultText}`, '_blank', 'noopener,noreferrer');
  };

  const handleCartSummarySend = () => {
    if (cartItems.length === 0) return;
    
    let summaryText = `🛒 *REƎD APPAREL - HIGH INTENT INTEREST*\n\n`;
    summaryText += `I am ready to purchase the following premium garments:\n\n`;
    
    cartItems.forEach((item, index) => {
      const price = currency === 'USD' ? item.product.priceUSD : item.product.priceLKR;
      summaryText += `${index + 1}. *${item.product.name}*\n`;
      summaryText += `   Size: *${item.selectedSize}* | Color: *${item.selectedColor}*\n`;
      summaryText += `   Qty: *${item.quantity}* × ${currency === 'USD' ? '$' : 'Rs. '}${price}\n\n`;
    });

    const totalCost = cartItems.reduce((acc, item) => {
      const p = currency === 'USD' ? item.product.priceUSD : item.product.priceLKR;
      return acc + (p * item.quantity);
    }, 0);

    summaryText += `*Estimated Total:* ${currency === 'USD' ? '$' : 'Rs. '}${totalCost}\n\n`;
    summaryText += `Please verify this order and send the direct bank transfer detail instructions!`;

    const encoded = encodeURIComponent(summaryText);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 font-sans select-none transition-all duration-300 ease-out ${
        isScrollVisible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-8 scale-90 pointer-events-none'
      }`}
      id="viva-whatsapp-action-floating-button"
    >
      {/* CHAT HUB POP-OVER PANEL */}
      <div
        className={`absolute bottom-16 right-0 w-80 sm:w-96 bg-[#0E0F11] border border-neutral-850 rounded-2xl shadow-2xl p-5 overflow-hidden text-white transition-all duration-305 ease-out origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-[0.93] translate-y-4 pointer-events-none'
        }`}
      >
        {/* Visual Header Decors */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />
        
        {/* Decorative background circle */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#0E0F11] animate-pulse" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-black tracking-wider uppercase flex items-center gap-1">
                REƎD CO-PILOT
                <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 text-[6.5px] font-mono tracking-widest uppercase rounded">LIVE</span>
              </h4>
              <p className="text-[9px] text-neutral-400 tracking-wide font-mono">Typically responds in minutes</p>
            </div>
          </div>

          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-full hover:bg-neutral-900 border border-transparent hover:border-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Close chat Hub"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MESSAGE CHAT BOX BUBBLE SIMULATOR */}
        <div className="my-4 space-y-3.5">
          <div className="bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-900 text-left relative">
            <p className="text-[11px] text-neutral-200 leading-relaxed">
              Welcome to our private checkout frequency. Send our team a message to guide your sizing, verify fit coordinates, or process direct bank payments immediately.
            </p>
            <div className="absolute top-2.5 right-3 text-[7.5px] text-neutral-500 font-mono">NOW</div>
          </div>

          {/* Dynamic Cart Summary Mini-Box */}
          {cartCount > 0 ? (
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-3 text-left space-y-2">
              <div className="flex items-center justify-between text-[8px] font-mono tracking-widest text-emerald-400 font-extrabold uppercase">
                <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> CART SYNC CONFIRMED</span>
                <span>{cartCount} {cartCount === 1 ? 'GARMENT' : 'GARMENTS'}</span>
              </div>

              <div className="text-[10px] space-y-0.5 text-neutral-300">
                {cartItems.slice(0, 2).map((item) => (
                  <div key={item.id} className="truncate">
                    • {item.product.name} ({item.selectedSize}) ×{item.quantity}
                  </div>
                ))}
                {cartItems.length > 2 && (
                  <div className="text-[8.5px] text-neutral-500 font-mono italic">
                    + {cartItems.length - 2} more item(s) in active bag
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenCheckout();
                  }}
                  className="flex-1 py-1.5 bg-white hover:bg-neutral-250 text-black rounded text-[9px] font-bold tracking-widest uppercase transition-all duration-200 text-center cursor-pointer shadow-sm"
                >
                  Wizard Checkout
                </button>
                <button
                  onClick={handleCartSummarySend}
                  className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded text-[9px] font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                >
                  <Send className="w-3 h-3" /> WhatsApp Pay
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-900/30 border border-neutral-900/50 rounded-xl p-3.5 text-center py-5 space-y-2">
              <span className="text-xl">🛍️</span>
              <p className="text-[10px] text-neutral-400">Your shopping bag is currently empty.</p>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  const el = document.getElementById('collection');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-1.5 bg-white text-black text-[8px] font-black tracking-widest uppercase hover:bg-neutral-200 transition-colors rounded-sm cursor-pointer"
              >
                View Heavy fits
              </button>
            </div>
          )}
        </div>

        {/* GENERAL OPTIONS SELECTIONS */}
        <div className="space-y-2 border-t border-neutral-900 pt-3">
          <button
            onClick={handleGeneralInquiry}
            className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-850 hover:text-white text-neutral-300 border border-neutral-850 hover:border-neutral-700 text-[9px] font-bold tracking-widest uppercase rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
            Sizing & Stock Inquiry
          </button>

          <div className="flex items-center justify-between text-[7px] text-neutral-500 font-mono tracking-widest pt-1 px-1">
            <span className="flex items-center gap-1 uppercase"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure Transit encryption</span>
            <span className="flex items-center gap-1 uppercase">REƎD Colombo <Heart className="w-2.5 h-2.5 text-neutral-600 fill-neutral-600 hover:fill-red-500 hover:text-red-500 transition-colors" /></span>
          </div>
        </div>
      </div>

      {/* CORE FLOATING SHIELD TRIGGER BUTTON */}
      <button
        id="whatsapp-fab-trigger"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer overflow-visible active:scale-95 hover:scale-105 ${
          isOpen
            ? 'bg-neutral-950 text-white border border-neutral-800'
            : 'bg-emerald-500 hover:bg-emerald-400 text-black'
        }`}
      >
        {/* Dynamic Glowing Halo */}
        {animatePing && !isOpen && (
          <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping z-0 pointer-events-none" />
        )}

        {/* Dynamic Cart item Badge counter */}
        {cartCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-black text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center z-20 shadow">
            {cartCount}
          </div>
        )}

        {/* Core animated icon swap */}
        <div className="transition-all duration-200">
          {isOpen ? (
            <X className="w-5.5 h-5.5" />
          ) : (
            <MessageSquare className="w-6 h-6 fill-current/10" />
          )}
        </div>

        {/* Hover label hint */}
        <div
          className={`absolute right-16 px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-850 text-white text-[8.5px] font-mono font-extrabold tracking-widest uppercase shadow-xl whitespace-nowrap pointer-events-none transition-all duration-200 origin-right ${
            hovered && !isOpen
              ? 'opacity-100 translate-x-0 scale-100'
              : 'opacity-0 translate-x-4 scale-90'
          }`}
        >
          <span className="text-emerald-400">✦</span> Viva Checkout Radar
        </div>
      </button>
    </div>
  );
}
