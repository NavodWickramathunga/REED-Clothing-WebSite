import React, { useState, useEffect } from 'react';
import { Product, CartItem, OrderDetails, ProductReview } from './types';
import { INITIAL_PRODUCTS, VIVA_WHATSAPP_NUMBER } from './data';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocFromServer } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, OperationType, handleFirestoreError } from './firebase';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import LatestStyles from './components/LatestStyles';
import CategoryShowcase from './components/CategoryShowcase';
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import CartSidebar from './components/CartSidebar';
import CheckoutWizard from './components/CheckoutWizard';
import AdminDashboard from './components/AdminDashboard';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import OrderTracker from './components/OrderTracker';
import SocialFooter from './components/SocialFooter';
import ReactHelmet from './components/ReactHelmet';
import { formatCurrency } from './utils';
import { MessageSquare, BadgeCheck, HelpCircle, ArrowRight, Layers, PhoneCall, Info, Sparkles, Filter, ChevronDown, Check, Home, ShoppingBag, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // --- Dark Mode Theme State ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  // --- Persistent States using localStorage and Firebase Firestore ---
  const [products, setProducts] = useState<Product[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState<string>(VIVA_WHATSAPP_NUMBER);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(auth.currentUser);
  const [apiLogs, setApiLogs] = useState<any[]>([]);

  // Wishlist state persisted in localStorage
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('reed_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [showWishlistOnly, setShowWishlistOnly] = useState<boolean>(false);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      try {
        localStorage.setItem('reed_wishlist', JSON.stringify(next));
      } catch (e) {}
      
      // Dynamic tracking event for wishlist additions
      if (!prev.includes(productId)) {
        triggerGtmEvent('add_to_wishlist', {
          item_id: productId
        });
      }
      return next;
    });
  };

  // Local currency setup
  const [currency, setCurrency] = useState<'USD' | 'LKR'>('LKR');

  // Interactive filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<'all' | 'men' | 'women'>('all');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('All');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('All');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(8000);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>('Default');

  // Modal displays
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);

  // --- Real-time GTM Event Telemetry Log Tracker ---
  const [gtmEvents, setGtmEvents] = useState<{ event: string; timestamp: string; data: any }[]>([]);

  const triggerGtmEvent = (eventName: string, data: any) => {
    try {
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: eventName,
          ...data
        });
      }
    } catch (e) {
      console.error("GTM telemetry push exception", e);
    }
    const newEv = {
      event: eventName,
      timestamp: new Date().toLocaleTimeString(),
      data
    };
    setGtmEvents(prev => [newEv, ...prev].slice(0, 6));
  };

  // Modern Search-Engine-Optimized Client-side Path Synchronizer (Replacing stale hashtags)
  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

  useEffect(() => {
    if (products.length > 0) {
      const path = window.location.pathname;
      if (path === '/cart') {
        setIsCartOpen(true);
      } else if (path === '/checkout') {
        setIsCheckoutOpen(true);
      } else if (path === '/admin') {
        setIsAdminOpen(true);
      } else if (path.startsWith('/products/')) {
        const pId = path.split('/products/')[1];
        const found = products.find(p => p.id === pId);
        if (found) {
          setActiveProduct(found);
        }
      }
    }
  }, [products]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/') {
        setActiveProduct(null);
        setIsCartOpen(false);
        setIsCheckoutOpen(false);
        setIsAdminOpen(false);
        setIsOrderTrackerOpen(false);
      } else if (path === '/cart') {
        setIsCartOpen(true);
        setActiveProduct(null);
        setIsCheckoutOpen(false);
        setIsAdminOpen(false);
        setIsOrderTrackerOpen(false);
      } else if (path === '/checkout') {
        setIsCheckoutOpen(true);
        setActiveProduct(null);
        setIsCartOpen(false);
        setIsAdminOpen(false);
        setIsOrderTrackerOpen(false);
      } else if (path === '/admin') {
        setIsAdminOpen(true);
        setActiveProduct(null);
        setIsCartOpen(false);
        setIsCheckoutOpen(false);
        setIsOrderTrackerOpen(false);
      } else if (path === '/track') {
        setIsOrderTrackerOpen(true);
        setActiveProduct(null);
        setIsCartOpen(false);
        setIsCheckoutOpen(false);
        setIsAdminOpen(false);
      } else if (path.startsWith('/products/')) {
        const pId = path.split('/products/')[1];
        const found = products.find(p => p.id === pId);
        if (found) {
          setActiveProduct(found);
          setIsCartOpen(false);
          setIsCheckoutOpen(false);
          setIsAdminOpen(false);
          setIsOrderTrackerOpen(false);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  useEffect(() => {
    if (activeProduct) {
      navigateTo(`/products/${activeProduct.id}`);
    } else if (isCartOpen) {
      navigateTo('/cart');
    } else if (isCheckoutOpen) {
      navigateTo('/checkout');
    } else if (isAdminOpen) {
      navigateTo('/admin');
    } else if (isOrderTrackerOpen) {
      navigateTo('/track');
    } else {
      navigateTo('/');
    }
  }, [activeProduct, isCartOpen, isCheckoutOpen, isAdminOpen, isOrderTrackerOpen]);

  // GTM Dynamic Lifecycle observers
  useEffect(() => {
    if (activeProduct) {
      triggerGtmEvent('view_item', {
        item_id: activeProduct.id,
        item_name: activeProduct.name,
        price_lkr: activeProduct.priceLKR,
        price_usd: activeProduct.priceUSD,
        currency,
        category: activeProduct.category
      });
    }
  }, [activeProduct]);

  useEffect(() => {
    if (isCheckoutOpen) {
      const activeSubtotal = cartItems.reduce((acc, item) => {
        const price = currency === 'USD' ? item.product.priceUSD : item.product.priceLKR;
        return acc + price * item.quantity;
      }, 0);
      triggerGtmEvent('begin_checkout', {
        subtotal: activeSubtotal,
        currency,
        items_count: cartItems.length,
        items: cartItems.map(i => ({ id: i.product.id, name: i.product.name, qty: i.quantity, sz: i.selectedSize }))
      });
    }
  }, [isCheckoutOpen]);

  // Validate connection to Firestore
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Firebase auth state monitoring
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return unsubscribe;
  }, []);

  // Subscribe to Products & WhatsApp Config real-time feeds
  useEffect(() => {
    // 1. WhatsApp Configuration Feed
    const unsubscribeWhatsApp = onSnapshot(doc(db, 'whatsapp_config', 'main'), (snap) => {
      if (snap.exists() && snap.data().number) {
        setWhatsappNumber(snap.data().number);
      } else {
        setWhatsappNumber(VIVA_WHATSAPP_NUMBER);
        // Sync default configuration to Cloud if authorized
        if (auth.currentUser && auth.currentUser.email === "navodwickramathunga@gmail.com") {
          setDoc(doc(db, 'whatsapp_config', 'main'), { number: VIVA_WHATSAPP_NUMBER }).catch(console.error);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'whatsapp_config/main');
    });

    // 2. Products Catalog Feed
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snap) => {
      if (snap.empty) {
        setProducts(INITIAL_PRODUCTS);
        // Force-seed products to cloud if first-time run is by the Admin
        if (auth.currentUser && auth.currentUser.email === "navodwickramathunga@gmail.com") {
          INITIAL_PRODUCTS.forEach((p) => {
            setDoc(doc(db, 'products', p.id), p).catch(console.error);
          });
        }
      } else {
        const prodList: Product[] = [];
        snap.forEach((docSnapshot) => {
          const fsProd = docSnapshot.data() as Product;
          const localProd = INITIAL_PRODUCTS.find(p => p.id === fsProd.id);
          
          if (localProd) {
            // Overlap/merge key details from local INITIAL_PRODUCTS to guarantee new images always show
            const mergedColors = fsProd.colors ? fsProd.colors.map((c, idx) => {
              const localColor = localProd.colors?.[idx];
              return {
                ...c,
                imageUrl: localColor?.imageUrl || c.imageUrl
              };
            }) : localProd.colors;

            const mergedProd = {
              ...fsProd,
              name: localProd.name || fsProd.name,
              description: localProd.description || fsProd.description,
              colors: mergedColors,
              hoverImageUrl: localProd.hoverImageUrl || fsProd.hoverImageUrl,
              material: localProd.material || fsProd.material,
              features: localProd.features || fsProd.features,
              priceUSD: localProd.priceUSD || fsProd.priceUSD,
              priceLKR: localProd.priceLKR || fsProd.priceLKR,
              gender: localProd.gender || fsProd.gender || 'men'
            };

            prodList.push(mergedProd);

            // Silent back-sync to Firestore if the Admin is logged in and needs an update
            if (auth.currentUser && auth.currentUser.email === "navodwickramathunga@gmail.com") {
              const fsImg = fsProd.colors?.[0]?.imageUrl || '';
              const localImg = localProd.colors?.[0]?.imageUrl || '';
              const fsHover = fsProd.hoverImageUrl || '';
              const localHover = localProd.hoverImageUrl || '';
              if ((localImg.startsWith('/input_file_') && fsImg !== localImg) || 
                  (localHover.startsWith('/input_file_') && fsHover !== localHover)) {
                setDoc(doc(db, 'products', fsProd.id), mergedProd).catch(console.error);
              }
            }
          } else {
            prodList.push(fsProd);
          }
        });
        setProducts(prodList);
      }
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
      setIsLoading(false);
    });

    return () => {
      unsubscribeWhatsApp();
      unsubscribeProducts();
    };
  }, [firebaseUser]);

  // Subscribe to Orders Feed (Only accessible for authenticated admin)
  useEffect(() => {
    // Regular user cart local load
    const savedCart = localStorage.getItem('reed_cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    if (firebaseUser?.email === "navodwickramathunga@gmail.com") {
      const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snap) => {
        const ordList: OrderDetails[] = [];
        snap.forEach((doc) => {
          ordList.push(doc.data() as OrderDetails);
        });
        ordList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setOrders(ordList);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'orders');
      });

      const unsubscribeLogs = onSnapshot(collection(db, 'gemini_api_logs'), (snap) => {
        const logList: any[] = [];
        snap.forEach((doc) => {
          logList.push({ id: doc.id, ...doc.data() });
        });
        // Sort: most recent logs first
        logList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setApiLogs(logList);
      }, (error) => {
        console.error("Failed to sync Gemini API logs in real-time:", error);
      });

      return () => {
        unsubscribeOrders();
        unsubscribeLogs();
      };
    } else {
      const savedOrders = localStorage.getItem('reed_orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    }
  }, [firebaseUser]);

  // Sync operations
  const updatePersistentProducts = async (updatedPrs: Product[]) => {
    setProducts(updatedPrs);
    localStorage.setItem('reed_products', JSON.stringify(updatedPrs));

    if (auth.currentUser && auth.currentUser.email === "navodwickramathunga@gmail.com") {
      try {
        const activeIds = updatedPrs.map(p => p.id);
        // Clear deleted
        products.forEach(async (p) => {
          if (!activeIds.includes(p.id)) {
            await deleteDoc(doc(db, 'products', p.id));
          }
        });
        // Set updated
        for (const p of updatedPrs) {
          await setDoc(doc(db, 'products', p.id), p);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'products');
      }
    }
  };

  const handleAddReview = async (productId: string, review: ProductReview) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          reviews: [review, ...(p.reviews || [])]
        };
      }
      return p;
    });
    // Write changes using existing state/firebase sync triggers
    await updatePersistentProducts(updated);

    // Dynamic telemetry event
    triggerGtmEvent('add_review', {
      item_id: productId,
      rating: review.rating,
      author: review.author
    });
  };

  const updatePersistentWhatsApp = async (phoneNo: string) => {
    setWhatsappNumber(phoneNo);
    localStorage.setItem('reed_whatsapp_number', phoneNo);

    if (auth.currentUser && auth.currentUser.email === "navodwickramathunga@gmail.com") {
      try {
        await setDoc(doc(db, 'whatsapp_config', 'main'), { number: phoneNo });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'whatsapp_config/main');
      }
    }
  };

  const updatePersistentCart = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem('reed_cart', JSON.stringify(updatedCart));
  };

  const handleOrderCompleted = async (newOrder: OrderDetails) => {
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('reed_orders', JSON.stringify(updatedOrders));
    
    try {
      await setDoc(doc(db, 'orders', newOrder.orderId), newOrder);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${newOrder.orderId}`);
    }

    // Capture purchase event in GTM tracking
    triggerGtmEvent('purchase', {
      order_id: newOrder.orderId,
      value_lkr: newOrder.totalLKR,
      value_usd: newOrder.totalUSD,
      currency,
      payment_method: newOrder.paymentMethod,
      reference: newOrder.paymentReference,
      items_count: newOrder.items.length,
      items: newOrder.items.map(i => ({ id: i.productId, name: i.productName, price: i.price, qty: i.quantity, sz: i.size }))
    });

    // Clear cart upon successful payment & order processing
    updatePersistentCart([]);
  };

  const updatePersistentOrders = async (updatedOrd: OrderDetails[]) => {
    setOrders(updatedOrd);
    localStorage.setItem('reed_orders', JSON.stringify(updatedOrd));

    if (auth.currentUser && auth.currentUser.email === "navodwickramathunga@gmail.com") {
      try {
        const activeIds = updatedOrd.map(o => o.orderId);
        orders.forEach(async (o) => {
          if (!activeIds.includes(o.orderId)) {
            await deleteDoc(doc(db, 'orders', o.orderId));
          }
        });
        for (const o of updatedOrd) {
          await setDoc(doc(db, 'orders', o.orderId), o);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'orders');
      }
    }
  };

  // --- Cart Management Functions ---
  const handleAddToCart = (product: Product, size: string, quantity: number = 1, colorName?: string) => {
    const activeColor = colorName || product.colors[0]?.name || 'Original';
    const itemId = `${product.id}-${activeColor}-${size}`;

    const existingIndex = cartItems.findIndex((item) => item.id === itemId);
    let updatedCart = [...cartItems];

    if (existingIndex >= 0) {
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart.push({
        id: itemId,
        product,
        selectedColor: activeColor,
        selectedSize: size,
        quantity,
      });
    }

    // Trigger dynamic tag tracking for cart item additions
    triggerGtmEvent('add_to_cart', {
      item_id: product.id,
      item_name: product.name,
      price_lkr: product.priceLKR,
      price_usd: product.priceUSD,
      currency,
      quantity,
      size,
      color: activeColor
    });

    updatePersistentCart(updatedCart);
    setIsCartOpen(true); // Open sidebar automatically to show added items (Frictionless UX)
  };

  const handleUpdateCartQty = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(itemId);
      return;
    }
    const updatedCart = cartItems.map((item) => {
      if (item.id === itemId) {
        return { ...item, quantity: newQty };
      }
      return item;
    });
    updatePersistentCart(updatedCart);
  };

  const handleRemoveCartItem = (itemId: string) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    updatePersistentCart(updatedCart);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // --- Filtering & Sorting computation ---
  const categories = ['All', 'Signature', 'Essentials', 'Limited'];
  const sizesList = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colorsList = ['All', 'Navy', 'Black', 'Green', 'White', 'Slate', 'Cloud', 'Rust', 'Amber'];
  
  // Dynamically calculate actual inventory price bounds
  const inventoryPrices = products.map((p) => p.priceLKR);
  const minPossiblePrice = inventoryPrices.length > 0 ? Math.min(...inventoryPrices) : 3500;
  const maxPossiblePrice = inventoryPrices.length > 0 ? Math.max(...inventoryPrices) : 8000;
  
  const filteredProducts = products.filter((p) => {
    // 0. Wishlist Filter Check
    if (showWishlistOnly && !wishlist.includes(p.id)) {
      return false;
    }
    // 1. Gender Filter Check
    if (selectedGender !== 'all') {
      const pGender = p.gender ? p.gender.toLowerCase() : 'men'; // Default to men's series if tag is absent
      if (pGender !== selectedGender && pGender !== 'unisex') {
        return false;
      }
    }
    // 2. Category Filter Check
    if (selectedCategory !== 'All') {
      if (p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }
    // 3. Sizing Filter Check
    if (selectedSizeFilter !== 'All') {
      if (!p.sizes.includes(selectedSizeFilter)) {
        return false;
      }
    }
    // 4. Color Way Filter Check
    if (selectedColorFilter !== 'All') {
      const pColors = p.colors.map(c => c.name.toLowerCase());
      const matchesColor = pColors.some(colorName => colorName.includes(selectedColorFilter.toLowerCase()));
      if (!matchesColor) {
        return false;
      }
    }
    // 5. LKR Price Range Slider Filter
    if (p.priceLKR > maxPriceFilter) {
      return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = currency === 'USD' ? a.priceUSD : a.priceLKR;
    const priceB = currency === 'USD' ? b.priceUSD : b.priceLKR;

    if (sortBy === 'PriceLowHigh') return priceA - priceB;
    if (sortBy === 'PriceHighLow') return priceB - priceA;
    return 0; // default order
  });

  // --- Dynamic SEO Head Information (ReactHelmet) ---
  let helmetTitle = "Structured Luxury Craftsmanship";
  let helmetDesc = "REƎD Apparel Colombo. Hand-embroidered heavyweight boxy shirts and crewnecks built with supreme thread counts. Order seamlessly via WhatsApp.";
  let helmetKeywords = "reed clothing, heavy knit t-shirts, oversized luxury crewnecks, colombo menswear, boxy fit tees, organic cotton sri lanka";

  if (isAdminOpen) {
    helmetTitle = "Admin System Hub";
    helmetDesc = "Secure administrator stock adjustments, WhatsApp forwarding channels management, visual sales trends telemetry analysis, and order summaries.";
  } else if (isCheckoutOpen) {
    helmetTitle = "Checkout Invoice Form";
    helmetDesc = "Configure shipping, enter payment details, and compile secure direct transaction receipts to dispatch on WhatsApp.";
  } else if (activeProduct) {
    helmetTitle = `Shop ${activeProduct.name}`;
    helmetDesc = `${activeProduct.description} - Pre-shrunk double-stitched weight at REƎD Apparel.`;
  } else if (selectedCategory !== 'All') {
    helmetTitle = `The ${selectedCategory} Crewneck Range`;
    helmetDesc = `Explore all premium boxy fit heavy knits inside our exclusive ${selectedCategory} edition. Premium heavy combed cotton that maintains its geometry perfectly.`;
  }

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 selection:bg-black dark:selection:bg-amber-500 selection:text-white dark:selection:text-black flex flex-col font-sans transition-colors duration-300">
      
      {/* Dynamic SEO Document Header */}
      <ReactHelmet 
        title={helmetTitle} 
        description={helmetDesc} 
        keywords={helmetKeywords} 
      />

      {/* 🚀 SMOOTH INFINITE-SCROLL MARQUEE PROMO TICKER AT THE VERY TOP */}
      <div className="w-full bg-black text-white py-2.5 overflow-hidden border-b border-neutral-900 select-none">
        <div className="whitespace-nowrap flex animate-marquee">
          <div className="flex shrink-0 items-center space-x-12 px-6 text-[9px] tracking-[0.32em] font-mono uppercase font-semibold">
            <span className="text-amber-400 flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" /> SHIPS NATIONWIDE IN 24-48 HOURS</span>
            <span className="text-neutral-500">•</span>
            <span className="text-white">100% ORGANIC LONG-STAPLE COTTON WEIGHT (240 GSM)</span>
            <span className="text-neutral-500">•</span>
            <span className="text-amber-400">SHAPE-LOCK RIBBED DOUBLE-COLLAR STITCHING</span>
            <span className="text-neutral-500">•</span>
            <span className="text-white">PRE-SHRUNK INDUSTRIAL SILICONE WASH</span>
            <span className="text-neutral-500">•</span>
          </div>
          <div className="flex shrink-0 items-center space-x-12 px-6 text-[9px] tracking-[0.32em] font-mono uppercase font-semibold">
            <span className="text-amber-400 flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" /> SHIPS NATIONWIDE IN 24-48 HOURS</span>
            <span className="text-neutral-500">•</span>
            <span className="text-white">100% ORGANIC LONG-STAPLE COTTON WEIGHT (240 GSM)</span>
            <span className="text-neutral-500">•</span>
            <span className="text-amber-400">SHAPE-LOCK RIBBED DOUBLE-COLLAR STITCHING</span>
            <span className="text-neutral-500">•</span>
            <span className="text-white">PRE-SHRUNK INDUSTRIAL SILICONE WASH</span>
            <span className="text-neutral-500">•</span>
          </div>
        </div>
      </div>

      {/* Brand Navigation Header */}
      <Navbar
        currency={currency}
        setCurrency={setCurrency}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
        isAdminMode={false}
        selectedGender={selectedGender}
        onSelectGender={setSelectedGender}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        wishlistCount={wishlist.length}
        showWishlistOnly={showWishlistOnly}
        onToggleWishlistOnly={() => {
          setShowWishlistOnly(prev => !prev);
          // Auto scroll to collection grid for direct visibility
          const collEl = document.getElementById('collection');
          if (collEl) {
            collEl.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Styled Luxury fashion lookbook Hero */}
      <HeroSection 
        onExploreClick={() => {
          const collEl = document.getElementById('collection');
          if (collEl) {
            collEl.scrollIntoView({ behavior: 'smooth' });
          }
        }} 
        onSelectCategory={(categoryName) => {
          setSelectedCategory(categoryName);
        }}
        onSelectGender={(genderName) => {
          setSelectedGender(genderName);
        }}
      />

      {/* NEW SECTION: 1. SHOP THE LATEST STYLES (directly below full video hero) */}
      <LatestStyles 
        products={products}
        onInspectProduct={(productId) => {
          const found = products.find(p => p.id === productId);
          if (found) {
            setActiveProduct(found);
          }
        }}
        onViewAllClick={() => {
          setSelectedCategory('All');
          const collEl = document.getElementById('collection');
          if (collEl) {
            collEl.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* NEW SECTION: 2. SHOP BY CATEGORY (below latest styles, filters dynamic states) */}
      <CategoryShowcase 
        selectedCategory={selectedCategory}
        onSelectCategory={(categoryName) => {
          setSelectedCategory(categoryName);
        }}
      />

      {/* Dynamic Collection Showcase Description Header */}
      <section id="essence" className="py-14 sm:py-24 lg:py-32 bg-white dark:bg-[#0c0c0b] text-center border-b border-neutral-100 dark:border-neutral-850 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4">
          <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 dark:text-neutral-500 font-mono font-bold block mb-2">THE REƎD STANDARD</span>
          <p className="font-sans font-light text-base sm:text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xl mx-auto">
            "We construct weighty, structural garments designed to hold their premium geometry perfectly. Hand-embroidered, boxy silhouettes built from organic double-knit cotton."
          </p>
        </div>
      </section>

      {/* Core Stores Marketplace Catalog Grid */}
      <main id="collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-24 lg:py-32 flex-grow font-sans">
        
        {/* Dynamic Page Header Block based on selectedGender */}
        <div className="border-b border-neutral-100 dark:border-neutral-850 pb-6 mb-12 text-left space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-neutral-900 dark:bg-amber-500 rounded-sm text-[8px] font-mono font-bold uppercase text-white dark:text-black tracking-widest transition-colors">
              {selectedGender === 'all' ? 'FULL CATALOG' : `${selectedGender.toUpperCase()}'S WEAR`}
            </span>
            {selectedCategory !== 'All' && (
              <span className="p-1 px-2.5 bg-amber-500 rounded-sm text-[8px] font-mono font-bold uppercase text-black tracking-widest">
                {selectedCategory.toUpperCase()}
              </span>
            )}
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-neutral-900 dark:text-white uppercase">
            {selectedGender === 'men' 
              ? "Men's Engineered Series" 
              : selectedGender === 'women' 
              ? "Women's Sculpt Activewear" 
              : "The Signature Apparel Catalog"
            }
          </h2>
          <p className="text-xs sm:text-sm font-light text-neutral-500 dark:text-neutral-400 max-w-3xl leading-relaxed">
            {selectedGender === 'men' 
              ? "Heavy-weight active streetwear. Designed with durable pre-shrunk premium combed cotton and double-knit shape-lock collars." 
              : selectedGender === 'women' 
              ? "Precision contouring activewear with cross-back support detailing and buttery soft four-way flexible stretch fiber weaves." 
              : "Explore our collection of custom-embroidered heavyweight boxy shirts, performance leggings, and sports bras built to last."
            }
          </p>
        </div>

        {/* Dynamic Filters Active Pills */}
        {(selectedGender !== 'all' || selectedCategory !== 'All' || selectedSizeFilter !== 'All' || selectedColorFilter !== 'All' || showWishlistOnly || maxPriceFilter < maxPossiblePrice) && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-left">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 mr-2">Active Filters:</span>
            {showWishlistOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white text-[9px] font-bold tracking-wider uppercase rounded-full">
                Wishlist Only
                <button onClick={() => setShowWishlistOnly(false)} className="hover:text-black font-extrabold ml-1 cursor-pointer">×</button>
              </span>
            )}
            {selectedGender !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[9px] font-bold tracking-wider uppercase rounded-full">
                Gender: {selectedGender}
                <button onClick={() => setSelectedGender('all')} className="hover:text-amber-400 font-extrabold ml-1 cursor-pointer">×</button>
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[9px] font-bold tracking-wider uppercase rounded-full">
                Collection: {selectedCategory}
                <button onClick={() => setSelectedCategory('All')} className="hover:text-amber-400 font-extrabold ml-1 cursor-pointer">×</button>
              </span>
            )}
            {selectedSizeFilter !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[9px] font-bold tracking-wider uppercase rounded-full">
                Size: {selectedSizeFilter}
                <button onClick={() => setSelectedSizeFilter('All')} className="hover:text-amber-400 font-extrabold ml-1 cursor-pointer">×</button>
              </span>
            )}
            {selectedColorFilter !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[9px] font-bold tracking-wider uppercase rounded-full">
                Color: {selectedColorFilter}
                <button onClick={() => setSelectedColorFilter('All')} className="hover:text-amber-400 font-extrabold ml-1 cursor-pointer">×</button>
              </span>
            )}
            {maxPriceFilter < maxPossiblePrice && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[9px] font-bold tracking-wider uppercase rounded-full animate-fade-in" id="price-filter-pill">
                Budget: ≤ Rs. {maxPriceFilter.toLocaleString()}
                <button onClick={() => setMaxPriceFilter(maxPossiblePrice)} className="hover:text-amber-400 font-extrabold ml-1 cursor-pointer">×</button>
              </span>
            )}
            <button 
              onClick={() => {
                setSelectedGender('all');
                setSelectedCategory('All');
                setSelectedSizeFilter('All');
                setSelectedColorFilter('All');
                setShowWishlistOnly(false);
                setMaxPriceFilter(maxPossiblePrice);
              }}
              className="text-[9px] font-mono font-bold text-amber-500 hover:text-black uppercase tracking-widest underline ml-1 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* MAIN BODY GRID: Sidebar (Desktop) + Product Items Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* DESKTOP SIDEBAR FILTERS PANEL (col-span-3) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 shrink-0 border-r border-neutral-100 pr-8">
            {/* 1. GENDER SERIES SELECTOR */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] uppercase font-mono font-bold tracking-[0.2em] text-neutral-400">Gender Series</h4>
              <div className="space-y-1.5">
                {[
                  { id: 'all', name: 'Show All' },
                  { id: 'men', name: "Men's Apparel" },
                  { id: 'women', name: "Women's Activewear" }
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGender(g.id as any)}
                    className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded font-bold uppercase text-[10px] tracking-widest transition-all cursor-pointer ${
                      selectedGender === g.id 
                        ? 'bg-black text-white' 
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    <span>{g.name}</span>
                    {selectedGender === g.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. COLLECTION FILTER */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-[10px] uppercase font-mono font-bold tracking-[0.2em] text-neutral-400">Collection Tiers</h4>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded font-bold uppercase text-[10px] tracking-widest transition-all cursor-pointer ${
                      selectedCategory === cat 
                        ? 'bg-black text-white' 
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    <span>{cat} Collection</span>
                    {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. SIZE SELECTION FILTER */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-[10px] uppercase font-mono font-bold tracking-[0.2em] text-neutral-400">Filter By Size</h4>
              <div className="grid grid-cols-4 gap-1.5">
                {sizesList.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSizeFilter(sz)}
                    className={`py-2 rounded border text-[9px] font-mono font-extrabold uppercase transition-all tracking-wider text-center cursor-pointer ${
                      selectedSizeFilter === sz 
                        ? 'bg-black border-black text-white' 
                        : 'bg-white border-neutral-150 hover:border-black text-neutral-600'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. COLORWAY FILTERS */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-[10px] uppercase font-mono font-bold tracking-[0.2em] text-neutral-400">Filter By Color</h4>
              <div className="flex flex-wrap gap-1.5">
                {colorsList.map((col) => {
                  const colorHexes: { [key: string]: string } = {
                    'Navy': '#1A2942',
                    'Black': '#121212',
                    'Green': '#1B3B2B',
                    'White': '#F5F5F7',
                    'Slate': '#5C5D64',
                    'Cloud': '#ECECEC',
                    'Rust': '#A05A3C',
                    'Amber': '#D97706'
                  };
                  const isColorSel = selectedColorFilter === col;
                  return (
                    <button
                      key={col}
                      onClick={() => setSelectedColorFilter(col)}
                      className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full border text-[9px] font-bold uppercase transition-all tracking-wider cursor-pointer ${
                        isColorSel 
                          ? 'border-black bg-black text-white' 
                          : 'border-neutral-150 hover:border-black bg-white text-neutral-600'
                      }`}
                    >
                      {col !== 'All' && (
                        <span 
                          className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" 
                          style={{ backgroundColor: colorHexes[col] || '#ccc' }}
                        />
                      )}
                      <span>{col}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRICE RANGE SLIDER (LKR) */}
            <div className="space-y-2.5 pt-2 border-t border-neutral-100/50">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] uppercase font-mono font-bold tracking-[0.2em] text-neutral-400">Budget Limit (LKR)</h4>
                <span className="text-[10px] font-mono font-extrabold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                  Rs. {maxPriceFilter.toLocaleString()}
                </span>
              </div>
              <div className="space-y-1">
                <input
                  type="range"
                  min={minPossiblePrice}
                  max={maxPossiblePrice}
                  step="100"
                  value={maxPriceFilter > maxPossiblePrice ? maxPossiblePrice : maxPriceFilter < minPossiblePrice ? minPossiblePrice : maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                  className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black hover:accent-neutral-800 transition-colors"
                  id="desktop-price-slider"
                />
                <div className="flex justify-between text-[7px] font-mono text-neutral-400 font-medium">
                  <span>Rs. {minPossiblePrice.toLocaleString()}</span>
                  <span>Rs. {maxPossiblePrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 5. SORT CONTROLS */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-[10px] uppercase font-mono font-bold tracking-[0.2em] text-neutral-400">Sort Pricing</h4>
              <div className="relative inline-flex items-center w-full">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-neutral-50 border border-neutral-150 rounded w-full px-3.5 py-2.5 text-[10px] font-bold tracking-widest uppercase pr-10 outline-none focus:border-black cursor-pointer text-neutral-600 hover:text-black transition-colors"
                >
                  <option value="Default" className="text-neutral-900 bg-white">Default Sort</option>
                  <option value="PriceLowHigh" className="text-neutral-900 bg-white">Price: Low to High</option>
                  <option value="PriceHighLow" className="text-neutral-900 bg-white">Price: High to Low</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3.5 pointer-events-none" />
              </div>
            </div>
          </aside>

          {/* MOBILE TOGGLE & HORIZONTAL SIZEBAR (col-span-12 on mobile, col-span-9 on desktop) */}
          <section className="col-span-12 lg:col-span-9 space-y-6">
            
            {/* Mobile Filter Controller deck (Hides on desktop) */}
            <div className="block lg:hidden space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-100 dark:bg-neutral-900/60 p-2 rounded-lg border border-neutral-150 dark:border-neutral-800 transition-colors">
                <div className="flex items-center gap-1 bg-white dark:bg-neutral-950 p-0.5 rounded border border-neutral-200 dark:border-neutral-800">
                  {['all', 'men', 'women'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => setSelectedGender(gender as any)}
                      className={`px-3 py-1.5 text-[8.5px] font-black uppercase tracking-widest rounded transition-all cursor-pointer ${
                        selectedGender === gender 
                          ? 'bg-black text-white dark:bg-amber-500 dark:text-black' 
                          : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white'
                      }`}
                    >
                      {gender === 'all' ? 'All' : gender}
                    </button>
                  ))}
                </div>

                <div className="relative inline-flex items-center min-w-[130px]">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded px-2.5 py-1.5 text-[8.5px] font-black tracking-widest uppercase pr-8 outline-none focus:border-black dark:focus:border-amber-400 cursor-pointer w-full text-neutral-600 dark:text-neutral-300 font-sans transition-colors"
                  >
                    <option value="Default" className="text-neutral-900 bg-white dark:text-white dark:bg-neutral-900">Sort Collection</option>
                    <option value="PriceLowHigh" className="text-neutral-900 bg-white dark:text-white dark:bg-neutral-900">Price: Low-High</option>
                    <option value="PriceHighLow" className="text-neutral-900 bg-white dark:text-white dark:bg-neutral-900">Price: High-Low</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Horizontal Scrollable Mobile Size selector */}
              <div className="space-y-1.5 bg-neutral-50/55 dark:bg-neutral-900/30 p-3 rounded-lg border border-neutral-100 dark:border-neutral-850">
                <span className="text-[7.5px] font-mono tracking-widest uppercase text-neutral-400 font-bold block">Quick Size Filter</span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 invisible-scrollbar">
                  {sizesList.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSizeFilter(sz)}
                      className={`px-3.5 py-1.5 rounded-full text-[8.5px] font-bold uppercase shrink-0 border transition-all ${
                        selectedSizeFilter === sz 
                          ? 'bg-black border-black text-white dark:bg-amber-500 dark:border-amber-500 dark:text-black' 
                          : 'bg-white border-neutral-200 text-neutral-600 dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Price Budget Slider */}
              <div className="space-y-1.5 bg-neutral-50/55 dark:bg-neutral-900/30 p-3 rounded-lg border border-neutral-100 dark:border-neutral-850">
                <div className="flex items-center justify-between">
                  <span className="text-[7.5px] font-mono tracking-widest uppercase text-neutral-400 font-bold block">Budget Limit (LKR)</span>
                  <span className="text-[9px] font-mono font-black text-neutral-900 dark:text-neutral-100 bg-neutral-150 dark:bg-neutral-855 px-2 py-0.5 rounded">
                    Rs. {maxPriceFilter.toLocaleString()}
                  </span>
                </div>
                <div className="space-y-1">
                  <input
                    type="range"
                    min={minPossiblePrice}
                    max={maxPossiblePrice}
                    step="100"
                    value={maxPriceFilter > maxPossiblePrice ? maxPossiblePrice : maxPriceFilter < minPossiblePrice ? minPossiblePrice : maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-amber-500"
                    id="mobile-price-slider"
                  />
                  <div className="flex justify-between text-[6.5px] font-mono text-neutral-400 dark:text-neutral-500">
                    <span>Rs. {minPossiblePrice.toLocaleString()}</span>
                    <span>Rs. {maxPossiblePrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SKELETON LOADER STATE OR EMPTY LIST CHECK OR MAIN GRID */}
            {isLoading ? (
              /* Custom dynamic loading skeleton cards */
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="space-y-4 animate-pulse text-left border border-neutral-100 dark:border-neutral-850 p-2.5 rounded-md">
                    <div className="aspect-[4/5] bg-neutral-100 dark:bg-neutral-900 rounded" />
                    <div className="space-y-2">
                      <div className="h-3.5 bg-neutral-150 dark:bg-neutral-800 rounded w-2/3" />
                      <div className="h-3 bg-neutral-100 dark:bg-neutral-900 rounded w-1/3" />
                    </div>
                    <div className="flex gap-1">
                      <div className="h-5 bg-neutral-100 dark:bg-neutral-900 rounded-full w-8" />
                      <div className="h-5 bg-neutral-100 dark:bg-neutral-900 rounded-full w-8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-850 rounded-xl shadow-xs">
                <span className="text-4xl block mb-2 leading-none">👕</span>
                <h3 className="text-sm font-serif font-bold text-neutral-900 dark:text-white mt-2 uppercase tracking-wide">No garments match filters</h3>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono mt-1 max-w-xs mx-auto">
                  Try adjusting categories, sizes, or switching colors to match active stock.
                </p>
                <button
                  onClick={() => {
                    setSelectedGender('all');
                    setSelectedCategory('All');
                    setSelectedSizeFilter('All');
                    setSelectedColorFilter('All');
                    setMaxPriceFilter(maxPossiblePrice);
                  }}
                  className="px-6 py-2.5 bg-black dark:bg-amber-500 text-white dark:text-black text-[9px] font-black tracking-widest text-center uppercase border border-neutral-850 dark:border-amber-600 rounded shadow-sm hover:bg-neutral-900 dark:hover:bg-amber-400 mt-4 cursor-pointer font-sans"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* Products Grid Frame with Framer Motion Layout animations */
              <motion.div 
                layout 
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {sortedProducts.map((p, idx) => (
                    <motion.div
                      layout
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ProductCard
                        product={p}
                        currency={currency}
                        onQuickView={(prod) => setActiveProduct(prod)}
                        onAddToCart={(prod, sz) => handleAddToCart(prod, sz, 1)}
                        isWishlisted={wishlist.includes(p.id)}
                        onToggleWishlist={toggleWishlist}
                        index={idx}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </section>
        </div>
      </main>

      {/* PERSISTENT STICKY MOBILE NAVIGATION CONTROLS (col-span-12 on Mobile UI only) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-t border-neutral-150 dark:border-neutral-850 h-16 flex justify-around items-center px-4 shadow-[0_-5px_15px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_-5px_15px_-4px_rgba(0,0,0,0.4)] no-print transition-colors duration-300">
        <button
          onClick={() => {
            setSelectedGender('all');
            setSelectedCategory('All');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center text-center space-y-1 py-1.5 focus:outline-none cursor-pointer w-14"
        >
          <Home className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          <span className="text-[7.5px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-450">Home</span>
        </button>

        <button
          onClick={() => {
            const collEl = document.getElementById('collection');
            if (collEl) {
              collEl.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="flex flex-col items-center justify-center text-center space-y-1 py-1.5 focus:outline-none cursor-pointer w-14"
        >
          <Layers className="w-4 h-4 text-neutral-600 dark:text-neutral-400 animate-pulse" />
          <span className="text-[7.5px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-450">Catalog</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center text-center space-y-1 py-1.5 focus:outline-none cursor-pointer relative w-14"
        >
          <ShoppingBag className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          {totalCartCount > 0 && (
            <span className="absolute top-1 right-3 text-[7.5px] font-black px-1.5 bg-black dark:bg-amber-500 text-white dark:text-black rounded-full leading-none flex items-center justify-center h-4 min-w-4 shadow-sm">
              {totalCartCount}
            </span>
          )}
          <span className="text-[7.5px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-450">Cart</span>
        </button>

        <button
          onClick={() => setIsAdminOpen(true)}
          className="flex flex-col items-center justify-center text-center space-y-1 py-1.5 focus:outline-none cursor-pointer w-14"
        >
          <Settings className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          <span className="text-[7.5px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-450">Admin</span>
        </button>
      </div>

      {/* HOW IT WORKS / WHATSAPP CHANNEL PROCESS DETAILED */}
      <section id="whatsapp-info" className="bg-neutral-950 text-white py-16 border-t border-neutral-900 text-center pb-24 md:pb-16">
        <div className="max-w-2xl mx-auto px-4 space-y-4">
          <div className="inline-flex items-center space-x-1 px-2.5 py-1 bg-neutral-900 text-neutral-400 text-[8px] font-bold tracking-widest uppercase border border-neutral-800 font-mono">
            <MessageSquare className="w-3 h-3 text-emerald-400" />
            <span>Direct WhatsApp Checkout</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-wider uppercase">Frictionless Ordering</h2>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mx-auto">
              Choose your premium boxy fits, enter delivery parameters, and dispatch your order. The checkout generates an elegant order slip direct to Viva on WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* CORE MODAL SYSTEMS & WORKFLOWS LIST */}

      {/* 1. Modal details preview */}
      {activeProduct && (
        <ProductDetailsModal
          product={activeProduct}
          currency={currency}
          onClose={() => setActiveProduct(null)}
          onAddToCart={handleAddToCart}
          allProducts={products}
          onSwitchProduct={(p) => setActiveProduct(p)}
          onAddReview={handleAddReview}
        />
      )}

      {/* 2. Cart drawer slide-out */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        currency={currency}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* 3. Secure checkout wizard */}
      <CheckoutWizard
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        currency={currency}
        whatsappNumber={whatsappNumber}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* 4. Brand inventory Portal Manager */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onUpdateProducts={updatePersistentProducts}
        whatsappNumber={whatsappNumber}
        onUpdateWhatsapp={updatePersistentWhatsApp}
        orders={orders}
        onUpdateOrders={updatePersistentOrders}
        currency={currency}
        apiLogs={apiLogs}
      />

      {/* 4b. Fulfillment Tracking System Portal */}
      <OrderTracker
        isOpen={isOrderTrackerOpen}
        onClose={() => setIsOrderTrackerOpen(false)}
        currency={currency}
        localOrders={orders}
      />

      {/* 5. Permanent Interactive Streetwear Floating WhatsApp Action Hub */}
      <FloatingWhatsApp
        whatsappNumber={whatsappNumber}
        cartItems={cartItems}
        currency={currency}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Esthetic display footer */}
      <footer className="bg-white dark:bg-neutral-950 border-t border-neutral-150 dark:border-neutral-850 py-12 text-center text-xs text-neutral-400 font-medium transition-colors">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="flex flex-col items-center">
            <span className="text-xl font-serif tracking-[0.25em] font-bold text-black dark:text-white select-none">
              REƎD
            </span>
          </div>

          <p className="max-w-md mx-auto text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Colombo streetwear label focused on heavyweight geometry, structural cuts, and direct checkout delivery.
          </p>

          {/* SocialFooter Component Integration */}
          <SocialFooter />

          <div className="flex justify-center space-x-8 text-[10px] uppercase font-semibold tracking-wider text-neutral-500 dark:text-neutral-450">
            <a href="#collection" className="hover:text-black dark:hover:text-amber-400 transition-colors">Catalog</a>
            <a href="#essence" className="hover:text-black dark:hover:text-amber-400 transition-colors">The Standard</a>
            <a href="#whatsapp-info" className="hover:text-black dark:hover:text-amber-400 transition-colors">How it works</a>
          </div>

          <p className="text-[9px] font-mono text-neutral-400 dark:text-neutral-550 font-medium">
            © {new Date().getFullYear()} REƎD Ltd. Colombo, Sri Lanka.
          </p>
        </div>
      </footer>
    </div>
  );
}
