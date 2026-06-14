import React, { useState } from 'react';
import { CartItem, OrderDetails } from '../types';
import { formatCurrency, generateWhatsAppMessage } from '../utils';
import { X, ArrowRight, ArrowLeft, CheckCircle2, Truck, MessageSquare, Copy } from 'lucide-react';

interface CheckoutWizardProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currency: 'USD' | 'LKR';
  whatsappNumber: string;
  onOrderCompleted: (order: OrderDetails) => void;
}

export default function CheckoutWizard({
  isOpen,
  onClose,
  cartItems,
  currency,
  whatsappNumber,
  onOrderCompleted,
}: CheckoutWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Request browser Notification permissions on mount safely
  React.useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(console.error);
      }
    }
  }, [isOpen]);

  const sendOrderNotification = (order: OrderDetails) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const amountFormatted = formatCurrency(currency === 'USD' ? order.totalUSD : order.totalLKR, currency);
        new Notification(`Order Confirmed! 👕`, {
          body: `Order #${order.orderId} totaling ${amountFormatted} is ready. Please contact us via WhatsApp!`,
          icon: `/favicon.ico`
        });
      } catch (err) {
        console.error("Failed to send Web Notification", err);
      }
    }
  };

  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Generated Order state
  const [completedOrder, setCompletedOrder] = useState<OrderDetails | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => {
    const price = currency === 'USD' ? item.product.priceUSD : item.product.priceLKR;
    return acc + price * item.quantity;
  }, 0);

  const totalUSD = currency === 'USD' ? subtotal : subtotal / 300;
  const totalLKR = currency === 'LKR' ? subtotal : subtotal * 300;

  // Handle step 1: Delivery Details
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !email || !address || !city) {
      alert('Please fill in all required delivery information.');
      return;
    }
    setStep(2);
  };

  // Handle step 2: Confirm Order
  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    
    const fakeRef = 'COD-' + Math.floor(100000 + Math.random() * 900000);
    const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
    
    const newOrder: OrderDetails = {
      orderId,
      customerName,
      phone,
      email,
      address,
      city,
      postalCode,
      notes: orderNotes,
      paymentMethod: 'BankTransfer',
      paymentReference: fakeRef,
      paymentStatus: 'Pending',
      items: cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        color: item.selectedColor,
        size: item.selectedSize,
        price: currency === 'USD' ? item.product.priceUSD : item.product.priceLKR,
        quantity: item.quantity,
      })),
      totalUSD,
      totalLKR,
      timestamp: new Date().toISOString(),
    };

    setCompletedOrder(newOrder);
    onOrderCompleted(newOrder);
    sendOrderNotification(newOrder);
    setStep(3);
  };

  // Generate WhatsApp link
  const formattedWhatsAppUrl = () => {
    if (!completedOrder) return '#';
    
    const formattedItems = completedOrder.items.map(item => ({
      productName: item.productName,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      price: formatCurrency(item.price, currency),
    }));

    const totalStr = formatCurrency(currency === 'USD' ? completedOrder.totalUSD : completedOrder.totalLKR, currency);
    
    const encoded = generateWhatsAppMessage(
      completedOrder.orderId,
      {
        name: completedOrder.customerName,
        phone: completedOrder.phone,
        email: completedOrder.email,
        address: completedOrder.address,
        city: completedOrder.city,
      },
      formattedItems,
      totalStr,
      'Bank Transfer (Commercial Bank)',
      completedOrder.paymentReference,
      completedOrder.notes
    );

    const cleanNo = whatsappNumber.replace(/[^0-9+]/g, '');
    return `https://wa.me/${cleanNo}?text=${encoded}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col border border-neutral-100 dark:border-neutral-850" id="checkout-wizard">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-850 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900">
          <div>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">Bank Transfer</span>
            <h2 className="text-md font-serif font-extrabold text-neutral-900 dark:text-white tracking-tight">
              {step === 1 ? '1. Delivery Details' : step === 2 ? '2. Review & Confirm' : '3. Order Complete'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-black dark:hover:text-white transition-all cursor-pointer"
            id="close-checkout-wizard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8">
          
          {/* Progress Indicators */}
          <div className="flex items-center space-x-2 mb-8 select-none">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step >= 1 ? 'bg-black text-white dark:bg-amber-400 dark:text-neutral-950' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-650'
            }`}>
              1
            </span>
            <span className="flex-grow h-[1px] bg-neutral-200 dark:bg-neutral-800" />
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step >= 2 ? 'bg-black text-white dark:bg-amber-400 dark:text-neutral-950' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-650'
            }`}>
              2
            </span>
            <span className="flex-grow h-[1px] bg-neutral-200 dark:bg-neutral-800" />
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step >= 3 ? 'bg-black text-white dark:bg-amber-400 dark:text-neutral-950' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-650'
            }`}>
              3
            </span>
          </div>

          {/* STEP 1: DELIVERY DETAILS */}
          {step === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400 mb-1 font-mono">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="E.g., Kevin Perera"
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white rounded text-xs focus:ring-1 focus:ring-black dark:focus:ring-amber-450 focus:border-black dark:focus:border-amber-400 outline-none placeholder-neutral-400 dark:placeholder-neutral-600"
                    id="checkout-name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400 mb-1 font-mono">WhatsApp Telephone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="E.g., +94 77 123 4567"
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white rounded text-xs focus:ring-1 focus:ring-black dark:focus:ring-amber-450 focus:border-black dark:focus:border-amber-400 outline-none placeholder-neutral-400 dark:placeholder-neutral-600"
                    id="checkout-phone"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400 mb-1 font-mono">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E.g., kevin@domain.com"
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white rounded text-xs focus:ring-1 focus:ring-black dark:focus:ring-amber-450 focus:border-black dark:focus:border-amber-400 outline-none placeholder-neutral-400 dark:placeholder-neutral-600"
                  id="checkout-email"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400 mb-1 font-mono">Shipping Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House number, Street address"
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white rounded text-xs focus:ring-1 focus:ring-black dark:focus:ring-amber-450 focus:border-black dark:focus:border-amber-400 outline-none mb-2 placeholder-neutral-400 dark:placeholder-neutral-600"
                  id="checkout-address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400 mb-1 font-mono">Town / City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="E.g., Colombo"
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white rounded text-xs focus:ring-1 focus:ring-black dark:focus:ring-amber-450 focus:border-black dark:focus:border-amber-400 outline-none placeholder-neutral-400 dark:placeholder-neutral-600"
                    id="checkout-city"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400 mb-1 font-mono">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="E.g., 00100"
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white rounded text-xs focus:ring-1 focus:ring-black dark:focus:ring-amber-450 focus:border-black dark:focus:border-amber-400 outline-none placeholder-neutral-400 dark:placeholder-neutral-600"
                    id="checkout-postal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400 mb-1 font-mono">Special Delivery Instructions (Optional)</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Special instructions (e.g., Leave with security, knock gently)..."
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white rounded text-xs focus:ring-1 focus:ring-black dark:focus:ring-amber-450 focus:border-black dark:focus:border-amber-400 outline-none h-16 resize-none placeholder-neutral-400 dark:placeholder-neutral-600"
                  id="checkout-notes"
                />
              </div>

              {/* Order summary */}
              <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border border-neutral-100 dark:border-neutral-850 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono">Products:</span>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white mt-0.5 font-sans">
                    {cartItems.map(i => `${i.quantity} x ${i.product.name} (${i.selectedSize})`).join(', ')}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono">Subtotal:</span>
                  <div className="text-sm font-extrabold text-black dark:text-white font-mono">
                    {formatCurrency(subtotal, currency)}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-black hover:bg-neutral-900 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-neutral-950 rounded-sm text-xs font-bold tracking-widest uppercase transition-all flex items-center space-x-2 cursor-pointer"
                  id="checkout-step1-next"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: REVIEW & CONFIRM */}
          {step === 2 && (
            <form onSubmit={handleStep2Next} className="space-y-6">
              {/* Customer Summary */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-mono">Delivery To</h3>
                <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border border-neutral-100 dark:border-neutral-850 space-y-2">
                  <div className="flex items-start space-x-2">
                    <Truck className="w-4 h-4 text-neutral-600 dark:text-neutral-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white">{customerName}</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">{address}</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">{city} {postalCode}</p>
                    </div>
                  </div>
                  <div className="border-t border-neutral-200 dark:border-neutral-800 pt-2">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400"><span className="font-semibold text-neutral-900 dark:text-neutral-200">Phone:</span> {phone}</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400"><span className="font-semibold text-neutral-900 dark:text-neutral-200">Email:</span> {email}</p>
                  </div>
                  {orderNotes && (
                    <div className="border-t border-neutral-200 dark:border-neutral-800 pt-2">
                      <p className="text-xs text-neutral-600 dark:text-neutral-400"><span className="font-semibold text-neutral-900 dark:text-neutral-200">Notes:</span> {orderNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-mono">Order Items</h3>
                <div className="space-y-2">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg border border-neutral-100 dark:border-neutral-850">
                      <div>
                        <p className="text-xs font-semibold text-neutral-900 dark:text-white">{item.product.name}</p>
                        <p className="text-[10px] text-neutral-600 dark:text-neutral-400">{item.selectedColor} / {item.selectedSize}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-white">{item.quantity} x {formatCurrency(currency === 'USD' ? item.product.priceUSD : item.product.priceLKR, currency)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method — Bank Transfer Details */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-mono">Payment — Bank Transfer</h3>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-300 dark:border-blue-800 p-4 rounded-lg space-y-3">
                  <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest">⚠️ Please transfer the total amount to the account below before confirming</p>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono">Bank</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">Commercial Bank</p>
                        <button type="button" onClick={() => handleCopy('Commercial Bank', 'bank1')} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded text-blue-600 dark:text-blue-400 cursor-pointer">
                          {copiedField === 'bank1' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono">Branch</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">Galle</p>
                        <button type="button" onClick={() => handleCopy('Galle', 'branch1')} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded text-blue-600 dark:text-blue-400 cursor-pointer">
                          {copiedField === 'branch1' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono">Account Name</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">S D S Dahanayaka</p>
                        <button type="button" onClick={() => handleCopy('S D S Dahanayaka', 'name1')} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded text-blue-600 dark:text-blue-400 cursor-pointer">
                          {copiedField === 'name1' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono">Account Number</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white font-mono tracking-wider">8026151171</p>
                        <button type="button" onClick={() => handleCopy('8026151171', 'acc1')} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded text-blue-600 dark:text-blue-400 cursor-pointer">
                          {copiedField === 'acc1' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 border-t border-blue-200 dark:border-blue-800 pt-2">After transferring, click <strong>Confirm Order</strong> and send us the receipt via WhatsApp.</p>
                </div>
              </div>

              {/* Total */}
              <div className="bg-black dark:bg-amber-400 text-white dark:text-neutral-950 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest">Total Amount</span>
                  <span className="text-lg font-extrabold font-mono">{formatCurrency(subtotal, currency)}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-sm text-xs font-bold tracking-widest uppercase transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black hover:bg-neutral-900 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-neutral-950 rounded-sm text-xs font-bold tracking-widest uppercase transition-all cursor-pointer"
                  id="checkout-step2-confirm"
                >
                  Confirm Order
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS & WHATSAPP */}
          {step === 3 && completedOrder && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-950/35 rounded-full flex items-center justify-center animate-pulse">
                    <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-serif font-extrabold text-neutral-900 dark:text-white">Order Confirmed!</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-450">Order ID: <span className="font-mono font-semibold text-neutral-900 dark:text-white">{completedOrder.orderId}</span></p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border border-neutral-100 dark:border-neutral-850 text-left space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono">Delivering To</span>
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white mt-1">{completedOrder.customerName}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">{completedOrder.address}, {completedOrder.city}</p>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3">
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono">Total Amount</span>
                  <p className="text-lg font-extrabold text-neutral-900 dark:text-white mt-1 font-mono">{formatCurrency(subtotal, currency)}</p>
                </div>
              </div>

              {/* Bank Transfer reminder on success */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/40 p-4 rounded-lg text-left">
                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2">💳 Complete Your Payment</p>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 mb-3">Please transfer the total amount to our bank account and send us the receipt via WhatsApp to confirm your order.</p>
                <div className="bg-white dark:bg-neutral-900 rounded p-3 space-y-1.5 border border-amber-200 dark:border-amber-900/40">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono">Bank</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">Commercial Bank</span>
                      <button type="button" onClick={() => handleCopy('Commercial Bank', 'bank2')} className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded text-amber-700 dark:text-amber-500 cursor-pointer">
                        {copiedField === 'bank2' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono">Branch</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">Galle</span>
                      <button type="button" onClick={() => handleCopy('Galle', 'branch2')} className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded text-amber-700 dark:text-amber-500 cursor-pointer">
                        {copiedField === 'branch2' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono">Account Name</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">S D S Dahanayaka</span>
                      <button type="button" onClick={() => handleCopy('S D S Dahanayaka', 'name2')} className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded text-amber-700 dark:text-amber-500 cursor-pointer">
                        {copiedField === 'name2' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-amber-100 dark:border-amber-900/30 pt-1.5">
                    <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono">Account No.</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-extrabold text-neutral-900 dark:text-white font-mono tracking-widest">8026151171</span>
                      <button type="button" onClick={() => handleCopy('8026151171', 'acc2')} className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded text-amber-700 dark:text-amber-500 cursor-pointer">
                        {copiedField === 'acc2' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-3">
                  After transferring, please send your <strong>payment receipt/screenshot</strong> to our WhatsApp number below so we can verify and confirm your order.
                </p>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <a
                  href={formattedWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-sm text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  id="checkout-whatsapp"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Receipt via WhatsApp →</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-black hover:bg-neutral-900 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-neutral-950 rounded-sm text-xs font-bold tracking-widest uppercase transition-all cursor-pointer"
                  id="checkout-complete"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
