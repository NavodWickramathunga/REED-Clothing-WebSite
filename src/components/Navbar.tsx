import React, { useState, useEffect } from 'react';
import { ShoppingBag, Settings, Menu, X, ChevronDown, Sparkles, Home, Layers, Sun, Moon, Heart, Truck } from 'lucide-react';
import { formatCurrency } from '../utils';
import BrandLogo from './BrandLogo';

interface NavbarProps {
  currency: 'USD' | 'LKR';
  setCurrency: (c: 'USD' | 'LKR') => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenOrderTracker?: () => void;
  isAdminMode: boolean;
  selectedGender: 'all' | 'men' | 'women';
  onSelectGender: (gender: 'all' | 'men' | 'women') => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  wishlistCount: number;
  showWishlistOnly: boolean;
  onToggleWishlistOnly: () => void;
}

export default function Navbar({
  currency,
  setCurrency,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onOpenOrderTracker,
  isAdminMode,
  selectedGender,
  onSelectGender,
  selectedCategory,
  onSelectCategory,
  theme,
  onToggleTheme,
  wishlistCount,
  showWishlistOnly,
  onToggleWishlistOnly,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<'men' | 'women' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileGender, setActiveMobileGender] = useState<'men' | 'women' | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCollectionSelect = (gender: 'all' | 'men' | 'women', category: string) => {
    onSelectGender(gender);
    onSelectCategory(category);
    setActiveMegaMenu(null);
    setIsMobileMenuOpen(false);

    // Smooth scroll down to collection grid
    setTimeout(() => {
      const collEl = document.getElementById('collection');
      if (collEl) {
        collEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  return (
    <>
      <header className={`fixed left-0 right-0 z-50 w-full transition-all duration-300 border-b ${
        isScrolled 
          ? theme === 'dark'
            ? 'top-0 bg-[#0c0c0b]/95 backdrop-blur-md border-neutral-800 shadow-sm'
            : 'top-0 bg-white/95 backdrop-blur-md border-neutral-100 shadow-sm' 
          : 'top-[36px] bg-black/40 backdrop-blur-xs border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Menu button for mobile viewports */}
          <div className="flex md:hidden items-center">
            <button
               onClick={() => setIsMobileMenuOpen(true)}
               className={`p-2 rounded-full transition-all ${
                 isScrolled 
                   ? theme === 'dark' ? 'text-white hover:bg-neutral-800' : 'text-black hover:bg-neutral-100'
                   : 'text-white hover:bg-white/10'
               }`}
               id="mobile-hamburger-btn"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Left Links - Men & Women Navigation with Desktop Mega Menu */}
          <div className="hidden md:flex items-center space-x-8 text-[11px] font-black tracking-[0.2em] uppercase">
            <button
              onClick={() => handleCollectionSelect('all', 'All')}
              className={`transition-colors uppercase tracking-[0.25em] ${
                isScrolled 
                  ? theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black' 
                  : 'text-white/85 hover:text-white'
              }`}
            >
              Collection
            </button>

            {/* MEN Link - Trigger Mega Menu */}
            <div 
              className="relative inline-block py-4"
              onMouseEnter={() => setActiveMegaMenu('men')}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <button
                onClick={() => handleCollectionSelect('men', 'All')}
                className={`flex items-center gap-1 transition-all uppercase tracking-[0.25em] cursor-pointer ${
                  selectedGender === 'men' 
                    ? 'text-amber-500' 
                    : isScrolled 
                      ? theme === 'dark' ? 'text-white hover:text-amber-400' : 'text-black hover:text-amber-500' 
                      : 'text-white hover:text-amber-400'
                }`}
                id="navbar-men-primary-btn"
              >
                Men <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
            </div>

            {/* WOMEN Link - Trigger Mega Menu */}
            <div 
              className="relative inline-block py-4"
              onMouseEnter={() => setActiveMegaMenu('women')}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <button
                onClick={() => handleCollectionSelect('women', 'All')}
                className={`flex items-center gap-1 transition-all uppercase tracking-[0.25em] cursor-pointer ${
                  selectedGender === 'women' 
                    ? 'text-amber-500' 
                    : isScrolled 
                      ? theme === 'dark' ? 'text-white hover:text-amber-400' : 'text-black hover:text-amber-500' 
                      : 'text-white hover:text-amber-400'
                }`}
                id="navbar-women-primary-btn"
              >
                Women <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
            </div>
          </div>

          {/* Center Logo - Mirror E representing REED brand */}
          <div className="flex flex-col items-center">
            <a 
              href="/" 
              onClick={(e) => {
                e.preventDefault();
                onSelectGender('all');
                onSelectCategory('All');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center space-x-1"
            >
              <BrandLogo 
                size={22} 
                className={`transition-colors duration-300 ${
                  isScrolled 
                    ? theme === 'dark' ? 'text-white' : 'text-black' 
                    : 'text-white'
                }`} 
              />
            </a>
            <span className={`text-[8px] uppercase tracking-[0.45em] font-mono -mt-0.5 font-bold transition-colors duration-300 ${
              isScrolled 
                ? theme === 'dark' ? 'text-neutral-400' : 'text-neutral-400' 
                : 'text-white/60'
            }`}>PREMIUM APPAREL</span>
          </div>

          {/* Right Menu - Utilities */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Currency Switcher */}
            <div className={`hidden sm:flex items-center p-0.5 rounded-full border transition-all duration-300 ${
              isScrolled 
                ? theme === 'dark'
                  ? 'bg-neutral-900 border-neutral-800'
                  : 'bg-neutral-100 border-neutral-200' 
                : 'bg-white/10 border-white/20'
            }`}>
              <button
                onClick={() => setCurrency('LKR')}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-[9px] font-bold tracking-wider transition-all uppercase cursor-pointer ${
                  currency === 'LKR' 
                    ? isScrolled 
                      ? theme === 'dark' ? 'bg-amber-500 text-black shadow-sm' : 'bg-black text-white shadow-sm'
                      : 'bg-white text-black shadow-sm' 
                    : isScrolled 
                      ? theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'
                      : 'text-white/65 hover:text-white'
                }`}
              >
                LKR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-[9px] font-bold tracking-wider transition-all uppercase cursor-pointer ${
                  currency === 'USD' 
                    ? isScrolled 
                      ? theme === 'dark' ? 'bg-amber-500 text-black shadow-sm' : 'bg-black text-white shadow-sm'
                      : 'bg-white text-black shadow-sm' 
                    : isScrolled 
                      ? theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'
                      : 'text-white/65 hover:text-white'
                }`}
              >
                USD
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-full transition-all duration-300 cursor-pointer ${
                isScrolled 
                  ? theme === 'dark'
                    ? 'text-neutral-450 hover:bg-neutral-800 hover:text-amber-400' 
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-black' 
                  : 'text-white/75 hover:bg-white/10 hover:text-amber-400'
              }`}
              title={theme === 'dark' ? "Switch to Light Theme" : "Switch to Dark Theme"}
              id="theme-switcher-toggle"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Track Order Button */}
            {onOpenOrderTracker && (
              <button
                onClick={onOpenOrderTracker}
                className={`p-2 rounded-full transition-all duration-300 relative cursor-pointer ${
                  isScrolled 
                    ? theme === 'dark' ? 'text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-black' 
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
                title="Track My Order"
                id="track-order-desktop-btn"
              >
                <Truck className="w-4.5 h-4.5" />
              </button>
            )}

            {/* Admin panel button */}
            <button
              onClick={onOpenAdmin}
              className={`hidden sm:block p-2 rounded-full transition-all duration-300 ${
                isScrolled 
                  ? theme === 'dark' ? 'text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'text-neutral-400 hover:bg-neutral-100 hover:text-black' 
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`}
              title="Brand Manager"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onToggleWishlistOnly}
              className={`p-2 rounded-full transition-all duration-300 relative cursor-pointer ${
                showWishlistOnly
                  ? 'text-red-500 hover:bg-neutral-800'
                  : isScrolled 
                    ? theme === 'dark' ? 'text-neutral-350 hover:bg-neutral-800 hover:text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
              title={showWishlistOnly ? "Show All Items" : "View Wishlist"}
              id="wishlist-menu-toggle"
            >
              <Heart className={`w-4.5 h-4.5 transition-colors ${showWishlistOnly ? 'fill-red-500 text-red-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className={`absolute top-0.5 right-0.5 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs transition-colors ${
                  showWishlistOnly
                    ? 'bg-red-500 text-white animate-pulse'
                    : isScrolled 
                      ? theme === 'dark' ? 'bg-amber-500 text-black' : 'bg-black text-white' 
                      : 'bg-white text-black'
                }`}>
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className={`p-2 rounded-full transition-all duration-300 relative ${
                isScrolled 
                  ? theme === 'dark' ? 'text-neutral-300 hover:bg-neutral-800 hover:text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
              id="shopping-cart-toggle"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {cartCount > 0 && (
                <span className={`absolute top-0.5 right-0.5 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-xs ${
                  isScrolled 
                    ? theme === 'dark' ? 'bg-amber-500 text-black' : 'bg-black text-white' 
                    : 'bg-white text-black'
                }`}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* --- DESKTOP MEGA MENU DROPDOWN INTERFACE --- */}
        {activeMegaMenu && (
          <div 
            onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
            onMouseLeave={() => setActiveMegaMenu(null)}
            className={`absolute top-20 left-0 right-0 border-b shadow-xl transition-all duration-300 p-8 z-40 max-w-7xl mx-auto flex gap-12 font-sans ${
              theme === 'dark' 
                ? 'bg-[#0f0f0e] border-neutral-800 text-white'
                : 'bg-white border-neutral-200 text-neutral-900'
            }`}
          >
            {/* Column 1: Sub categories link */}
            <div className="flex-1 space-y-4">
              <span className={`text-[10px] uppercase tracking-widest font-mono font-bold border-b pb-2 block ${
                theme === 'dark' ? 'text-neutral-400 border-neutral-850' : 'text-neutral-450 border-neutral-100'
              }`}>
                {activeMegaMenu === 'men' ? "MEN'S APPAREL" : "WOMEN'S APPAREL"}
              </span>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-left">
                <button 
                  onClick={() => handleCollectionSelect(activeMegaMenu, 'All')}
                  className={`text-xs font-extrabold transition-colors flex items-center gap-1.5 uppercase tracking-wide group ${
                    theme === 'dark' ? 'text-neutral-200 hover:text-amber-400' : 'text-neutral-650 hover:text-black'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  Show All {activeMegaMenu === 'men' ? "Mens" : "Womens"}
                </button>
                <button 
                  onClick={() => handleCollectionSelect(activeMegaMenu, 'Signature')}
                  className={`text-xs font-semibold transition-colors flex items-center gap-1.5 uppercase ${
                    theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Signature Line
                </button>
                <button 
                  onClick={() => handleCollectionSelect(activeMegaMenu, 'Essentials')}
                  className={`text-xs font-semibold transition-colors flex items-center gap-1.5 uppercase ${
                    theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Essentials range
                </button>
                <button 
                  onClick={() => handleCollectionSelect(activeMegaMenu, 'Limited')}
                  className={`text-xs font-semibold transition-colors flex items-center gap-1.5 uppercase ${
                    theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Limited Drop
                </button>
              </div>
            </div>

            {/* Column 2: Lookbook Visual Promo Feature */}
            <div className="relative w-80 h-36 bg-neutral-900 overflow-hidden group/mega cursor-pointer" onClick={() => handleCollectionSelect(activeMegaMenu, 'All')}>
              <img 
                src={activeMegaMenu === 'men' 
                  ? "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=600&auto=format&fit=crop&q=80"
                  : "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80"
                } 
                className="w-full h-full object-cover brightness-[0.55] transition-transform duration-500 group-hover/mega:scale-105"
                alt="Promo banner look"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-left">
                <span className="text-[8px] font-mono tracking-widest text-amber-400 font-extrabold uppercase">SEASON LOOKBOOK</span>
                <h4 className="text-sm font-extrabold text-white tracking-wider uppercase font-serif italic">EXPLORE BOLD ESSENTIALS</h4>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* --- RESPONSIVE MOBILE ACCORDION HAMBURGER MENU DRAWER --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-100 flex justify-start animate-fade-in font-sans">
          <div className={`w-4/5 max-w-sm h-full flex flex-col p-6 space-y-6 relative shadow-2xl overflow-y-auto border-r transition-all duration-300 ${
            theme === 'dark' ? 'bg-[#0c0c0b] border-neutral-800 text-white' : 'bg-white border-neutral-100 text-neutral-900'
          }`}>
            {/* Header / Brand close control closer */}
            <div className={`flex justify-between items-center border-b pb-4 ${
              theme === 'dark' ? 'border-neutral-850' : 'border-neutral-100'
            }`}>
              <div className="flex flex-col items-start gap-0.5">
                <BrandLogo size={18} className="text-neutral-900 dark:text-white self-start" />
                <span className={`text-[7px] tracking-[0.3em] font-mono block uppercase ${
                  theme === 'dark' ? 'text-neutral-500' : 'text-neutral-400'
                }`}>COLOMBO LABEL</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-1 rounded-full cursor-pointer border ${
                  theme === 'dark' 
                    ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300' 
                    : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-100 text-neutral-700'
                }`}
                id="close-mobile-menu-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu options structure */}
            <div className="flex-grow space-y-6">
              {/* Reset All Home button */}
              <button
                onClick={() => {
                  onSelectGender('all');
                  onSelectCategory('All');
                  setIsMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full py-2.5 text-left text-xs font-black tracking-widest uppercase flex items-center gap-2.5 border-b hover:text-amber-500 ${
                  theme === 'dark' ? 'border-neutral-850 text-neutral-300' : 'border-neutral-50 text-neutral-900'
                }`}
              >
                <Home className="w-4 h-4 text-neutral-400" />
                HOME STOREFRONT
              </button>

              {/* Men’s Section Block Accordion */}
              <div className={`space-y-2 border-b pb-3 ${
                theme === 'dark' ? 'border-neutral-850' : 'border-neutral-100'
              }`}>
                <button
                  onClick={() => setActiveMobileGender(activeMobileGender === 'men' ? null : 'men')}
                  className={`w-full flex justify-between items-center py-2 text-xs font-black tracking-[0.15em] uppercase text-left hover:text-amber-500 ${
                    theme === 'dark' ? 'text-white' : 'text-neutral-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${theme === 'dark' ? 'bg-amber-500' : 'bg-black'}`} />
                    MEN'S RANGE
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeMobileGender === 'men' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeMobileGender === 'men' && (
                  <div className="pl-6 space-y-2.5 flex flex-col text-left py-1 animate-fade-in">
                    <button 
                      onClick={() => handleCollectionSelect('men', 'All')}
                      className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                        theme === 'dark' ? 'text-neutral-200 hover:text-white' : 'text-neutral-800 hover:text-black'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Show All Mens
                    </button>
                    <button onClick={() => handleCollectionSelect('men', 'Signature')} className={`text-xs uppercase ${theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'}`}>Signature Line</button>
                    <button onClick={() => handleCollectionSelect('men', 'Essentials')} className={`text-xs uppercase ${theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'}`}>Essentials range</button>
                    <button onClick={() => handleCollectionSelect('men', 'Limited')} className={`text-xs uppercase ${theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'}`}>Limited Drop</button>
                  </div>
                )}
              </div>

              {/* Women’s Section Block Accordion */}
              <div className={`space-y-2 border-b pb-3 ${
                theme === 'dark' ? 'border-neutral-850' : 'border-neutral-100'
              }`}>
                <button
                  onClick={() => setActiveMobileGender(activeMobileGender === 'women' ? null : 'women')}
                  className={`w-full flex justify-between items-center py-2 text-xs font-black tracking-[0.15em] uppercase text-left hover:text-amber-500 ${
                    theme === 'dark' ? 'text-white' : 'text-neutral-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${theme === 'dark' ? 'bg-amber-500' : 'bg-black'}`} />
                    WOMEN'S RANGE
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeMobileGender === 'women' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeMobileGender === 'women' && (
                  <div className="pl-6 space-y-2.5 flex flex-col text-left py-1 animate-fade-in">
                    <button 
                      onClick={() => handleCollectionSelect('women', 'All')}
                      className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                        theme === 'dark' ? 'text-neutral-200 hover:text-white' : 'text-neutral-800 hover:text-black'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Show All Womens
                    </button>
                    <button onClick={() => handleCollectionSelect('women', 'Signature')} className={`text-xs uppercase ${theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'}`}>Signature Line</button>
                    <button onClick={() => handleCollectionSelect('women', 'Essentials')} className={`text-xs uppercase ${theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'}`}>Essentials range</button>
                    <button onClick={() => handleCollectionSelect('women', 'Limited')} className={`text-xs uppercase ${theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'}`}>Limited Drop</button>
                  </div>
                )}
              </div>

              {/* Browse mixed category collections */}
              <button
                onClick={() => handleCollectionSelect('all', 'All')}
                className={`w-full py-2 text-left text-xs font-black tracking-widest uppercase flex items-center gap-2.5 hover:text-amber-500 ${
                  theme === 'dark' ? 'text-neutral-300' : 'text-neutral-600'
                }`}
              >
                <Layers className="w-4 h-4 text-neutral-400 animate-pulse" />
                GLOBAL MIXED GRID
              </button>

              {/* Mobile-only settings and options */}
              <div className={`pt-4 border-t space-y-4 ${
                theme === 'dark' ? 'border-neutral-800' : 'border-neutral-100'
              }`}>
                <div className="space-y-1.5 text-left">
                  <span className="text-[8px] uppercase font-mono tracking-widest text-neutral-400 font-extrabold block">
                    Region Currency
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setCurrency('LKR');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`py-2 rounded text-[10px] font-black tracking-widest uppercase transition-all border text-center ${
                        currency === 'LKR'
                          ? 'bg-black text-white border-black shadow-sm'
                          : theme === 'dark'
                            ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:text-black'
                      }`}
                    >
                      LKR (Rs.)
                    </button>
                    <button
                      onClick={() => {
                        setCurrency('USD');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`py-2 rounded text-[10px] font-black tracking-widest uppercase transition-all border text-center ${
                        currency === 'USD'
                          ? 'bg-black text-white border-black shadow-sm'
                          : theme === 'dark'
                            ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:text-black'
                      }`}
                    >
                      USD ($)
                    </button>
                  </div>
                </div>

                {onOpenOrderTracker && (
                  <button
                    onClick={() => {
                      onOpenOrderTracker();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2.5 rounded text-[10px] font-black tracking-widest uppercase border flex items-center justify-center gap-2 transition-all cursor-pointer mb-2 ${
                      theme === 'dark'
                        ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100 hover:text-black'
                    }`}
                    id="track-order-mobile-btn"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Track My Order
                  </button>
                )}

                <button
                  onClick={() => {
                    onOpenAdmin();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full py-2.5 rounded text-[10px] font-black tracking-widest uppercase border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100 hover:text-black'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Launch Brand Manager
                </button>
              </div>
            </div>

            {/* Bottom Panel Branding Stamp */}
            <div className={`border-t pt-4 space-y-4 text-center ${
              theme === 'dark' ? 'border-neutral-850' : 'border-neutral-100'
            }`}>
              {/* Social row in mobile menu */}
              <div className="flex justify-center gap-4 py-1">
                <a
                  href="https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=j8ei3ob"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full border transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-amber-400 hover:border-amber-400' 
                      : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:text-black hover:border-black'
                  }`}
                  aria-label="Instagram Profile"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                
                <a
                  href="https://www.tiktok.com/@reed.by.s?_r=1&_t=ZS-96cTGUmlzO9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 rounded-full border transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-amber-400 hover:border-amber-400' 
                      : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:text-black hover:border-black'
                  }`}
                  aria-label="TikTok Profile"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95 1.15 2.29 1.95 3.75 2.27v3.91c-1.22-.04-2.42-.4-3.5-1.04-.63-.38-1.2-.87-1.68-1.45v7.6c.07 1.83-.56 3.65-1.72 5.04-1.35 1.62-3.4 2.51-5.5 2.45-2.04-.04-4.01-.96-5.28-2.55-1.43-1.75-2-4.09-1.55-6.3.43-2.18 1.96-4.03 4.02-4.82.91-.35 1.89-.48 2.86-.4v3.86c-.5-.07-1.01.01-1.47.22-.92.42-1.59 1.28-1.78 2.28-.24 1.23.36 2.51 1.43 3.12.87.5 1.96.48 2.81-.06.77-.49 1.14-1.4 1.12-2.31l-.01-14.82c0-.4.01-.4.01-.4z"/>
                  </svg>
                </a>

                <a
                  href="https://www.facebook.com/share/18pRVxV5rM/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full border transition-all duration-355 ${
                    theme === 'dark' 
                      ? 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-amber-400 hover:border-amber-400' 
                      : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:text-black hover:border-black'
                  }`}
                  aria-label="Facebook Page"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
              </div>

              <span className="text-[8px] uppercase tracking-[0.25em] font-mono text-neutral-400 block font-semibold">
                REƎD STYLING // COLOMBO, SL
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
