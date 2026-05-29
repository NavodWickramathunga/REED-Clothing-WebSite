import React, { useState, useMemo, useEffect } from 'react';
import { Product, StockStatus, OrderDetails } from '../types';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  PhoneCall, 
  RefreshCw, 
  Search, 
  Download, 
  ArrowUpDown, 
  ChevronDown,
  Edit2,
  Sparkles,
  Cpu,
  Terminal,
  ArrowRight,
  ChevronUp,
  Upload,
  Image as ImageIcon 
} from 'lucide-react';
import { formatCurrency } from '../utils';
import DailyOrdersChart from './DailyOrdersChart';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (updated: Product[]) => void;
  whatsappNumber: string;
  onUpdateWhatsapp: (no: string) => void;
  orders: OrderDetails[];
  onUpdateOrders?: (updated: OrderDetails[]) => void;
  currency: 'USD' | 'LKR';
  apiLogs?: any[];
}

export default function AdminDashboard({
  isOpen,
  onClose,
  products,
  onUpdateProducts,
  whatsappNumber,
  onUpdateWhatsapp,
  orders,
  onUpdateOrders,
  currency,
  apiLogs = [],
}: AdminDashboardProps) {
  if (!isOpen) return null;

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [firebaseUser, setFirebaseUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user && user.email === "navodwickramathunga@gmail.com") {
        setIsAuthenticated(true);
      }
    });
    return unsub;
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setAuthError('');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to authenticate with Google');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
    } catch (err: any) {
      console.error("Sign out error", err);
    }
  };

  // Form states for creating a new product
  const [newProductName, setNewProductName] = useState('');
  
  // --- Gemini API & Copywriter Assistant States ---
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isClearingLogs, setIsClearingLogs] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [newPriceUSD, setNewPriceUSD] = useState<number>(18);
  const [newPriceLKR, setNewPriceLKR] = useState<number>(5400);
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Signature');
  const [newMaterial, setNewMaterial] = useState('100% Cotton Crewneck');
  const [newColorName, setNewColorName] = useState('Signature Grey');
  const [newColorValue, setNewColorValue] = useState('#8A8A8A');
  const [newImgUrl, setNewImgUrl] = useState('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80');
  const [newSizes, setNewSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [newGender, setNewGender] = useState<'men' | 'women' | 'unisex'>('men');
  const [newImagesInput, setNewImagesInput] = useState('');
  
  // Orders query states
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderSearchInput, setOrderSearchInput] = useState('');
  const [orderProductSearchQuery, setOrderProductSearchQuery] = useState('');
  const [orderStartDate, setOrderStartDate] = useState('');
  const [orderEndDate, setOrderEndDate] = useState('');
  const [orderFulfillmentFilter, setOrderFulfillmentFilter] = useState<'All' | 'Pending' | 'Processing' | 'Shipped'>('All');
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [orderSortBy, setOrderSortBy] = useState<'dateNewest' | 'dateOldest' | 'priceHighLow' | 'priceLowHigh'>('dateNewest');

  // Debounce order general search input changes to avoid excessive list filtering
  useEffect(() => {
    const handler = setTimeout(() => {
      setOrderSearchQuery(orderSearchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [orderSearchInput]);

  // Compute live queue counts for each fulfillment status dynamically
  const pendingCount = useMemo(() => orders.filter((o) => (o.fulfillmentStatus || 'Pending') === 'Pending').length, [orders]);
  const processingCount = useMemo(() => orders.filter((o) => o.fulfillmentStatus === 'Processing').length, [orders]);
  const shippedCount = useMemo(() => orders.filter((o) => o.fulfillmentStatus === 'Shipped').length, [orders]);
  const [selectedDetailedOrder, setSelectedDetailedOrder] = useState<OrderDetails | null>(null);

  // Inline product editing
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPriceUSD, setEditingPriceUSD] = useState<number>(0);
  const [editingPriceLKR, setEditingPriceLKR] = useState<number>(0);
  const [editingStock, setEditingStock] = useState<number>(0);
  const [editingImgUrl, setEditingImgUrl] = useState('');
  const [editingHoverImgUrl, setEditingHoverImgUrl] = useState('');
  const [editingImagesInput, setEditingImagesInput] = useState('');
  const [editingGender, setEditingGender] = useState<'men' | 'women' | 'unisex'>('men');
  
  // Selected orders for bulk fulfillment operations
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  // Auto refresh states
  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());

  // Quick low stock query and bulk status editing overrides
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Live SMTP Brand Manager Email Simulation State
  const [emailAlerts, setEmailAlerts] = useState<{
    id: string;
    timestamp: string;
    to: string;
    subject: string;
    body: string;
    productName: string;
    status: string;
  }[]>([]);
  const [activeToast, setActiveToast] = useState<{ title: string; desc: string } | null>(null);

  const readImageAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleSingleImageUpload = async (
    file: File | undefined,
    setUrl: React.Dispatch<React.SetStateAction<string>>,
    label: string
  ) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(`Please choose an image file for ${label}.`);
      return;
    }

    try {
      const dataUrl = await readImageAsDataUrl(file);
      setUrl(dataUrl);
    } catch (error) {
      console.error(`Failed to read ${label} image`, error);
      alert(`Could not load the selected ${label.toLowerCase()} image.`);
    }
  };

  const handleGalleryUpload = async (
    files: FileList | null,
    setInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('Please choose image files for the gallery upload.');
      return;
    }

    try {
      const dataUrls = await Promise.all(imageFiles.map((file) => readImageAsDataUrl(file)));
      setInput((current) => [current, ...dataUrls].filter(Boolean).join(', '));
    } catch (error) {
      console.error('Failed to read gallery images', error);
      alert('Could not load one or more gallery images.');
    }
  };

  const triggerSimulatedEmailAlert = (productName: string, status: string) => {
    const newAlert = {
      id: 'EMAIL-' + Math.floor(10000 + Math.random() * 90000),
      timestamp: new Date().toLocaleTimeString(),
      to: 'brandmanager@reed.lk',
      subject: `🚨 [Stock Alert] "${productName}" is now ${status.toUpperCase()}`,
      body: `Hi Team,\n\nThis is an automated stock velocity notice. The item "${productName}" was manually updated to "${status}" in the inventory panel.\n\nPlease review immediate order demand and forward supplier yarn/embroidery requirements accordingly.\n\nWarm regards,\nREƎD Admin Engine`,
      productName,
      status
    };
    setEmailAlerts(prev => [newAlert, ...prev]);
    setActiveToast({
      title: `📧 Simulated Email ALERT Dispatched!`,
      desc: `Alert sent to brandmanager@reed.lk: "${productName}" changed to "${status}"`
    });
    // Autoclear toast nicely
    setTimeout(() => {
      setActiveToast(prev => {
        if (prev?.desc.includes(productName)) return null;
        return prev;
      });
    }, 6000);
  };

  const handleGenerateAi = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGeneratingAi(true);
    const startTime = Date.now();
    try {
      const resp = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await resp.json();
      const endTime = Date.now();
      const latency = endTime - startTime;

      if (data.success) {
        setAiResult(data.text);
        
        // Log to Firebase Firestore gemini_api_logs securely
        try {
          const { collection, addDoc } = await import('firebase/firestore');
          const { db } = await import('../firebase');
          await addDoc(collection(db, 'gemini_api_logs'), {
            timestamp: new Date().toISOString(),
            prompt: aiPrompt,
            status: 'Success',
            response: data.text,
            latency,
            model: 'gemini-3.5-flash',
          });
        } catch (dbErr) {
          console.error("Failed to write Gemini log to Firestore:", dbErr);
        }
      } else {
        const errMsg = data.error || 'Failed to generate content';
        setAiResult(`Error: ${errMsg}`);
        
        try {
          const { collection, addDoc } = await import('firebase/firestore');
          const { db } = await import('../firebase');
          await addDoc(collection(db, 'gemini_api_logs'), {
            timestamp: new Date().toISOString(),
            prompt: aiPrompt,
            status: 'Error',
            response: errMsg,
            latency,
            model: 'gemini-3.5-flash',
          });
        } catch (dbErr) {
          console.error("Failed to write Gemini error log to Firestore:", dbErr);
        }
      }
    } catch (err: any) {
      const errMsg = err.message || String(err);
      setAiResult(`Network Error: ${errMsg}`);
      const latency = Date.now() - startTime;

      try {
        const { collection, addDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        await addDoc(collection(db, 'gemini_api_logs'), {
          timestamp: new Date().toISOString(),
          prompt: aiPrompt,
          status: 'Error',
          response: errMsg,
          latency,
          model: 'gemini-3.5-flash',
        });
      } catch (dbErr) {
        console.error("Failed to write network error to log:", dbErr);
      }
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all Gemini API request logs in Firestore?")) return;
    setIsClearingLogs(true);
    try {
      const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      const qSnap = await getDocs(collection(db, 'gemini_api_logs'));
      const deletePromises = qSnap.docs.map(d => deleteDoc(doc(db, 'gemini_api_logs', d.id)));
      await Promise.all(deletePromises);
    } catch (err) {
      console.error("Failed to clear logs:", err);
    } finally {
      setIsClearingLogs(false);
    }
  };

  const handleBulkUpdateStatus = (status: StockStatus) => {
    if (selectedProductIds.length === 0) return;
    if (status === 'Few Left' || status === 'Out of Stock') {
      selectedProductIds.forEach((id) => {
        const product = products.find(p => p.id === id);
        if (product) {
          triggerSimulatedEmailAlert(product.name, status);
        }
      });
    }
    const updated = products.map((p) => {
      if (selectedProductIds.includes(p.id)) {
        return { ...p, status };
      }
      return p;
    });
    onUpdateProducts(updated);
    setSelectedProductIds([]);
  };

  const handleBulkDeleteProducts = () => {
    if (selectedProductIds.length === 0) return;
    const updated = products.filter((p) => !selectedProductIds.includes(p.id));
    onUpdateProducts(updated);
    setSelectedProductIds([]);
    setIsBulkDeleteConfirmOpen(false);
  };

  const dailyOrdersData = useMemo(() => {
    const counts: { [date: string]: { count: number; totalLKR: number; totalUSD: number } } = {};
    const dayMs = 24 * 60 * 60 * 1000;
    
    // Seed preceding 7 calendar dates to show a beautiful dashboard state even without sales
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * dayMs);
      const key = d.toISOString().slice(0, 10);
      counts[key] = { count: 0, totalLKR: 0, totalUSD: 0 };
    }

    orders.forEach((o) => {
      try {
        const dateKey = o.timestamp.slice(0, 10);
        if (counts[dateKey]) {
          counts[dateKey].count += 1;
          counts[dateKey].totalLKR += o.totalLKR;
          counts[dateKey].totalUSD += o.totalUSD;
        } else {
          counts[dateKey] = {
            count: 1,
            totalLKR: o.totalLKR,
            totalUSD: o.totalUSD
          };
        }
      } catch (err) {
        // Robust boundary
      }
    });

    return Object.entries(counts)
      .map(([date, val]) => ({
        date,
        count: val.count,
        totalLKR: val.totalLKR,
        totalUSD: val.totalUSD,
        label: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [orders]);

  const displayedInventoryProducts = useMemo(() => {
    return filterLowStockOnly 
      ? products.filter(p => p.status === 'Few Left' || p.status === 'Out of Stock') 
      : products;
  }, [products, filterLowStockOnly]);

  const isAllDisplayedSelected = useMemo(() => {
    return displayedInventoryProducts.length > 0 && displayedInventoryProducts.every(p => selectedProductIds.includes(p.id));
  }, [displayedInventoryProducts, selectedProductIds]);

  const handleToggleSelectAll = () => {
    if (isAllDisplayedSelected) {
      const displayedIds = displayedInventoryProducts.map(p => p.id);
      setSelectedProductIds(selectedProductIds.filter(id => !displayedIds.includes(id)));
    } else {
      const displayedIds = displayedInventoryProducts.map(p => p.id);
      const uniqueNewIds = Array.from(new Set([...selectedProductIds, ...displayedIds]));
      setSelectedProductIds(uniqueNewIds);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = orderSearchQuery.toLowerCase().trim();
    const matchesGeneral = !q || (
      o.orderId.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q)
    );

    const pq = orderProductSearchQuery.toLowerCase().trim();
    const matchesProduct = !pq || o.items.some((item) => 
      item.productName.toLowerCase().includes(pq)
    );

    let matchesDate = true;
    if (orderStartDate || orderEndDate) {
      try {
        const orderTime = new Date(o.timestamp).getTime();
        
        if (orderStartDate) {
          const startTimestamp = new Date(orderStartDate + 'T00:00:00').getTime();
          if (isNaN(orderTime) || orderTime < startTimestamp) {
            matchesDate = false;
          }
        }
        
        if (orderEndDate) {
          const endTimestamp = new Date(orderEndDate + 'T23:59:59').getTime();
          if (isNaN(orderTime) || orderTime > endTimestamp) {
            matchesDate = false;
          }
        }
      } catch (e) {
        console.error("Error parsing order timestamp", e);
      }
    }

    const matchesFulfillment = orderFulfillmentFilter === 'All' || 
      (o.fulfillmentStatus || 'Pending') === orderFulfillmentFilter;

    return matchesGeneral && matchesProduct && matchesDate && matchesFulfillment;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (orderSortBy === 'dateNewest') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    if (orderSortBy === 'dateOldest') {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    }
    if (orderSortBy === 'priceHighLow') {
      const valA = currency === 'USD' ? a.totalUSD : a.totalLKR;
      const valB = currency === 'USD' ? b.totalUSD : b.totalLKR;
      return valB - valA;
    }
    if (orderSortBy === 'priceLowHigh') {
      const valA = currency === 'USD' ? a.totalUSD : a.totalLKR;
      const valB = currency === 'USD' ? b.totalUSD : b.totalLKR;
      return valA - valB;
    }
    return 0;
  });

  // Summary stats calculations (Top Paying Customer & Average Order Value)
  const orderSummaryStats = useMemo(() => {
    if (filteredOrders.length === 0) {
      return {
        topCustomerName: 'No orders recorded yet',
        topCustomerUSD: 0,
        topCustomerLKR: 0,
        averageOrderValueUSD: 0,
        averageOrderValueLKR: 0,
        totalOrdersCount: 0,
        totalRevenueUSD: 0,
        totalRevenueLKR: 0,
        successfulPaidCount: 0,
      };
    }

    const customerTotals: { [name: string]: { lkr: number; usd: number } } = {};
    let sumLKR = 0;
    let sumUSD = 0;
    let successfulPaidCount = 0;

    filteredOrders.forEach((o) => {
      const name = o.customerName || 'Anonymous';
      if (!customerTotals[name]) {
        customerTotals[name] = { lkr: 0, usd: 0 };
      }
      customerTotals[name].lkr += o.totalLKR;
      customerTotals[name].usd += o.totalUSD;
      sumLKR += o.totalLKR;
      sumUSD += o.totalUSD;
      if (o.paymentStatus === 'Paid' || o.paymentMethod === 'Card') {
        successfulPaidCount++;
      }
    });

    let topCust = 'No orders recorded yet';
    let topUSD = 0;
    let topLKR = 0;

    Object.entries(customerTotals).forEach(([name, totals]) => {
      if (totals.usd > topUSD) {
        topUSD = totals.usd;
        topLKR = totals.lkr;
        topCust = name;
      }
    });

    return {
      topCustomerName: topCust,
      topCustomerUSD: topUSD,
      topCustomerLKR: topLKR,
      averageOrderValueUSD: sumUSD / filteredOrders.length,
      averageOrderValueLKR: sumLKR / filteredOrders.length,
      totalOrdersCount: filteredOrders.length,
      totalRevenueUSD: sumUSD,
      totalRevenueLKR: sumLKR,
      successfulPaidCount: successfulPaidCount,
    };
  }, [filteredOrders]);

  // Order selection helpers
  const isAllOrdersSelected = useMemo(() => {
    return sortedOrders.length > 0 && sortedOrders.every((o) => selectedOrderIds.includes(o.orderId));
  }, [sortedOrders, selectedOrderIds]);

  const handleToggleSelectAllOrders = () => {
    if (isAllOrdersSelected) {
      const sortedIds = sortedOrders.map((o) => o.orderId);
      setSelectedOrderIds(selectedOrderIds.filter((id) => !sortedIds.includes(id)));
    } else {
      const sortedIds = sortedOrders.map((o) => o.orderId);
      const uniqueNewIds = Array.from(new Set([...selectedOrderIds, ...sortedIds]));
      setSelectedOrderIds(uniqueNewIds);
    }
  };

  // Auto-refresh handler polling every 30 seconds
  React.useEffect(() => {
    if (!isAutoRefreshActive) return;
    
    const token = setInterval(() => {
      setLastSyncTime(new Date().toLocaleTimeString());
    }, 30000);

    return () => clearInterval(token);
  }, [isAutoRefreshActive]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // A simple, accessible password code that can easily be shared, e.g., "viva123"
    if (password === 'viva123' || password === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid code. Try using "viva123" or "admin".');
    }
  };

  const handleUpdateStatus = (productId: string, status: StockStatus) => {
    const product = products.find(p => p.id === productId);
    if (product && (status === 'Few Left' || status === 'Out of Stock')) {
      triggerSimulatedEmailAlert(product.name, status);
    }
    const updated = products.map((p) => {
      if (p.id === productId) {
        let updatedStock = p.stock;
        if (status === 'Out of Stock') {
          updatedStock = 0;
        } else if (status === 'Few Left') {
          updatedStock = 3;
        } else if (status === 'In Stock') {
          updatedStock = (p.stock !== undefined && p.stock >= 5) ? p.stock : 15;
        }
        return { 
          ...p, 
          status, 
          stock: updatedStock 
        };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  const handleSaveInlineEdit = (productId: string) => {
    if (!editingName.trim()) {
      alert("Product name cannot be empty.");
      return;
    }
    if (isNaN(editingPriceUSD) || editingPriceUSD < 0 || isNaN(editingPriceLKR) || editingPriceLKR < 0) {
      alert("Prices must be valid positive numbers.");
      return;
    }
    if (isNaN(editingStock) || editingStock < 0) {
      alert("Stock level must be a non-negative number.");
      return;
    }
    
    // Auto-compute Stock Status based on value
    let targetStatus: StockStatus = 'In Stock';
    if (editingStock === 0) {
      targetStatus = 'Out of Stock';
    } else if (editingStock < 5) {
      targetStatus = 'Few Left';
    }
    
    const extraImages = editingImagesInput
      ? editingImagesInput.split(',').map((url) => url.trim()).filter(Boolean)
      : [];

    const updated = products.map((p) => {
      if (p.id === productId) {
        // Prepare updated colors array by modifying the first color image URL or adding one
        let updatedColors = p.colors || [];
        if (updatedColors.length > 0) {
          updatedColors = updatedColors.map((col, idx) => {
            if (idx === 0) {
              return { ...col, imageUrl: editingImgUrl.trim() };
            }
            return col;
          });
        } else {
          updatedColors = [{
            name: 'Standard',
            value: '#8A8A8A',
            imageUrl: editingImgUrl.trim()
          }];
        }

        return {
          ...p,
          name: editingName.trim(),
          priceUSD: editingPriceUSD,
          priceLKR: editingPriceLKR,
          stock: editingStock,
          status: targetStatus,
          colors: updatedColors,
          hoverImageUrl: editingHoverImgUrl.trim() || undefined,
          images: extraImages,
          gender: editingGender
        };
      }
      return p;
    });
    onUpdateProducts(updated);
    setEditingProductId(null);
  };

  const handleToggleSize = (productId: string, size: string) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const sizes = p.sizes.includes(size)
          ? p.sizes.filter((s) => s !== size)
          : [...p.sizes, size];
        return { ...p, sizes };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newImgUrl) {
      alert('Please fill out the product name and image URL fields.');
      return;
    }

    const extraImages = newImagesInput
      ? newImagesInput.split(',').map((url) => url.trim()).filter(Boolean)
      : [];

    const newProd: Product = {
      id: 'reed-' + Math.floor(1000 + Math.random() * 9000),
      name: newProductName,
      priceUSD: Number(newPriceUSD),
      priceLKR: Number(newPriceLKR),
      description: newDescription || 'Premium apparel item designed with premium structures.',
      colors: [
        {
          name: newColorName,
          value: newColorValue,
          imageUrl: newImgUrl,
        },
      ],
      sizes: newSizes,
      status: 'In Stock',
      category: newCategory,
      material: newMaterial,
      features: ['Bespoke embroidery design', 'Reinforced neck stitching', 'Signature fit'],
      gender: newGender,
      images: extraImages,
    };

    onUpdateProducts([...products, newProd]);
    
    // reset fields
    setNewProductName('');
    setNewDescription('');
    setNewImgUrl('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80');
    setNewImagesInput('');
    setNewGender('men');
    alert('Product added successfully!');
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to remove this product from the inventory?')) {
      const updated = products.filter((p) => p.id !== id);
      onUpdateProducts(updated);
    }
  };

  const downloadOrdersCSV = () => {
    if (sortedOrders.length === 0) return;
    
    // CSV headers matching the detailed schema
    const headers = [
      'Order ID',
      'Date & Time',
      'Customer Name',
      'Phone Number',
      'Email Address',
      'Shipping Address',
      'City',
      'Postal Code',
      'Payment Method',
      'Payment Status',
      'Fulfillment Status',
      'Payment Reference',
      'Total (LKR)',
      'Total (USD)',
      'Items Detail',
      'Notes'
    ];

    const rows = sortedOrders.map((o) => {
      // Escape field text to prevent issues on commas
      const cleanName = o.customerName.replace(/"/g, '""');
      const cleanAddress = o.address.replace(/"/g, '""');
      const cleanCity = o.city.replace(/"/g, '""');
      const cleanNotes = (o.notes || '').replace(/"/g, '""');
      const cleanRef = (o.paymentReference || '').replace(/"/g, '""');
      
      const itemsSummary = o.items
        .map((itm) => `${itm.productName} [${itm.color} / ${itm.size}] (Qty: ${itm.quantity})`)
        .join('; ');
      const cleanItems = itemsSummary.replace(/"/g, '""');

      return [
        o.orderId,
        o.timestamp,
        `"${cleanName}"`,
        `"${o.phone}"`,
        `"${o.email}"`,
        `"${cleanAddress}"`,
        `"${cleanCity}"`,
        `"${o.postalCode}"`,
        o.paymentMethod,
        o.paymentStatus,
        o.fulfillmentStatus || 'Pending',
        `"${cleanRef}"`,
        o.totalLKR,
        o.totalUSD,
        `"${cleanItems}"`,
        `"${cleanNotes}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `REED_Orders_Filtered_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTogglePaymentStatus = (orderId: string) => {
    if (!onUpdateOrders) return;
    const updated = orders.map((o) => {
      if (o.orderId === orderId) {
        const newStatus: 'Pending' | 'Paid' = o.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
        // Auto update cached model view if matches
        if (selectedDetailedOrder && selectedDetailedOrder.orderId === orderId) {
          setSelectedDetailedOrder({ ...selectedDetailedOrder, paymentStatus: newStatus });
        }
        return { ...o, paymentStatus: newStatus };
      }
      return o;
    });
    onUpdateOrders(updated);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (!onUpdateOrders) return;
    if (confirm(`Are you sure you want to delete order #${orderId}? This cannot be undone.`)) {
      const updated = orders.filter((o) => o.orderId !== orderId);
      onUpdateOrders(updated);
      setSelectedDetailedOrder(null);
    }
  };

  const handleUpdateFulfillmentStatus = (orderId: string, newFulfill: 'Pending' | 'Processing' | 'Shipped') => {
    if (!onUpdateOrders) return;
    const updated = orders.map((o) => {
      if (o.orderId === orderId) {
        if (selectedDetailedOrder && selectedDetailedOrder.orderId === orderId) {
          setSelectedDetailedOrder({ ...selectedDetailedOrder, fulfillmentStatus: newFulfill });
        }
        return { ...o, fulfillmentStatus: newFulfill };
      }
      return o;
    });
    onUpdateOrders(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header Indicator */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-900 text-white">
          <div className="flex items-center space-x-2">
            <span className="p-1 px-2.5 bg-amber-500 rounded-sm text-[9px] font-bold uppercase text-black font-mono">
              BRAND PORTAL
            </span>
            <h2 className="text-md font-serif font-extrabold tracking-tight">REƎD Admin Workspace</h2>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated && firebaseUser && (
              <div className="hidden sm:flex items-center space-x-2 text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Firebase Active</span>
              </div>
            )}
            {isAuthenticated && firebaseUser && (
              <button
                onClick={handleSignOut}
                className="text-[10px] uppercase font-mono font-bold tracking-widest text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-500 px-2 py-1 rounded transition-all cursor-pointer"
              >
                Sign Out
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-white transition-all cursor-pointer"
              id="close-admin-portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AUTHENTICATION GATE */}
        {!isAuthenticated ? (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto space-y-5">
            <div className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/90 p-5 text-left shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <Lock className="w-10 h-10 text-neutral-900 shrink-0" />
                <div>
                  <h3 className="text-md font-serif font-bold text-neutral-900">Protected Workspace</h3>
                  <p className="text-[11px] uppercase tracking-[0.28em] font-black text-neutral-500">Admin access gate</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-neutral-700 leading-6">
                  This panel is the control room for product updates, stock changes, order monitoring, and brand image refreshes.
                </p>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Unlock it with the shared admin code, or use Google sign-in for cloud Firestore access. Once inside, you can update product photos directly from the same screen.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-neutral-200 bg-white p-3">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">Inventory</p>
                  <p className="mt-1 text-xs text-neutral-700 leading-5">Adjust prices, stock, sizes, and status in one place.</p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white p-3">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">Media</p>
                  <p className="mt-1 text-xs text-neutral-700 leading-5">Replace the main image, hover image, or gallery photos.</p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white p-3">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">Orders</p>
                  <p className="mt-1 text-xs text-neutral-700 leading-5">Track live order records, fulfillment status, and exports.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="w-full max-w-md space-y-3 text-left">
              <label htmlFor="admin-password-input" className="block text-[10px] uppercase font-bold tracking-widest text-neutral-600 font-mono">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (use 'viva123')"
                  autoComplete="current-password"
                  spellCheck={false}
                  className="w-full pl-3 pr-10 py-3 border border-neutral-400 bg-white text-neutral-950 placeholder-neutral-500 rounded-lg text-sm font-mono font-bold tracking-widest outline-none shadow-sm focus:ring-2 focus:ring-black focus:border-black transition-all"
                  id="admin-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 transition-colors focus:outline-none pointer-events-auto cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5" />
                  ) : (
                    <Eye className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Tip: use the eye icon if you want to see the characters while typing.
              </p>
              {authError && <div className="text-[10px] text-red-500 font-semibold font-mono">{authError}</div>}
              <button
                type="submit"
                className="w-full py-3 bg-neutral-950 hover:bg-black text-white rounded-lg text-xs font-bold tracking-wider uppercase transition-colors pointer-events-auto cursor-pointer shadow-sm"
                id="admin-auth-submit"
              >
                Unlock Dashboard with Password
              </button>
            </form>

            <div className="flex items-center justify-center space-x-2 w-full py-2">
              <div className="h-[1px] bg-neutral-200 flex-grow"></div>
              <span className="text-[10px] text-neutral-400 font-mono uppercase bg-white px-2">or</span>
              <div className="h-[1px] bg-neutral-200 flex-grow"></div>
            </div>

            <div className="w-full space-y-2">
              {firebaseUser ? (
                <div className="space-y-2">
                  <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200 text-xs text-left">
                    <p className="text-neutral-500 text-[11px] uppercase tracking-wider">Signed in as:</p>
                    <p className="font-mono text-neutral-800 font-bold overflow-hidden text-ellipsis">{firebaseUser.email}</p>
                    {firebaseUser.email === "navodwickramathunga@gmail.com" ? (
                      <p className="text-green-600 text-[10px] font-medium mt-1">✓ Authorized Admin (Sync Live!)</p>
                    ) : (
                      <p className="text-amber-600 text-[10px] mt-1 leading-normal">
                        ⚠ Unauthorized Email. Sign in as <strong>navodwickramathunga@gmail.com</strong> for Cloud Writes, or unlock locally using the password above.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full py-2 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 rounded text-xs font-medium cursor-pointer"
                  >
                    Disconnect Google Account
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 hover:bg-neutral-50 border border-neutral-300 text-neutral-800 rounded text-xs font-bold transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* MAIN UNLOCKED INTERFACE GRID */
          <div className="flex-grow overflow-y-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT AREA: STOCK CONTROLS & GENERAL SETTINGS (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Phone dispatch config */}
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100 space-y-3 font-sans">
                <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">WhatsApp Order Dispatcher</span>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    required
                    value={whatsappNumber}
                    onChange={(e) => onUpdateWhatsapp(e.target.value)}
                    placeholder="Recipient phone, e.g., +94712345678"
                    className="flex-grow px-3 py-2 border border-neutral-300 rounded text-xs font-mono outline-none focus:ring-1 focus:ring-black bg-white text-neutral-900 font-bold"
                  />
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1 flex-shrink-0 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Active Live</span>
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 leading-normal">
                  Orders submitted through the checkout flow are forwarded as a custom pre-loaded text directly to this phone number on WhatsApp.
                </p>
              </div>

              {/* Summary Stats Block: Total Revenue, successful transactions, average value, top customer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                {/* Total Revenue Bento card */}
                <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-3xs hover:border-neutral-350 transition-colors text-left space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-neutral-400">
                    <span className="p-1 bg-emerald-50 text-emerald-700 rounded-sm text-[8px] font-mono font-bold uppercase tracking-wider">Revenue</span>
                    <span className="text-[9px] uppercase font-bold tracking-widest">Total Revenue</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-serif font-extrabold text-neutral-900">
                      {formatCurrency(orderSummaryStats.totalRevenueLKR, 'LKR')}
                    </p>
                    <p className="text-[10.5px] text-emerald-600 font-mono font-bold">
                      {formatCurrency(orderSummaryStats.totalRevenueUSD, 'USD')} LKR equiv.
                    </p>
                  </div>
                  <p className="text-[9.5px] text-neutral-400 font-medium leading-relaxed">
                    Gross cumulative volume computed from standard checkout receipts.
                  </p>
                </div>

                {/* Successful Transactions Bento card */}
                <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-3xs hover:border-neutral-350 transition-colors text-left space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-neutral-400">
                    <span className="p-1 bg-blue-50 text-blue-700 rounded-sm text-[8px] font-mono font-bold uppercase tracking-wider">Volume</span>
                    <span className="text-[9px] uppercase font-bold tracking-widest">Transactions</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-serif font-extrabold text-neutral-900">
                      {orderSummaryStats.totalOrdersCount} Completed
                    </p>
                    <p className="text-[10.5px] text-neutral-500 font-mono">
                      {orderSummaryStats.successfulPaidCount} Paid Receipts
                    </p>
                  </div>
                  <p className="text-[9.5px] text-neutral-400 font-medium leading-relaxed">
                    Total checkout checkpoints that proceeded to WhatsApp dispatch.
                  </p>
                </div>

                {/* Average Order Value Bento card */}
                <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-3xs hover:border-neutral-350 transition-colors text-left space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-neutral-400">
                    <span className="p-1 bg-neutral-100 rounded-sm text-[8px] font-mono font-bold uppercase tracking-wider">Metrics</span>
                    <span className="text-[9px] uppercase font-bold tracking-widest">Average Value</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-serif font-extrabold text-neutral-900">
                      {formatCurrency(orderSummaryStats.averageOrderValueLKR, 'LKR')}
                    </p>
                    <p className="text-[10.5px] text-neutral-500 font-mono">
                      approx. {formatCurrency(orderSummaryStats.averageOrderValueUSD, 'USD')} USD
                    </p>
                  </div>
                  <p className="text-[9.5px] text-neutral-400 font-medium leading-relaxed">
                    Average basket transaction density calculated from checkout session logs.
                  </p>
                </div>

                {/* Top Paying Customer Bento card */}
                <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-3xs hover:border-neutral-350 transition-colors text-left space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-neutral-400">
                    <span className="p-1 bg-neutral-100 rounded-sm text-[8px] font-mono font-bold uppercase tracking-wider">Demographics</span>
                    <span className="text-[9px] uppercase font-bold tracking-widest">Top Customer</span>
                  </div>
                  <div className="space-y-1 flex-grow">
                    <p className="text-xs font-sans font-extrabold text-neutral-900 truncate" title={orderSummaryStats.topCustomerName}>
                      {orderSummaryStats.topCustomerName}
                    </p>
                    <p className="text-[11.5px] text-emerald-600 font-extrabold font-mono">
                      Total: {formatCurrency(orderSummaryStats.topCustomerLKR, 'LKR')}
                    </p>
                  </div>
                  <p className="text-[9.5px] text-neutral-400 font-medium leading-relaxed">
                    Highest aggregate purchasing index computed across historical invoice files.
                  </p>
                </div>
              </div>

              {/* D3-based Daily Orders Visualization */}
              <DailyOrdersChart data={dailyOrdersData} currency={currency} />

              {/* Product catalog management list */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-neutral-100 pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600">
                    Current Inventory ({displayedInventoryProducts.length} of {products.length})
                  </h3>
                  <p className="text-[10px] lowercase text-neutral-400 font-normal">Click size toggle to enable or disable</p>
                </div>

                {/* LOW STOCK FILTER & BULK CONTROLS CONTAINER */}
                <div className="mb-4 bg-neutral-50 border border-neutral-200 rounded-lg p-3.5 space-y-3.5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Toggle Selector */}
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        id="toggle-low-stock-only"
                        checked={filterLowStockOnly}
                        onChange={(e) => {
                          setFilterLowStockOnly(e.target.checked);
                          // Clear selection when filter updates to avoid stale select references
                          setSelectedProductIds([]);
                        }}
                        className="w-4 h-4 accent-black rounded text-black cursor-pointer bg-white border border-neutral-300"
                      />
                      <label htmlFor="toggle-low-stock-only" className="text-xs font-bold text-neutral-705 cursor-pointer select-none">
                        Filter 'Few Left' & 'Out of Stock' items for management
                      </label>
                    </div>

                    {/* Checkbox Select All display */}
                    {displayedInventoryProducts.length > 0 && (
                      <button
                        onClick={handleToggleSelectAll}
                        type="button"
                        className="text-[10px] font-extrabold text-neutral-500 hover:text-black uppercase tracking-wider cursor-pointer font-sans"
                      >
                        {isAllDisplayedSelected ? "☑ Deselect All" : "☐ Select All Displayed"}
                      </button>
                    )}
                  </div>

                  {/* Bulk updates row */}
                  {selectedProductIds.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-200/80 animate-fade-in">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[11px] font-bold text-neutral-800 font-mono">
                          {selectedProductIds.length} apparel item(s) selected
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase font-sans tracking-wide">Change Status:</span>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleBulkUpdateStatus(e.target.value as StockStatus);
                              e.target.value = ""; // Reset dropdown index
                            }
                          }}
                          defaultValue=""
                          className="text-[10.5px] font-extrabold px-2.5 py-1.5 bg-white border border-neutral-300 rounded cursor-pointer text-black font-sans uppercase tracking-wider outline-none focus:ring-1 focus:ring-black"
                        >
                          <option value="" disabled className="text-neutral-500 bg-white">Choose status...</option>
                          <option value="In Stock" className="text-neutral-900 bg-white">In Stock (Available)</option>
                          <option value="Few Left" className="text-neutral-900 bg-white">Few Left (Low Stock)</option>
                          <option value="Out of Stock" className="text-neutral-900 bg-white">Out of Stock (Sold Out)</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => setIsBulkDeleteConfirmOpen(true)}
                          className="text-[10.5px] font-extrabold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 uppercase tracking-wider border border-red-200 px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1 shadow-3xs"
                          title="Permanently delete selected products"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Selected</span>
                        </button>

                        <button
                          onClick={() => setSelectedProductIds([])}
                          type="button"
                          className="text-[10px] font-extrabold text-neutral-400 hover:text-black uppercase tracking-wider border border-neutral-250 px-2.5 py-1.5 rounded bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {displayedInventoryProducts.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-neutral-200 rounded-lg border-dashed">
                    <p className="text-xs font-semibold text-neutral-400 italic font-mono">No inventory products fit this stock query.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayedInventoryProducts.map((product) => {
                      const isSelected = selectedProductIds.includes(product.id);
                      const unitsLeft = product.stock !== undefined ? product.stock : (product.status === 'Out of Stock' ? 0 : product.status === 'Few Left' ? 3 : 15);
                      const isLowStock = unitsLeft < 5;
                      
                      const cardStyle = isSelected 
                        ? 'border-neutral-900 bg-neutral-50 shadow-xs ring-1 ring-neutral-905' 
                        : isLowStock 
                          ? 'border-red-200 border-l-red-500 border-l-4 bg-red-50/15 hover:border-red-300 hover:bg-gradient-to-r hover:from-red-50/20 hover:to-white'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white';
                      
                      return (
                        <div 
                          key={product.id} 
                          className={`p-4 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 ${cardStyle}`}
                        >
                          <div className="flex items-center space-x-3.5">
                            {/* Checkbox item */}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProductIds([...selectedProductIds, product.id]);
                                } else {
                                  setSelectedProductIds(selectedProductIds.filter(id => id !== product.id));
                                }
                              }}
                              className="w-4 h-4 accent-black rounded text-black cursor-pointer border border-neutral-300 shadow-3xs flex-shrink-0"
                              id={`select-product-${product.id}`}
                            />

                            <div className="relative group/thumb cursor-pointer select-none flex-shrink-0" onClick={() => {
                              if (editingProductId !== product.id) {
                                setEditingProductId(product.id);
                                setEditingName(product.name);
                                setEditingPriceUSD(product.priceUSD);
                                setEditingPriceLKR(product.priceLKR);
                                setEditingStock(product.stock !== undefined ? product.stock : (product.status === 'Out of Stock' ? 0 : product.status === 'Few Left' ? 3 : 15));
                                setEditingImgUrl(product.colors && product.colors[0] ? product.colors[0].imageUrl : '');
                                setEditingHoverImgUrl(product.hoverImageUrl || '');
                                setEditingImagesInput(product.images ? product.images.join(', ') : '');
                                setEditingGender(product.gender || 'men');
                              }
                            }} title="Click to quickly change photography & metadata">
                              <img
                                src={product.colors[0]?.imageUrl}
                                alt={product.name}
                                className="w-10 h-12 object-cover rounded bg-neutral-50 border border-neutral-150 shadow-3xs group-hover/thumb:border-neutral-900 group-hover/thumb:opacity-90 transition-all"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/55 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 rounded transition-opacity">
                                <span className="text-[7.5px] text-white font-mono font-black uppercase tracking-wider text-center px-0.5">Edit</span>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              {editingProductId === product.id ? (
                                <div className="space-y-2 my-1 bg-neutral-50 dark:bg-neutral-900/60 p-3.5 rounded-lg border border-neutral-300 dark:border-neutral-800 font-sans shadow-3xs">
                                  <div>
                                    <label className="block text-[10px] uppercase font-bold text-neutral-700 dark:text-neutral-300 font-mono mb-1">Product Title</label>
                                    <input
                                      type="text"
                                      value={editingName}
                                      onChange={(e) => setEditingName(e.target.value)}
                                      className="w-full max-w-sm px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-xs text-neutral-900 dark:text-white font-semibold shadow-3xs"
                                      id={`inline-editing-name-${product.id}`}
                                    />
                                  </div>
                                  <div className="grid grid-cols-3 gap-2.5">
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-neutral-700 dark:text-neutral-300 font-mono mb-1">Price (USD)</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={editingPriceUSD}
                                        onChange={(e) => setEditingPriceUSD(parseFloat(e.target.value) || 0)}
                                        className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-xs font-mono font-bold text-neutral-900 dark:text-white shadow-3xs"
                                        id={`inline-editing-usd-${product.id}`}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-neutral-700 dark:text-neutral-300 font-mono mb-1">Price (LKR)</label>
                                      <input
                                        type="number"
                                        step="50"
                                        value={editingPriceLKR}
                                        onChange={(e) => setEditingPriceLKR(parseFloat(e.target.value) || 0)}
                                        className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-xs font-mono font-bold text-neutral-900 dark:text-white shadow-3xs"
                                        id={`inline-editing-lkr-${product.id}`}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] uppercase font-bold text-neutral-700 dark:text-neutral-300 font-mono mb-1">Units Left</label>
                                      <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={editingStock}
                                        onChange={(e) => setEditingStock(parseInt(e.target.value) || 0)}
                                        className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-xs font-mono font-bold text-neutral-900 dark:text-white shadow-3xs"
                                        id={`inline-editing-stock-${product.id}`}
                                      />
                                    </div>
                                  </div>
                                  
                                  {/* SEAMLESS PHOTOGRAPHY asset update form area */}
                                  <div className="pt-2.5 border-t border-neutral-250 dark:border-neutral-750 space-y-2.5 mt-2 shadow-2xs">
                                    <div className="flex items-center space-x-1">
                                      <span className="text-[10px] uppercase font-black tracking-widest text-neutral-800 dark:text-neutral-250 font-mono">📸 Photography Asset & Media Refresher</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                      <div>
                                        <label className="block text-[9px] uppercase font-bold text-neutral-700 dark:text-neutral-300 font-mono mb-1">Primary Image URL</label>
                                        <input
                                          type="text"
                                          value={editingImgUrl}
                                          onChange={(e) => setEditingImgUrl(e.target.value)}
                                          className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 rounded text-[11px] font-mono text-neutral-900 dark:text-white truncate"
                                        />
                                        <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-850 px-2 py-2 text-[9px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200 hover:border-black hover:text-black transition-colors">
                                          <Upload className="w-3 h-3" />
                                          <span>Upload primary image</span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleSingleImageUpload(e.target.files?.[0], setEditingImgUrl, 'Primary image')}
                                          />
                                        </label>
                                      </div>
                                      <div>
                                        <label className="block text-[9px] uppercase font-bold text-neutral-700 dark:text-neutral-300 font-mono mb-1">Hover Image URL</label>
                                        <input
                                          type="text"
                                          value={editingHoverImgUrl}
                                          onChange={(e) => setEditingHoverImgUrl(e.target.value)}
                                          className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 rounded text-[11px] font-mono text-neutral-900 dark:text-white truncate"
                                        />
                                        <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-850 px-2 py-2 text-[9px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200 hover:border-black hover:text-black transition-colors">
                                          <Upload className="w-3 h-3" />
                                          <span>Upload hover image</span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleSingleImageUpload(e.target.files?.[0], setEditingHoverImgUrl, 'Hover image')}
                                          />
                                        </label>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                      <div className="md:col-span-2">
                                        <label className="block text-[9px] uppercase font-bold text-neutral-700 dark:text-neutral-300 font-mono mb-1">Additional Photos (Comma-Separated)</label>
                                        <input
                                          type="text"
                                          value={editingImagesInput}
                                          onChange={(e) => setEditingImagesInput(e.target.value)}
                                          placeholder="https://image1.com, https://image2.com"
                                          className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 rounded text-[11px] font-mono text-neutral-900 dark:text-white truncate"
                                        />
                                        <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-850 px-2 py-2 text-[9px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200 hover:border-black hover:text-black transition-colors">
                                          <Upload className="w-3 h-3" />
                                          <span>Upload gallery photos</span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={(e) => handleGalleryUpload(e.target.files, setEditingImagesInput)}
                                          />
                                        </label>
                                      </div>
                                      <div>
                                        <label className="block text-[9px] uppercase font-bold text-neutral-700 dark:text-neutral-300 font-mono mb-1">Gender Group</label>
                                        <select
                                          value={editingGender}
                                          onChange={(e) => setEditingGender(e.target.value as 'men' | 'women' | 'unisex')}
                                          className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 rounded text-xs font-mono font-bold text-neutral-700 dark:text-neutral-350 cursor-pointer h-[34px]"
                                        >
                                          <option value="men" className="text-neutral-900 bg-white dark:text-white dark:bg-neutral-800">Men</option>
                                          <option value="women" className="text-neutral-900 bg-white dark:text-white dark:bg-neutral-800">Women</option>
                                          <option value="unisex" className="text-neutral-900 bg-white dark:text-white dark:bg-neutral-800">Unisex</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <h4 className="text-xs font-bold text-neutral-900 tracking-tight line-clamp-1 flex flex-wrap items-center gap-1.5">
                                    <span>{product.name}</span>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] bg-neutral-100 border border-neutral-250 text-neutral-600 text-[8px] font-bold uppercase font-mono">
                                      {product.gender || 'men'}
                                    </span>
                                    {product.status === 'Few Left' && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] bg-amber-50 border border-amber-200 text-amber-600 text-[8px] font-extrabold uppercase animate-pulse font-sans">
                                        Few Left
                                      </span>
                                    )}
                                    {product.status === 'Out of Stock' && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] bg-neutral-900 text-white text-[8px] font-extrabold uppercase border border-neutral-800 font-sans">
                                        Sold Out
                                      </span>
                                    )}
                                    {isLowStock && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-red-500 border border-red-400 text-white text-[7.5px] font-black uppercase font-mono tracking-wider animate-pulse shadow-3xs">
                                        ⚠️ LOW STOCK
                                      </span>
                                    )}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-neutral-900 font-mono font-bold">
                                      {formatCurrency(currency === 'USD' ? product.priceUSD : product.priceLKR, currency)}
                                    </span>
                                    <span className="text-[9px] text-neutral-400 font-mono font-normal">
                                      ({formatCurrency(product.priceUSD, 'USD')} / {formatCurrency(product.priceLKR, 'LKR')})
                                    </span>
                                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ml-1 bg-neutral-100 ${isLowStock ? 'text-red-600 bg-red-100/50 font-black border border-red-200 animate-pulse' : 'text-neutral-500'}`}>
                                      {unitsLeft} Units Left
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Controls Area */}
                          <div className="flex flex-wrap items-center gap-4">
                            {/* Status Select */}
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-neutral-700 dark:text-neutral-300 mb-1 font-mono">Stock Channel</label>
                              <select
                                value={product.status}
                                onChange={(e) => handleUpdateStatus(product.id, e.target.value as StockStatus)}
                                className="text-xs font-bold px-2 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-305 dark:border-neutral-700 text-neutral-900 dark:text-white rounded outline-none cursor-pointer"
                              >
                                <option value="In Stock" className="text-neutral-900 bg-white dark:text-white dark:bg-neutral-800">In Stock</option>
                                <option value="Few Left" className="text-neutral-900 bg-white dark:text-white dark:bg-neutral-800">Few Left</option>
                                <option value="Out of Stock" className="text-neutral-900 bg-white dark:text-white dark:bg-neutral-800">Out of Stock</option>
                              </select>
                            </div>

                            {/* Size Matrix togglers */}
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-neutral-700 dark:text-neutral-300 mb-1 font-mono">Sizes Matrix</label>
                              <div className="flex gap-1">
                                {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                                  const active = product.sizes.includes(sz);
                                  return (
                                    <button
                                      key={sz}
                                      onClick={() => handleToggleSize(product.id, sz)}
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                                        active
                                          ? 'bg-neutral-900 text-white border-neutral-900'
                                          : 'bg-white text-neutral-300 border-neutral-100 line-through'
                                      }`}
                                      id={`admin-size-toggle-${product.id}-${sz}`}
                                    >
                                      {sz}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {editingProductId === product.id ? (
                              <div className="flex items-center gap-1.5 self-end">
                                {/* Save icon button */}
                                <button
                                  onClick={() => handleSaveInlineEdit(product.id)}
                                  className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded border border-emerald-250 transition-all cursor-pointer flex items-center justify-center shadow-3xs"
                                  title="Save inline edits"
                                  id={`inline-save-${product.id}`}
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                
                                {/* Cancel icon button */}
                                <button
                                  onClick={() => setEditingProductId(null)}
                                  className="p-1.5 text-neutral-500 bg-white border border-neutral-250 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-all cursor-pointer flex items-center justify-center shadow-3xs"
                                  title="Cancel edits"
                                  id={`inline-cancel-${product.id}`}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 self-end">
                                {/* Edit icon button */}
                                <button
                                  onClick={() => {
                                    setEditingProductId(product.id);
                                    setEditingName(product.name);
                                    setEditingPriceUSD(product.priceUSD);
                                    setEditingPriceLKR(product.priceLKR);
                                    setEditingStock(product.stock !== undefined ? product.stock : (product.status === 'Out of Stock' ? 0 : product.status === 'Few Left' ? 3 : 15));
                                    setEditingImgUrl(product.colors && product.colors[0] ? product.colors[0].imageUrl : '');
                                    setEditingHoverImgUrl(product.hoverImageUrl || '');
                                    setEditingImagesInput(product.images ? product.images.join(', ') : '');
                                    setEditingGender(product.gender || 'men');
                                  }}
                                  className="p-1.5 text-neutral-500 bg-white border border-neutral-250 hover:border-black hover:text-black rounded transition-all cursor-pointer flex items-center justify-center shadow-3xs"
                                  title="Inline Edit Title and Prices"
                                  id={`inline-edit-btn-${product.id}`}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                {/* Delete action */}
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-1.5 text-neutral-400 hover:text-red-500 rounded hover:bg-red-50 transition-all cursor-pointer flex items-center justify-center"
                                  title="Remove item"
                                  id={`inline-delete-${product.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Order record listing */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-neutral-100 pb-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600">
                        Generated Orders (Session Log: {orders.length})
                      </h3>
                      {/* Last Sync Indicator */}
                      <span className="text-[9px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200 flex items-center gap-1">
                        {isAutoRefreshActive ? (
                          <>
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            <span>Auto-Syncing</span>
                          </>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                        )}
                        <span>Sync: {lastSyncTime}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-[10px] text-neutral-400">Click any record to inspect customer shipping and items matrix.</p>
                      
                      {/* Auto refresh switch */}
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isAutoRefreshActive}
                          onChange={(e) => {
                            setIsAutoRefreshActive(e.target.checked);
                            if (e.target.checked) setLastSyncTime(new Date().toLocaleTimeString());
                          }}
                          className="w-3 h-3 accent-black rounded text-black cursor-pointer bg-white border border-neutral-300"
                        />
                        <span className="text-[9.5px] font-bold text-neutral-400 hover:text-black uppercase tracking-wider">Auto-refresh (30s)</span>
                      </label>
                    </div>
                  </div>
                  
                  {sortedOrders.length > 0 && (
                    <button
                      onClick={downloadOrdersCSV}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded text-[10px] font-bold uppercase tracking-widest text-emerald-800 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-3xs"
                      title="Export the currently filtered order list as a CSV spreadsheet"
                    >
                      <Download className="w-3 h-3 text-emerald-600 animate-bounce" />
                      <span>Download Filtered CSV ({sortedOrders.length})</span>
                    </button>
                  )}
                </div>

                {orders.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4 bg-neutral-50 p-3 rounded-lg border border-neutral-150">
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={orderSearchInput}
                        onChange={(e) => setOrderSearchInput(e.target.value)}
                        placeholder="Search name, ID, phone..."
                        className="admin-order-search pl-8 pr-7 py-1.5 bg-white border border-neutral-250 rounded text-xs font-mono outline-none focus:ring-1 focus:ring-black w-full"
                        id="admin-order-search"
                      />
                      {orderSearchInput && (
                        <button
                          type="button"
                          onClick={() => {
                            setOrderSearchInput('');
                            setOrderSearchQuery('');
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black font-sans text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Product Name Filter Field */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={orderProductSearchQuery}
                        onChange={(e) => setOrderProductSearchQuery(e.target.value)}
                        placeholder="Filter by product name..."
                        className="pl-8 pr-7 py-1.5 bg-white border border-neutral-250 rounded text-xs font-mono outline-none focus:ring-1 focus:ring-black w-full"
                        id="admin-order-product-search"
                      />
                      {orderProductSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setOrderProductSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black font-sans text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Fulfillment Status Dropdown Filter */}
                    <div className="relative font-sans">
                      <select
                        value={orderFulfillmentFilter}
                        onChange={(e) => setOrderFulfillmentFilter(e.target.value as any)}
                        className="pl-3 pr-10 py-1.5 bg-white border border-neutral-250 rounded text-[10px] font-bold uppercase tracking-wider outline-none focus:ring-1 focus:ring-black w-full appearance-none cursor-pointer text-neutral-605 hover:text-black"
                        id="admin-order-fulfillment-filter"
                      >
                        <option value="All" className="text-neutral-900 bg-white">Fulfillment: All Statuses ({orders.length})</option>
                        <option value="Pending" className="text-neutral-900 bg-white">Fulfillment: Pending Only ({pendingCount})</option>
                        <option value="Processing" className="text-neutral-900 bg-white">Fulfillment: Processing Only ({processingCount})</option>
                        <option value="Shipped" className="text-neutral-900 bg-white">Fulfillment: Shipped Only ({shippedCount})</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Sorting dropdown */}
                    <div className="relative font-sans">
                      <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={orderSortBy}
                        onChange={(e) => setOrderSortBy(e.target.value as any)}
                        className="pl-8 pr-10 py-1.5 bg-white border border-neutral-250 rounded text-[10px] font-bold uppercase tracking-wider outline-none focus:ring-1 focus:ring-black w-full appearance-none cursor-pointer text-neutral-600 hover:text-black"
                      >
                        <option value="dateNewest" className="text-neutral-900 bg-white">Date: Newest First</option>
                        <option value="dateOldest" className="text-neutral-900 bg-white">Date: Oldest First</option>
                        <option value="priceHighLow" className="text-neutral-900 bg-white">Price: High to Low</option>
                        <option value="priceLowHigh" className="text-neutral-900 bg-white">Price: Low to High</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Date Range Picker Block */}
                    <div className="col-span-1 sm:col-span-4 border-t border-neutral-200/60 pt-3 mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Date Range:</span>
                        
                        <div className="flex items-center space-x-1 font-mono text-[11px] bg-white border border-neutral-250 rounded px-2 py-1 select-none">
                          <span className="text-neutral-400 text-[8px] uppercase font-bold tracking-wider mr-1">From</span>
                          <input
                            type="date"
                            value={orderStartDate}
                            onChange={(e) => setOrderStartDate(e.target.value)}
                            className="bg-transparent border-none outline-none text-neutral-800 text-[11px] cursor-pointer"
                            id="admin-order-start-date"
                          />
                        </div>

                        <div className="flex items-center space-x-1 font-mono text-[11px] bg-white border border-neutral-250 rounded px-2 py-1 select-none">
                          <span className="text-neutral-400 text-[8px] uppercase font-bold tracking-wider mr-1">To</span>
                          <input
                            type="date"
                            value={orderEndDate}
                            onChange={(e) => setOrderEndDate(e.target.value)}
                            className="bg-transparent border-none outline-none text-neutral-800 text-[11px] cursor-pointer"
                            id="admin-order-end-date"
                          />
                        </div>

                        {(orderStartDate || orderEndDate) && (
                          <button
                            type="button"
                            onClick={() => {
                              setOrderStartDate('');
                              setOrderEndDate('');
                            }}
                            className="text-[9px] font-extrabold text-rose-700 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded transition-all cursor-pointer font-sans uppercase tracking-widest"
                          >
                            Reset Date Filters
                          </button>
                        )}
                      </div>
                      
                      <div className="text-[9px] font-medium text-neutral-400 text-right leading-none uppercase tracking-wider font-mono">
                        {orderStartDate || orderEndDate ? (
                          <span className="text-emerald-600 font-bold font-sans">● Date Isolator State Active</span>
                        ) : (
                          '⏱ Entire timeline shown'
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bulk Order fulfillment adjustments */}
                {selectedOrderIds.length > 0 && (
                  <div className="mb-3 p-3 bg-neutral-50 border border-neutral-250 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[11px] font-bold text-neutral-800 font-mono">
                        {selectedOrderIds.length} order(s) selected
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-neutral-405 font-bold uppercase font-sans tracking-wide">Fulfillment:</span>
                      <select
                        onChange={(e) => {
                          if (e.target.value && onUpdateOrders) {
                            const newStatus = e.target.value as 'Pending' | 'Processing' | 'Shipped';
                            const updated = orders.map((o) => {
                              if (selectedOrderIds.includes(o.orderId)) {
                                return { ...o, fulfillmentStatus: newStatus };
                              }
                              return o;
                            });
                            onUpdateOrders(updated);
                            
                            // Visual toast feedback trigger
                            setActiveToast({
                              title: `🚀 Bulk Fulfillment Updated!`,
                              desc: `Successfully updated ${selectedOrderIds.length} orders to ${newStatus.toUpperCase()}`
                            });
                            setTimeout(() => setActiveToast(null), 5000);
                            
                            setSelectedOrderIds([]);
                            e.target.value = "";
                          }
                        }}
                        defaultValue=""
                        className="text-[10px] font-extrabold px-2.5 py-1.5 bg-white border border-neutral-300 rounded cursor-pointer text-black font-sans uppercase tracking-wider outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="" disabled className="text-neutral-500 bg-white">Change status to...</option>
                        <option value="Pending" className="text-neutral-900 bg-white">Pending</option>
                        <option value="Processing" className="text-neutral-900 bg-white">Processing</option>
                        <option value="Shipped" className="text-neutral-900 bg-white">Shipped</option>
                      </select>
                      <button
                        onClick={() => setSelectedOrderIds([])}
                        type="button"
                        className="text-[10px] font-extrabold text-neutral-450 hover:text-black uppercase tracking-wider border border-neutral-250 px-2.5 py-1.5 rounded bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Checkbox Select All order display */}
                {sortedOrders.length > 0 && (
                  <div className="flex justify-end mb-2.5">
                    <button
                      onClick={handleToggleSelectAllOrders}
                      type="button"
                      className="text-[10px] font-extrabold text-neutral-500 hover:text-black uppercase tracking-wider cursor-pointer font-sans"
                    >
                      {isAllOrdersSelected ? "☑ Deselect All Orders" : "☐ Select All Displayed Orders"}
                    </button>
                  </div>
                )}

                {orders.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic bg-white p-4 border border-dashed border-neutral-200 rounded text-center">No customer orders recorded in this session yet.</p>
                ) : filteredOrders.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic font-sans py-4 bg-white border border-neutral-100 rounded text-center">No orders found matching search criteria.</p>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                    {sortedOrders.map((o) => (
                      <div
                        key={`${o.orderId}-${orderSearchQuery}-${orderProductSearchQuery}-${orderSortBy}`}
                        onClick={() => setSelectedDetailedOrder(o)}
                        className={`animate-fade-in p-3 border rounded cursor-pointer flex justify-between items-start text-xs font-mono transition-all duration-250 select-none shadow-xs hover:border-black ${
                          selectedOrderIds.includes(o.orderId) ? 'border-neutral-900 bg-neutral-50/80 shadow-xs' : 'border-neutral-150 bg-white hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedOrderIds.includes(o.orderId)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrderIds([...selectedOrderIds, o.orderId]);
                              } else {
                                setSelectedOrderIds(selectedOrderIds.filter(id => id !== o.orderId));
                              }
                            }}
                            className="w-4 h-4 accent-black rounded text-black cursor-pointer border border-neutral-300 shadow-3xs flex-shrink-0 mt-0.5"
                            id={`select-order-${o.orderId}`}
                          />
                          <div>
                            <div className="font-bold text-neutral-900 flex flex-wrap items-center gap-1.5">
                              <span>Order #{o.orderId}</span>
                              <span className={`px-1 rounded-[3px] text-[8px] font-extrabold uppercase font-sans ${
                                o.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                                {o.paymentStatus}
                              </span>
                              <span className={`px-1 rounded-[3px] text-[8px] font-extrabold uppercase font-sans flex items-center gap-1 ${
                                (o.fulfillmentStatus || 'Pending') === 'Shipped'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                  : (o.fulfillmentStatus || 'Pending') === 'Processing'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                  : 'bg-neutral-55 text-neutral-600 border border-neutral-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  (o.fulfillmentStatus || 'Pending') === 'Shipped'
                                    ? 'bg-blue-500'
                                    : (o.fulfillmentStatus || 'Pending') === 'Processing'
                                    ? 'bg-amber-500'
                                    : 'bg-neutral-400'
                                }`} />
                                <span>{o.fulfillmentStatus || 'Pending'}</span>
                              </span>
                            </div>
                            <div className="text-neutral-500 font-sans text-[11px] mt-1.5 font-semibold">{o.customerName}</div>
                            <div className="text-neutral-400 text-[10px] my-0.5">{o.phone}</div>
                            <div className="text-neutral-400 text-[9px] mt-2 opacity-75">{o.timestamp}</div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end justify-between h-full min-h-[50px]">
                          <div className="font-extrabold text-black text-sm">{formatCurrency(currency === 'USD' ? o.totalUSD : o.totalLKR, currency)}</div>
                          <div className="text-[9px] text-neutral-500 border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold mt-1">
                            {o.paymentMethod === 'Card' ? 'Card Link' : o.paymentMethod === 'BankTransfer' ? 'Bank' : 'COD'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* GEMINI AI HUB & REQUEST LOGS DEBUGGER */}
            <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-800 shadow-sm space-y-6" id="gemini-ai-hub-panel">
              <div className="flex items-center justify-between border-b border-neutral-250 dark:border-neutral-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-neutral-900 dark:bg-amber-400 text-white dark:text-neutral-950 rounded">
                    <Cpu className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-450 dark:text-neutral-500 font-extrabold font-mono block">System Diagnostics</span>
                    <h3 className="text-sm font-serif font-black text-neutral-900 dark:text-white">Gemini AI Studio Hub & API Logs</h3>
                  </div>
                </div>
                
                {apiLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearLogs}
                    disabled={isClearingLogs}
                    className="text-[9px] font-mono text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 bg-red-500/5 px-2 py-1 rounded border border-red-500/10 cursor-pointer transition-all hover:bg-red-500/10"
                  >
                    {isClearingLogs ? 'Clearing...' : 'Clear Logs'}
                  </button>
                )}
              </div>

              {/* Grid Layout: 2 Sub-panels (AI Copywriter & Live API Diagnostics Terminal) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Panel A: Interactive Copywriter Assistant */}
                <div className="space-y-4 font-sans bg-neutral-50 dark:bg-neutral-950/45 p-4 rounded-lg border border-neutral-200 dark:border-neutral-850">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-neutral-800 dark:text-neutral-200 font-mono">
                      AI Creative Assistant
                    </h4>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-semibold">
                    Generate premium descriptions, tagline campaigns, or Instagram hashtags using the server proxy.
                  </p>

                  <form onSubmit={handleGenerateAi} className="space-y-3">
                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-450 dark:text-neutral-500 mb-1 font-mono">
                        Generate For Product:
                      </label>
                      <select
                        onChange={(e) => {
                          const prodId = e.target.value;
                          const prod = products.find(p => p.id === prodId);
                          if (prod) {
                            setAiPrompt(`Write a premium and highly compelling marketing description (under 50 words) for our streetwear release: "${prod.name}", category: "${prod.category}", of premium structure: "${prod.material || 'Heavyweight Cotton'}". Focus on craftsmanship, line geometry, and urban Colombo lifestyle.`);
                          }
                        }}
                        className="w-full text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded px-2 py-1.5 focus:outline-none dark:text-neutral-200 text-neutral-800"
                        defaultValue=""
                      >
                        <option value="" disabled className="text-neutral-500 bg-white dark:bg-neutral-800">-- Quick Select a Product --</option>
                        {products.map(p => (
                           <option key={p.id} value={p.id} className="text-neutral-900 bg-white dark:text-white dark:bg-neutral-800">{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-450 dark:text-neutral-500 mb-1 font-mono">
                        Custom Prompt:
                      </label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        rows={3}
                        required
                        placeholder="E.g. Write a brief creative slogan for the brand REED Colombo streetwear..."
                        className="w-full text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded p-2 focus:outline-none dark:text-neutral-200 resize-none font-medium leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isGeneratingAi}
                      className="w-full h-8.5 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 font-mono text-[10px] uppercase font-extrabold tracking-widest rounded-none transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingAi ? (
                        <span className="flex items-center gap-1.5 font-sans normal-case">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>AI is Thinking...</span>
                        </span>
                      ) : (
                        <>
                          <span>Generate AI Copy</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>

                  {aiResult && (
                    <div className="mt-3 p-3 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                      <h5 className="text-[9px] font-mono text-neutral-450 dark:text-neutral-500 uppercase font-bold">
                        AI Response Output:
                      </h5>
                      <p className="text-xs dark:text-neutral-100 leading-relaxed max-h-[160px] overflow-y-auto whitespace-pre-wrap font-sans font-medium select-text bg-neutral-50 dark:bg-neutral-950 p-2 border border-neutral-100 dark:border-neutral-850 rounded">
                        {aiResult}
                      </p>
                    </div>
                  )}
                </div>

                {/* Panel B: Live API Performance Debugging Logs (Terminal style) */}
                <div className="space-y-4 font-sans bg-neutral-95 dark:bg-neutral-950 p-4 rounded-lg border border-neutral-300 dark:border-neutral-850 flex flex-col h-full min-h-[350px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-4 h-4 text-emerald-500" />
                      <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-neutral-800 dark:text-neutral-300 font-mono">
                        API Logs & Debugger
                      </h4>
                    </div>
                    <span className="text-[9px] font-mono bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded uppercase font-extrabold scale-95">
                      Model: gemini-3.5-flash
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-semibold">
                    Monitors latency execution times, payloads, and response status details for tuning user workflows.
                  </p>

                  <div className="flex-grow overflow-y-auto max-h-[320px] rounded-md border border-neutral-300 dark:border-neutral-800 bg-neutral-950 p-2 font-mono text-[10px] text-neutral-300 space-y-2">
                    {apiLogs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-10 text-neutral-500 space-y-1 select-none">
                        <span>$ tail -f /log/gemini-api.log</span>
                        <span className="animate-pulse">_ (No request logs captured yet)</span>
                      </div>
                    ) : (
                      apiLogs.map((log) => {
                        const isExpanded = expandedLogId === log.id;
                        const isSuccess = log.status === 'Success';
                        const logTime = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'N/A';
                        return (
                          <div 
                            key={log.id} 
                            className="border-b border-neutral-850 pb-2 last:border-none space-y-1.5 transition-colors duration-150 hover:bg-neutral-900/40 p-1 rounded-sm"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-neutral-500 bg-neutral-900 px-1 rounded text-[9px] select-none text-[8.5px]">
                                  {logTime}
                                </span>
                                <span className={`px-1 py-0.2 rounded-[2px] font-sans text-[7.5px] font-extrabold uppercase ${
                                  isSuccess 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                  {log.status === 'Success' ? '✓ OK - 200' : '✗ ERROR - 500'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                className="text-[9px] text-neutral-400 hover:text-white flex items-center gap-0.5 select-none focus:outline-none cursor-pointer"
                              >
                                <span>{isExpanded ? 'Collapse' : 'Inspect'}</span>
                                {isExpanded ? <ChevronUp className="w-2.5 h-2.5 text-neutral-400" /> : <ChevronDown className="w-2.5 h-2.5 text-neutral-400" />}
                              </button>
                            </div>

                            <div className="text-[10px] text-neutral-300 font-mono truncate select-all">
                              <span className="text-neutral-500 select-none">PROMPT: </span>
                              {log.prompt}
                            </div>

                            <div className="text-[9px] text-neutral-400 flex items-center justify-between flex-wrap text-2xs select-none">
                              <span>Latency: <strong className="text-neutral-300 font-bold">{log.latency ?? 0}ms</strong></span>
                              <span>ID: <code className="text-neutral-500 text-[8px]">{log.id?.substring(0, 8)}</code></span>
                            </div>

                            {isExpanded && (
                              <div className="mt-2 p-2 bg-neutral-900 border border-neutral-800 text-[10px] rounded space-y-2 select-text text-neutral-200 overflow-x-auto">
                                <div>
                                  <div className="text-neutral-500 text-[9px] uppercase font-bold tracking-wider mb-1">Full Request Prompt:</div>
                                  <p className="whitespace-pre-wrap font-sans text-[11px] bg-neutral-950 p-2 rounded border border-neutral-850 text-neutral-300 font-semibold leading-relaxed">
                                    {log.prompt}
                                  </p>
                                </div>
                                <div>
                                  <div className="text-neutral-500 text-[9px] uppercase font-bold tracking-wider mb-1">Response JSON Payload:</div>
                                  <pre className="whitespace-pre-wrap font-mono text-[9.5px] bg-neutral-950 p-2 rounded border border-neutral-850 text-amber-100 max-h-[150px] overflow-y-auto leading-relaxed">
                                    {log.response}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT AREA: ADD NEW APPAREL PORTAL (4 cols) */}
            <div className="lg:col-span-4 bg-neutral-50 dark:bg-neutral-900/90 p-6 rounded-xl border border-neutral-300 dark:border-neutral-800 shadow-sm">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-extrabold block mb-1 font-mono">Expand catalog</span>
              <h3 className="text-sm font-serif font-black text-neutral-900 dark:text-white mb-4 pb-2 border-b border-neutral-300 dark:border-neutral-700">Add New Product</h3>
              
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5 font-mono">Product Name</label>
                  <input
                    type="text"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="E.g., Casual Crop-top"
                    className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 rounded text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-3xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5 font-mono">Price (USD)</label>
                    <input
                      type="number"
                      required
                      value={newPriceUSD}
                      onChange={(e) => setNewPriceUSD(Number(e.target.value))}
                      className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 rounded text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-3xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5 font-mono">Price (LKR)</label>
                    <input
                      type="number"
                      required
                      value={newPriceLKR}
                      onChange={(e) => setNewPriceLKR(Number(e.target.value))}
                      className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 rounded text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-3xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5 font-mono">Image URL</label>
                  <input
                    type="text"
                    required
                    value={newImgUrl}
                    onChange={(e) => setNewImgUrl(e.target.value)}
                    placeholder="Unsplash image URL"
                    className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 rounded text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-3xs font-mono text-[11px]"
                  />
                  <div className="mt-2 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-850 p-3 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-neutral-500 font-mono">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Upload or replace image</span>
                    </div>
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200 hover:border-black hover:text-black transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose primary image file</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSingleImageUpload(e.target.files?.[0], setNewImgUrl, 'Primary image')}
                      />
                    </label>
                    <p className="text-[10px] leading-relaxed text-neutral-500">
                      The selected file becomes the product image immediately, so you can swap visuals without pasting a URL.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5 font-mono">Additional Photos (Comma-Separated URLs)</label>
                  <textarea
                    value={newImagesInput}
                    onChange={(e) => setNewImagesInput(e.target.value)}
                    placeholder="https://image1.com, https://image2.com"
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 rounded text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white h-12 resize-none font-mono text-[10px] shadow-3xs"
                  />
                  <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200 hover:border-black hover:text-black transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload gallery images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleGalleryUpload(e.target.files, setNewImagesInput)}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5 font-mono">Description</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="A stylish boxy fit garment..."
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 rounded text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white h-16 resize-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5 font-mono">Categories Tag</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-900 dark:text-white rounded text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white cursor-pointer font-bold tracking-tight h-[38px]"
                    >
                      <option value="Signature" className="text-neutral-900 bg-white dark:text-white dark:bg-neutral-800">Signature</option>
                      <option value="Essentials" className="text-neutral-900 bg-white dark:text-white dark:bg-neutral-800">Essentials</option>
                      <option value="Limited" className="text-neutral-900 bg-white dark:text-white dark:bg-neutral-800">Limited Series</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5 font-mono">Gender Group</label>
                    <select
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value as 'men' | 'women' | 'unisex')}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-950 dark:text-white rounded text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white uppercase font-mono tracking-wider font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer h-[38px]"
                    >
                      <option value="men" className="text-neutral-900 bg-white dark:text-white dark:bg-neutral-800">Men</option>
                      <option value="women" className="text-neutral-900 bg-white dark:text-white dark:bg-neutral-800">Women</option>
                      <option value="unisex" className="text-neutral-900 bg-white dark:text-white dark:bg-neutral-800">Unisex</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5 font-mono">Material Specs</label>
                  <input
                    type="text"
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    placeholder="E.g., 100% Cotton, 240 GSM"
                    className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 rounded text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-neutral-950 hover:bg-black dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300 text-white rounded text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Deploy Product</span>
                </button>
              </form>

              {/* Simulated SMTP Email alerts section */}
              <div className="mt-8 pt-6 border-t border-neutral-250 animate-fade-in font-sans">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-500 font-sans">Live SMTP Simulator Log</h4>
                  </div>
                  {emailAlerts.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => setEmailAlerts([])}
                      className="text-[9px] font-bold text-neutral-400 hover:text-red-500 uppercase tracking-tight cursor-pointer"
                    >
                      Clear Log
                    </button>
                  )}
                </div>
                
                {emailAlerts.length === 0 ? (
                  <div className="p-4 rounded-lg bg-white border border-neutral-200 border-dashed text-center">
                    <p className="text-[10px] font-semibold text-neutral-400 italic">No low-stock email triggers fired yet.</p>
                    <p className="text-[9px] text-neutral-400 mt-1 font-sans leading-normal">
                      Try setting a product to 'Few Left' or 'Out of Stock' inside the inventory list to see live simulations.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {emailAlerts.map((alert) => (
                      <div key={alert.id} className="p-3 bg-white border border-neutral-200 rounded-lg shadow-3xs hover:border-neutral-350 transition-colors text-left space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-mono text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            📧 Dispatch (Simulated)
                          </span>
                          <span className="text-neutral-400 font-mono text-[9px]">{alert.timestamp}</span>
                        </div>
                        <div className="text-[10.5px] font-sans space-y-1">
                          <div>
                            <span className="text-neutral-400 font-semibold font-mono text-[9px] uppercase">To:</span>{' '}
                            <span className="text-neutral-800 font-medium font-mono">{alert.to}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 font-semibold font-mono text-[9px] uppercase">Subject:</span>{' '}
                            <span className="text-neutral-900 font-bold leading-tight">{alert.subject}</span>
                          </div>
                        </div>
                        
                        <div className="bg-neutral-50 border border-neutral-150 rounded p-2 text-[9.5px] font-mono text-neutral-600 leading-normal whitespace-pre-line break-words max-h-[140px] overflow-y-auto">
                          {alert.body}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Detailed Order Modal Overlay */}
      {selectedDetailedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <div id="invoice-print-area" className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden my-8 max-h-[88vh] flex flex-col font-sans">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-150 bg-neutral-900 text-white flex justify-between items-center">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-mono font-bold">INVOICE SPECIFICATION</div>
                <h3 className="text-md font-serif font-extrabold">Order #{selectedDetailedOrder.orderId}</h3>
              </div>
              <button
                onClick={() => setSelectedDetailedOrder(null)}
                className="no-print p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              {/* Section 1: Address and Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-neutral-200">
                {/* Customer Details */}
                <div className="space-y-4 text-left">
                  <h4 className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 font-mono">Recipient Details</h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-neutral-400 font-mono block text-[9px] uppercase tracking-wider">Customer Name</span>
                      <p className="font-sans font-bold text-neutral-900 text-sm">{selectedDetailedOrder.customerName}</p>
                    </div>
                    <div className="flex space-x-4">
                      <div>
                        <span className="text-neutral-400 font-mono block text-[9px] uppercase tracking-wider">Phone</span>
                        <a href={`tel:${selectedDetailedOrder.phone}`} className="font-mono font-bold text-black underline flex items-center gap-1 hover:text-emerald-600">
                          <PhoneCall className="w-3 h-3" />
                          {selectedDetailedOrder.phone}
                        </a>
                      </div>
                      {selectedDetailedOrder.email && (
                        <div>
                          <span className="text-neutral-400 font-mono block text-[9px] uppercase tracking-wider">Email</span>
                          <p className="font-mono text-neutral-700">{selectedDetailedOrder.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Packing / Shipping Details */}
                <div className="space-y-4 text-left">
                  <h4 className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 font-mono">Shipping Coordinates</h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-neutral-400 font-mono block text-[9px] uppercase tracking-wider">Street Address</span>
                      <p className="font-sans font-semibold text-neutral-900 leading-normal">{selectedDetailedOrder.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-neutral-400 font-mono block text-[9px] uppercase tracking-wider">City</span>
                        <p className="font-sans font-semibold text-neutral-800">{selectedDetailedOrder.city}</p>
                      </div>
                      <div>
                        <span className="text-neutral-400 font-mono block text-[9px] uppercase tracking-wider">Postal Code</span>
                        <p className="font-sans font-semibold text-neutral-800 font-mono">{selectedDetailedOrder.postalCode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Financial Details & Admin actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-neutral-200 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                {/* Status Information */}
                <div className="space-y-3 text-left">
                  <h4 className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 font-mono">Financial State</h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-neutral-400 font-mono block text-[9px] uppercase tracking-wider">Payment Method</span>
                      <p className="font-mono font-bold text-neutral-900 uppercase tracking-wider">
                        {selectedDetailedOrder.paymentMethod === 'Card' ? '💳 Credit/Debit Card Link' : selectedDetailedOrder.paymentMethod === 'BankTransfer' ? '🏦 Manual Bank Transfer' : '📦 Cash on Delivery'}
                      </p>
                    </div>
                    {selectedDetailedOrder.paymentReference && (
                      <div>
                        <span className="text-neutral-400 font-mono block text-[9px] uppercase tracking-wider">Payment Reference</span>
                        <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-[11px] block text-neutral-850 break-all select-all font-mono mt-1">
                          {selectedDetailedOrder.paymentReference}
                        </code>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Quick actions */}
                <div className="space-y-3 text-left">
                  <h4 className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 font-mono">Fulfillment Actions</h4>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-neutral-400 font-mono block text-[9px] uppercase tracking-wider">Settlement Status</span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-1 ${
                          selectedDetailedOrder.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          ● {selectedDetailedOrder.paymentStatus}
                        </span>
                      </div>
                      
                      {onUpdateOrders && (
                        <button
                          onClick={() => handleTogglePaymentStatus(selectedDetailedOrder.orderId)}
                          className="no-print px-2.5 py-1 bg-neutral-900 hover:bg-black text-white rounded text-[9px] tracking-wider font-bold uppercase cursor-pointer"
                        >
                          {selectedDetailedOrder.paymentStatus === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 py-2 border-t border-neutral-200 mt-1">
                      <div>
                        <span className="text-neutral-400 font-mono block text-[9px] uppercase tracking-wider">Fulfillment Status</span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-1 ${
                          (selectedDetailedOrder.fulfillmentStatus || 'Pending') === 'Shipped'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : (selectedDetailedOrder.fulfillmentStatus || 'Pending') === 'Processing'
                            ? 'bg-amber-105 text-amber-800 bg-amber-50 border border-amber-200'
                            : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                        }`}>
                          ● {selectedDetailedOrder.fulfillmentStatus || 'Pending'}
                        </span>
                      </div>
                      
                      {onUpdateOrders && (
                        <select
                          value={selectedDetailedOrder.fulfillmentStatus || 'Pending'}
                          onChange={(e) => handleUpdateFulfillmentStatus(selectedDetailedOrder.orderId, e.target.value as any)}
                          className="no-print text-[9px] font-bold px-2 py-1 bg-white border border-neutral-300 rounded outline-none cursor-pointer uppercase tracking-wider text-black focus:ring-1 focus:ring-black"
                        >
                          <option value="Pending" className="text-neutral-900 bg-white">Pending</option>
                          <option value="Processing" className="text-neutral-900 bg-white">Processing</option>
                          <option value="Shipped" className="text-neutral-900 bg-white">Shipped</option>
                        </select>
                      )}
                    </div>

                    {onUpdateOrders && (
                      <button
                        onClick={() => handleDeleteOrder(selectedDetailedOrder.orderId)}
                        className="no-print w-full mt-1.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[9px] tracking-wider font-bold uppercase border border-rose-200 rounded flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete Order Record</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Item Breakdown table */}
              <div className="space-y-3 text-left">
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 font-mono">Ordered Garments</h4>
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono uppercase text-[9px] tracking-wider">
                      <tr>
                        <th className="px-4 py-2.5">Product Name</th>
                        <th className="px-4 py-2.5 text-center">Color/Size</th>
                        <th className="px-4 py-2.5 text-center">Qty</th>
                        <th className="px-4 py-2.5 text-right">Unit Price</th>
                        <th className="px-4 py-2.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-150 bg-white">
                      {selectedDetailedOrder.items.map((itm, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/50">
                          <td className="px-4 py-3 font-semibold text-neutral-900">{itm.productName}</td>
                          <td className="px-4 py-3 text-center text-neutral-500 font-mono">
                            <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[10px] border border-neutral-205 mr-1">{itm.color}</span>
                            <span className="font-bold text-neutral-900 border border-neutral-205 px-1 py-0.5 rounded bg-neutral-50">{itm.size}</span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold font-mono text-neutral-800">{itm.quantity}</td>
                          <td className="px-4 py-3 text-right text-neutral-500 font-mono">
                            {formatCurrency(itm.price, currency)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-neutral-900 font-mono">
                            {formatCurrency(itm.price * itm.quantity, currency)}
                          </td>
                        </tr>
                      ))}
                      
                      {/* Delivery line (Simulate free if standard) */}
                      <tr className="bg-neutral-50/30">
                        <td colSpan={3} className="px-4 py-2.5 font-medium text-neutral-400 italic">Islands-wide Premium Courier</td>
                        <td className="px-4 py-2.5 text-right text-neutral-400 font-mono">Fixed Delivery</td>
                        <td className="px-4 py-2.5 text-right font-medium text-emerald-650 font-mono uppercase text-[10px]">Free Shipping</td>
                      </tr>

                      {/* Grand total row */}
                      <tr className="bg-neutral-950 text-white font-mono">
                        <td colSpan={3} className="px-4 py-3.5 font-serif font-extrabold text-sm uppercase tracking-wider text-left">Invoice Grand Total</td>
                        <td colSpan={2} className="px-4 py-3.5 text-right font-extrabold text-md md:text-lg">
                          <p className="text-yellow-400">{formatCurrency(selectedDetailedOrder.totalLKR, 'LKR')}</p>
                          <p className="text-neutral-400 text-[10px] font-normal font-sans tracking-tight">approx. {formatCurrency(selectedDetailedOrder.totalUSD, 'USD')}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4: Notes / Instructions */}
              {selectedDetailedOrder.notes && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200/50 text-xs text-left">
                  <span className="text-amber-700 font-mono font-bold text-[9px] uppercase tracking-wider block mb-1">Customer Remarks</span>
                  <p className="text-neutral-700 leading-normal italic">"{selectedDetailedOrder.notes}"</p>
                </div>
              )}

              {/* Timestamp Footer */}
              <div className="text-[10px] text-neutral-405 font-mono text-center pb-2">
                Submitted Timestamp: {selectedDetailedOrder.timestamp} | Session Lock ID: {selectedDetailedOrder.orderId}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="no-print p-4 border-t border-neutral-100 bg-neutral-50 flex flex-col sm:flex-row gap-3 justify-end flex-shrink-0">
              {/* Native Print Trigger */}
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center flex items-center justify-center space-x-1.5"
              >
                <svg className="w-3.5 h-3.5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print Invoice</span>
              </button>

              <button
                onClick={() => setSelectedDetailedOrder(null)}
                className="px-5 py-2 hover:bg-neutral-200 text-neutral-705 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Close Invoice Inspector
              </button>
              
              <a
                href={`tel:${selectedDetailedOrder.phone}`}
                className="px-5 py-2 bg-black hover:bg-neutral-900 text-white rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer text-center"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Dial Recipient Phone</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating active email trigger simulation toast */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 bg-neutral-950 text-white p-4 rounded-lg border border-neutral-800 shadow-2xl z-[100] max-w-sm animate-fade-in flex items-start space-x-3 text-left">
          <div className="p-1 px-2.5 bg-amber-400 text-neutral-950 rounded font-mono font-bold text-[9px] tracking-wider uppercase flex-shrink-0 mt-0.5">
            SMTP
          </div>
          <div className="space-y-1 flex-grow">
            <h5 className="text-[11px] font-extrabold font-sans uppercase tracking-wide text-neutral-100 leading-none">{activeToast.title}</h5>
            <p className="text-[10px] text-neutral-450 font-mono leading-tight pr-4">{activeToast.desc}</p>
            <p className="text-[9px] text-amber-500 font-bold font-sans uppercase tracking-wider pt-0.5">Dispatched to brandmanager@reed.lk</p>
          </div>
          <button 
            type="button"
            onClick={() => setActiveToast(null)}
            className="text-neutral-500 hover:text-white text-md font-bold leading-none cursor-pointer focus:outline-none flex-shrink-0"
          >
            ×
          </button>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden p-6 border border-neutral-150 animate-fade-in text-left">
            <div className="flex items-start space-x-3 text-red-600 mb-4">
              <Trash2 className="w-6 h-6 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h3 className="text-sm font-serif font-extrabold uppercase tracking-wide text-neutral-900">Confirm Bulk Deletion</h3>
                <p className="text-xs text-neutral-400 mt-1 font-sans">You are about to permanently remove selected apparel items from the database.</p>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-lg p-3.5 border border-neutral-200 mb-5 font-mono text-[10px] space-y-2">
              <div className="font-extrabold text-neutral-500 uppercase tracking-wider">Products Selected ({selectedProductIds.length}):</div>
              <ul className="list-disc pl-4 space-y-1 max-h-32 overflow-y-auto text-neutral-800 font-semibold font-sans">
                {products
                  .filter((p) => selectedProductIds.includes(p.id))
                  .map((p) => (
                    <li key={p.id} className="truncate">{p.name}</li>
                  ))}
              </ul>
            </div>

            <div className="text-[11px] font-sans font-medium text-neutral-500 leading-normal mb-6">
              This process is irreversible. All selections will be wiped from current active inventory lists. Do you wish to proceed?
            </div>

            <div className="flex justify-end items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsBulkDeleteConfirmOpen(false)}
                className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-500 hover:text-black border border-neutral-250 px-4 py-2 hover:bg-neutral-50 rounded bg-white transition-all cursor-pointer"
              >
                No, Keep Them
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteProducts}
                className="text-[10px] uppercase tracking-wider font-extrabold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded shadow-sm transition-all cursor-pointer"
              >
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
