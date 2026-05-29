import React, { useState, useEffect } from 'react';
import { X, Search, Package, Clock, Truck, FileCheck2, Printer, AlertCircle, Calendar, MapPin, User, ShoppingBag, HelpCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { formatCurrency } from '../utils';
import { OrderDetails } from '../types';

interface OrderTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  currency: 'USD' | 'LKR';
  localOrders?: OrderDetails[];
}

export default function OrderTracker({
  isOpen,
  onClose,
  currency,
  localOrders = [],
}: OrderTrackerProps) {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle auto-population of initial search ID if user has placed orders.
  useEffect(() => {
    if (isOpen && localOrders.length > 0 && !orderIdInput) {
      // Pre-fill with the most recent local order placed in this browser session
      setOrderIdInput(localOrders[0].orderId);
    }
  }, [isOpen, localOrders]);

  if (!isOpen) return null;

  const handleSearchOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = orderIdInput.trim();
    if (!cleanId) return;

    setIsLoading(true);
    setErrorMessage('');
    setSearchedOrder(null);

    try {
      // 1. Clean format (sometimes users type '#' or spacing)
      const targetId = cleanId.replace('#', '').trim();

      // 2. Query Firestore first for live, cross-device support
      const orderRef = doc(db, 'orders', targetId);
      const snapshot = await getDoc(orderRef);

      if (snapshot.exists()) {
        const liveOrder = snapshot.data() as OrderDetails;
        setSearchedOrder(liveOrder);
      } else {
        // 3. Fallback to searching local in-memory/localStorage orders
        const foundLocal = localOrders.find(
          (o) => o.orderId.toLowerCase() === targetId.toLowerCase()
        );
        if (foundLocal) {
          setSearchedOrder(foundLocal);
        } else {
          setErrorMessage(`No order found matching ID "${cleanId}". Please check the spelling on your email receipt.`);
        }
      }
    } catch (err: any) {
      console.error('Error tracking order:', err);
      // Fallback search locally even on firestore read errors
      const targetId = cleanId.replace('#', '').trim();
      const foundLocal = localOrders.find(
        (o) => o.orderId.toLowerCase() === targetId.toLowerCase()
      );
      if (foundLocal) {
        setSearchedOrder(foundLocal);
      } else {
        setErrorMessage('Unable to connect to live database. Please double-check your connection or input details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper code to map progress states
  const getFulfillmentSteps = (status: 'Pending' | 'Processing' | 'Shipped' = 'Pending') => {
    const steps = [
      { key: 'Pending', label: 'Order Submitted', icon: FileCheck2, desc: 'Awaiting warehouse validation' },
      { key: 'Processing', label: 'Processing & Stitching', icon: Package, desc: 'Curating, packing, and quality checks at Colombo Hub' },
      { key: 'Shipped', label: 'Dispatched & Shipped', icon: Truck, desc: 'Handed over to Reed Delivery Network' },
    ];

    let activeStepIdx = 0;
    if (status === 'Processing') activeStepIdx = 1;
    if (status === 'Shipped') activeStepIdx = 2;

    return steps.map((item, idx) => ({
      ...item,
      isCompleted: idx <= activeStepIdx,
      isActive: idx === activeStepIdx,
    }));
  };

  const activeStatus = searchedOrder?.fulfillmentStatus || 'Pending';
  const steps = getFulfillmentSteps(activeStatus);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto no-print animate-fade-in"
      id="order-tracker-overlay"
    >
      <div
        className="relative bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden border border-neutral-100 dark:border-neutral-850 max-h-[92vh] flex flex-col transform transition-all duration-300"
        id="order-tracker-container"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-850/60 bg-neutral-50/50 dark:bg-neutral-905/30">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-black dark:bg-amber-400 text-white dark:text-black rounded-lg">
              <Truck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight uppercase font-sans text-neutral-900 dark:text-white">
                REƎD Tracker
              </h2>
              <p className="text-[10px] text-neutral-400 font-mono">Real-time Fulfillment & Courier Dispatch Logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-900 text-neutral-400 hover:text-black dark:hover:text-white transition-all cursor-pointer"
            id="close-order-tracker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Panel scrollable */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {/* Tracker Form input */}
          <div className="bg-neutral-50 dark:bg-neutral-900/60 p-5 rounded-lg border border-neutral-150 dark:border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-neutral-800 dark:text-neutral-200 mb-2">
              Trace Your Parcel
            </h3>
            <p className="text-[11px] text-neutral-400 leading-normal mb-4">
              Enter the unique Order ID (e.g., <strong className="font-mono text-amber-500 font-bold">reed-1001</strong>) provided on your checkout invoice receipt or SMS details.
            </p>

            <form onSubmit={handleSearchOrder} className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  placeholder="Order ID / Reference Code (e.g. reed-4819)"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded text-xs focus:ring-1 focus:ring-black dark:focus:ring-amber-400 outline-none font-mono text-neutral-950 dark:text-neutral-50"
                  id="order-tracker-search-input"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-black dark:bg-amber-400 text-white dark:text-black rounded hover:bg-neutral-850 dark:hover:bg-amber-500 transition-all font-mono text-[10px] font-bold tracking-widest uppercase cursor-pointer flex items-center justify-center space-x-1 whitespace-nowrap"
                id="order-tracker-submit-btn"
              >
                {isLoading ? (
                  <span>Checking Logs...</span>
                ) : (
                  <>
                    <span>TRACK</span>
                  </>
                )}
              </button>
            </form>

            {/* Render suggestion of local placed orders for extreme UX */}
            {localOrders.length > 0 && (
              <div className="mt-3.5 pt-3.5 border-t border-neutral-200 dark:border-neutral-800/80">
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-mono font-bold block mb-1.5">
                  Recent Purchases in this Session:
                </span>
                <div className="flex flex-wrap gap-2">
                  {localOrders.slice(0, 3).map((o) => (
                    <button
                      key={o.orderId}
                      onClick={() => {
                        setOrderIdInput(o.orderId);
                        setSearchedOrder(o);
                        setErrorMessage('');
                      }}
                      className="inline-flex items-center px-2.5 py-1 text-[10px] bg-white dark:bg-neutral-950 hover:border-black dark:hover:border-amber-400 text-neutral-700 dark:text-neutral-300 rounded border border-neutral-200 dark:border-neutral-850 font-mono font-semibold hover:scale-102 transition-all cursor-pointer shadow-3xs"
                    >
                      #{o.orderId}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Validation Feedback message */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-4 bg-red-500/10 dark:bg-red-500/5 border border-red-500/15 rounded-lg text-red-650 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="font-sans leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Render result logs */}
          {searchedOrder && (
            <div
              className="space-y-6 pt-2 animate-slide-up"
              id="order-tracking-details"
            >
                {/* 1. Fulfillment Pipeline Tracker Visual */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center bg-neutral-900 dark:bg-neutral-900 text-white rounded p-3">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-neutral-450 font-mono font-bold block">Fulfillment Status</span>
                      <span className="text-xs font-black tracking-widest uppercase text-amber-400 font-mono">
                        {activeStatus}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-widest text-neutral-450 font-mono font-bold block">Order Reference</span>
                      <span className="text-xs font-mono font-extrabold text-white">#{searchedOrder.orderId}</span>
                    </div>
                  </div>

                  {/* Horizontal steps design */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 relative">
                    <div className="hidden md:block absolute left-[15%] right-[15%] top-5 h-0.5 bg-neutral-100 dark:bg-neutral-800 -z-10" />
                    {steps.map((st, idx) => {
                      const Icon = st.icon;
                      return (
                        <div key={st.key} className="flex flex-row md:flex-col items-center gap-4 md:gap-2.5 text-left md:text-center p-3 sm:p-0">
                          {/* Circle indicator */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                              st.isActive
                                ? 'bg-amber-400 border-amber-400 text-black shadow ring-4 ring-amber-400/20'
                                : st.isCompleted
                                  ? 'bg-black text-white border-black dark:bg-emerald-600 dark:border-emerald-600'
                                  : 'bg-white dark:bg-neutral-900 text-neutral-300 dark:text-neutral-700 border-neutral-200 dark:border-neutral-800'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4
                              className={`text-xs font-bold uppercase tracking-tight ${
                                st.isActive
                                  ? 'text-amber-500 font-extrabold'
                                  : st.isCompleted
                                    ? 'text-neutral-950 dark:text-neutral-100'
                                    : 'text-neutral-400'
                              }`}
                            >
                              {st.label}
                            </h4>
                            <p className="text-[10px] text-neutral-400 mt-0.5 leading-normal max-w-[180px] mx-auto">
                              {st.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Detailed Invoice / Customer Recap */}
                <div className="border border-neutral-150 dark:border-neutral-850 rounded-lg overflow-hidden bg-white dark:bg-neutral-950">
                  <div className="bg-neutral-50 dark:bg-neutral-900/40 px-5 py-3 border-b border-neutral-150 dark:border-neutral-850 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase font-mono tracking-widest text-neutral-500">Invoice Details Summary</span>
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-black dark:hover:text-amber-400 text-[10px] font-mono font-bold transition-colors bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2.5 py-1 rounded"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Pass / Invoice</span>
                    </button>
                  </div>

                  <div className="p-5 space-y-4 font-sans text-xs">
                    {/* Customer Meta Row Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-full text-left">
                      <div className="space-y-1.5">
                        <div className="flex items-center text-neutral-400 gap-1.5 font-mono text-[9px] uppercase tracking-wider font-bold">
                          <User className="w-3 h-3 text-neutral-405" />
                          <span>Customer Recipient</span>
                        </div>
                        <p className="font-bold text-neutral-900 dark:text-neutral-100 font-sans">
                          {searchedOrder.fullName}
                        </p>
                        <p className="text-neutral-500 leading-normal">
                          {searchedOrder.email} / {searchedOrder.phoneNumber}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center text-neutral-400 gap-1.5 font-mono text-[9px] uppercase tracking-wider font-bold">
                          <MapPin className="w-3 h-3 text-neutral-405" />
                          <span>Delivery Address destination</span>
                        </div>
                        <p className="font-semibold text-neutral-850 dark:text-neutral-200 leading-relaxed">
                          {searchedOrder.address}, {searchedOrder.city}
                        </p>
                        {searchedOrder.postalCode && (
                          <p className="text-neutral-500 font-mono text-[10px]">
                            Postal / Zip: {searchedOrder.postalCode}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-neutral-100 dark:border-neutral-900 pt-4 text-left">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400">Order Method & Date</span>
                        <p className="text-neutral-900 dark:text-white font-medium flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          {new Date(searchedOrder.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400">Payment Channel</span>
                        <p className="text-neutral-900 dark:text-white font-medium capitalize">
                          {searchedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : searchedOrder.paymentMethod || 'Online Payment Card'}
                        </p>
                      </div>
                    </div>

                    {/* Order Itemized Array */}
                    <div className="border-t border-neutral-100 dark:border-neutral-900 pt-4">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-3 text-left">Itemized Parcel Contents</span>
                      <div className="space-y-2.5">
                        {searchedOrder.items.map((item, idx) => {
                          const itemPrice = currency === 'USD' ? item.product.priceUSD : item.product.priceLKR;
                          return (
                            <div 
                              key={`${item.product.id}-${idx}`} 
                              className="flex items-center justify-between gap-3 p-2 bg-neutral-50 dark:bg-neutral-900/20 border border-neutral-105 dark:border-neutral-900 rounded"
                            >
                              <div className="flex items-center space-x-3 text-left">
                                <img
                                  src={item.product.colors[0]?.imageUrl}
                                  alt={item.product.name}
                                  className="w-8 h-10 object-cover rounded border border-neutral-200 dark:border-neutral-800"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0">
                                  <h5 className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight text-[11px] truncate">
                                    {item.product.name}
                                  </h5>
                                  <p className="text-[9.5px] text-neutral-400 font-mono mt-0.5">
                                    Size Tag: <strong className="text-neutral-700 dark:text-neutral-300">{item.selectedSize}</strong> • Qty: <strong className="text-neutral-700 dark:text-neutral-300">{item.quantity}</strong>
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-200">
                                {formatCurrency(itemPrice * item.quantity, currency)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Calculations Subtotal Banner block */}
                    <div className="border-t border-neutral-100 dark:border-neutral-900 pt-4 flex justify-between items-center p-2.5 bg-neutral-900 text-white rounded">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 font-bold">TOTAL AMOUNT BILLED</span>
                      <span className="text-sm font-mono font-extrabold text-amber-400">
                        {formatCurrency(searchedOrder.total, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Support & Return instructions */}
                <div className="flex items-start gap-2.5 p-3.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded text-[11px] text-neutral-500 leading-normal text-left">
                  <HelpCircle className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 font-mono uppercase tracking-wide text-[9px] block">Need assistance changing parcel address?</span>
                    <span className="mt-0.5 block">
                      Connect instantly with our customer success desks on WhatsApp by citing your order code <strong>#{searchedOrder.orderId}</strong> for instant corrections or delivery requests.
                    </span>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
