import React, { useState } from 'react';
import { CartItem, OrderDetails } from '../types';
import { formatCurrency, generateWhatsAppMessage } from '../utils';
import { X, ArrowRight, ArrowLeft, CreditCard, Landmark, CheckCircle2, Copy, Download, MessageSquare, PhoneCall, Truck } from 'lucide-react';

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
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3>(1);

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
        new Notification(`Order Compiled Successfully! 👕`, {
          body: `Order #${order.orderId} totaling ${amountFormatted} is completed. Please forward the slip to WhatsApp!`,
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

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'BankTransfer' | 'COD'>('Card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Sandbox payment gateway states
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authorizingStatus, setAuthorizingStatus] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  // Receipt file upload mock
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptName, setReceiptName] = useState('');

  // Generated Order state
  const [completedOrder, setCompletedOrder] = useState<OrderDetails | null>(null);
  const [hasCopiedMsg, setHasCopiedMsg] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => {
    const price = currency === 'USD' ? item.product.priceUSD : item.product.priceLKR;
    return acc + price * item.quantity;
  }, 0);

  const totalUSD = currency === 'USD' ? subtotal : subtotal / 300; // approximate conversions
  const totalLKR = currency === 'LKR' ? subtotal : subtotal * 300;

  // Handle billing validated next step
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !email || !address || !city) {
      alert('Please fill in all required delivery information.');
      return;
    }
    setStep(2);
  };

  // Run simulated express visual authorization for Google / Apple Pay
  const handleExpressCheckout = (gateway: 'ApplePay' | 'GooglePay') => {
    setIsAuthorizing(true);
    setAuthorizingStatus(`Initializing secure dynamic token handshake with ${gateway}...`);
    
    setTimeout(() => {
      setAuthorizingStatus(`Paying with Express biometric key. Authenticating secure payment card...`);
    }, 1000);

    setTimeout(() => {
      setAuthorizingStatus(`Biometrics authorized. Payment capture successful! Pushing order...`);
    }, 2200);

    setTimeout(() => {
      const fakeRef = `EXPRESS-${gateway === 'ApplePay' ? 'AP' : 'GP'}-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
      
      const newOrder: OrderDetails = {
        orderId,
        customerName: customerName || 'Express Customer',
        phone: phone || '+94 77 111 2222',
        email: email || 'express@reed-apparel.com',
        address: address || 'Express Pick-up Channel',
        city: city || 'Colombo',
        postalCode: postalCode || '00100',
        notes: '[EXPRESS WALLET AUTHORIZED] ' + orderNotes,
        paymentMethod: 'Card',
        paymentReference: fakeRef,
        paymentStatus: 'Paid',
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
        timestamp: new Date().toLocaleString(),
      };

      setCompletedOrder(newOrder);
      onOrderCompleted(newOrder);
      sendOrderNotification(newOrder);
      setIsAuthorizing(false);
      setStep(3);
    }, 3200);
  };

  // Simulating automated payment interface with live gateway simulations
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. If Cash On Delivery is chosen, enforce verified SMS OTP code
    if (paymentMethod === 'COD' && !isOtpStep) {
      setIsOtpStep(true);
      setOtpError('');
      return;
    }

    if (paymentMethod === 'COD' && isOtpStep) {
      const cleanOtp = otpInput.trim().toUpperCase();
      if (cleanOtp !== 'REED' && cleanOtp !== '7333') {
        setOtpError('Invalid authorization token. Please enter the simulated code "REED" or "7333" sent via SMS.');
        return;
      }
    }
    
    // Simulate payment authorization live loading states
    if (paymentMethod === 'Card') {
      setIsAuthorizing(true);
      setAuthorizingStatus("Establishing SSL tunnel to webxpay / PayHere gateway...");
      
      setTimeout(() => {
        setAuthorizingStatus("Dynamic 3D-Secure 2.0 authorization requested. Checking liability shift...");
      }, 1000);

      setTimeout(() => {
        setAuthorizingStatus("Verifying credit limits. Card Approved securely with Commercial Bank DB...");
      }, 2000);

      setTimeout(() => {
        const fakeRef = 'REED-CARD-' + Math.floor(100000 + Math.random() * 900000);
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
          paymentMethod,
          paymentReference: fakeRef,
          paymentStatus: 'Paid',
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
          timestamp: new Date().toLocaleString(),
        };

        setCompletedOrder(newOrder);
        onOrderCompleted(newOrder);
        sendOrderNotification(newOrder);
        setIsAuthorizing(false);
        setStep(3);
      }, 3000);

    } else {
      // Manual Bank Transfer upload or validated COD option
      const fakeRef = (paymentMethod === 'COD' ? 'COD-VERIFIED-' : 'BANK-REF-') + Math.floor(100000 + Math.random() * 900000);
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
        paymentMethod,
        paymentReference: fakeRef,
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
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
        timestamp: new Date().toLocaleString(),
      };

      setCompletedOrder(newOrder);
      onOrderCompleted(newOrder);
      sendOrderNotification(newOrder);
      setIsOtpStep(false);
      setOtpInput('');
      setStep(3);
    }
  };

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
      completedOrder.paymentMethod === 'Card' 
        ? 'Credit/Debit Card (Send secure pay-link manually via WhatsApp)' 
        : completedOrder.paymentMethod === 'BankTransfer' 
          ? 'Manual Bank Transfer Receipt Uploaded' 
          : 'Cash on Delivery',
      completedOrder.paymentReference,
      completedOrder.notes
    );

    // format phone number removing formatting symbols
    const cleanNo = whatsappNumber.replace(/[^0-9+]/g, '');
    return `https://wa.me/${cleanNo}?text=${encoded}`;
  };

  // Download simulation of the invoice
  const triggerInvoiceDownload = () => {
    if (!completedOrder) return;
    const documentContent = `
========================================
             REƎD APPAREL
========================================
INVOICE ID:   ${completedOrder.orderId}
DATE:         ${completedOrder.timestamp}
ORDER STATUS: CONFIRMED - READY TO SHIP
----------------------------------------
CUSTOMER:     ${completedOrder.customerName}
TELEPHONE:    ${completedOrder.phone}
ADDRESS:      ${completedOrder.address}, ${completedOrder.city}
========================================
ITEMS ORDERED:
${completedOrder.items.map((i, idx) => `
- ${i.productName}
  Variant: ${i.color} | Size: ${i.size}
  Quantity: ${i.quantity} x ${formatCurrency(i.price, currency)}
`).join('\n')}
----------------------------------------
PAYMENT METHOD: ${completedOrder.paymentMethod}
TRANSACTION ID: ${completedOrder.paymentReference}
----------------------------------------
TOTAL BILL:   ${formatCurrency(currency === 'USD' ? completedOrder.totalUSD : completedOrder.totalLKR, currency)}
=========================================================
For dispatch details, please forward receipt to Viva on WhatsApp.
`;
    const element = document.createElement("a");
    const file = new Blob([documentContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `REED_INVOICE_${completedOrder.orderId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col" id="checkout-wizard">
        {/* Header indicator */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
          <div>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">Secured order channel</span>
            <h2 className="text-md font-serif font-extrabold text-neutral-900 tracking-tight">
              {step === 1 ? '1. Delivery Details' : step === 2 ? '2. Pre-Payment Verification' : '3. Finalize & Order Complete'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-black transition-all"
            id="close-checkout-wizard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - MultiStep Container */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8">
          
          {/* Progress Indicators */}
          <div className="flex items-center space-x-2 mb-8 select-none">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step >= 1 ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400'
            }`}>
              1
            </span>
            <span className="flex-grow h-[1px] bg-neutral-200" />
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step >= 2 ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400'
            }`}>
              2
            </span>
            <span className="flex-grow h-[1px] bg-neutral-200" />
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step >= 3 ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400'
            }`}>
              3
            </span>
          </div>

          {/* STEP 1: BILLING DETAILS */}
          {step === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1 font-mono">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="E.g., Kevin Perera"
                    className="w-full px-3 py-2 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-black focus:border-black outline-none"
                    id="checkout-name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1 font-mono">WhatsApp Telephone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="E.g., +94 77 123 4567"
                    className="w-full px-3 py-2 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-black focus:border-black outline-none"
                    id="checkout-phone"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1 font-mono">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E.g., kevin@domain.com"
                  className="w-full px-3 py-2 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-black focus:border-black outline-none"
                  id="checkout-email"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1 font-mono">Shipping Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House number, Street address"
                  className="w-full px-3 py-2 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-black focus:border-black outline-none mb-2"
                  id="checkout-address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1 font-mono">Town / City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="E.g., Colombo"
                    className="w-full px-3 py-2 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-black focus:border-black outline-none"
                    id="checkout-city"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1 font-mono">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="E.g., 00100"
                    className="w-full px-3 py-2 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-black focus:border-black outline-none"
                    id="checkout-postal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1 font-mono">Special Delivery Instructions (Optional)</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Special instructions (e.g., Leave with security, knock gently) or size custom specifics..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-black focus:border-black outline-none h-16 resize-none"
                  id="checkout-notes"
                />
              </div>

              {/* Order quick overview summary inside Step 1 */}
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Products in order:</span>
                  <div className="text-xs font-semibold text-neutral-900 mt-0.5 font-sans">
                    {cartItems.map(i => `${i.quantity} x ${i.product.name} (${i.selectedSize})`).join(', ')}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Subtotal:</span>
                  <div className="text-sm font-extrabold text-black font-mono">
                    {formatCurrency(subtotal, currency)}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-black hover:bg-neutral-900 text-white rounded-sm text-xs font-bold tracking-widest uppercase transition-all flex items-center space-x-2 shadow"
                  id="checkout-step1-next"
                >
                  <span>Select Payment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
          {/* STEP 2: PAYMENT DESIGN */}
          {step === 2 && (
            <div className="space-y-6 relative">
              {/* 🛡️ SIMULATED HIGH-CONTRAST SECURE GATEWAY AUTHORIZATION SHIELD OVERLAY */}
              {isAuthorizing && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-40 flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-in">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-neutral-200 border-t-black animate-spin" />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-neutral-900">3DS</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-serif font-extrabold text-neutral-900 uppercase tracking-wider font-mono">Securing Gateway Handshake</h4>
                    <p className="text-xs text-neutral-500 max-w-xs mx-auto animate-pulse">{authorizingStatus}</p>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-neutral-100 px-3 py-1.5 border rounded text-[9px] font-mono text-neutral-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                    <span>LKR NATIONAL ESCROW GATEWAY SECURE SHIELD ACTIVE</span>
                  </div>
                </div>
              )}

              {/*  / G EXPRESS INTENTIONAL PAY BUTTONS */}
              {!isOtpStep && (
                <div className="space-y-2 pb-4 border-b border-neutral-100">
                  <span className="block text-[9px] uppercase font-bold tracking-widest text-neutral-400 font-mono">Express Checkout Option</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleExpressCheckout('ApplePay')}
                      className="py-3 bg-black text-white hover:bg-neutral-950 rounded-sm font-sans text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer border border-neutral-900 shadow-sm"
                    >
                      <span className="text-base"></span>
                      <span className="tracking-wide uppercase text-[10px]">Pay Express</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExpressCheckout('GooglePay')}
                      className="py-3 bg-white text-black hover:bg-neutral-50 rounded-sm font-semibold border border-neutral-250 text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
                    >
                      <span className="text-amber-500 font-extrabold font-serif">G</span>
                      <span className="tracking-wide uppercase text-[10px] font-bold text-neutral-800">Pay Express</span>
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                {/* Payment selector */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-2 font-mono">Choose Payment Channel:</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      disabled={isOtpStep}
                      onClick={() => setPaymentMethod('Card')}
                      className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                        paymentMethod === 'Card'
                          ? 'bg-black text-white border-black shadow'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-black hover:text-black'
                      } ${isOtpStep ? 'opacity-50 cursor-not-allowed' : ''}`}
                      id="choose-payment-card"
                    >
                      <CreditCard className="w-5 h-5 mb-1.5" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">Card Pay</span>
                    </button>
                    <button
                      type="button"
                      disabled={isOtpStep}
                      onClick={() => setPaymentMethod('BankTransfer')}
                      className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                        paymentMethod === 'BankTransfer'
                          ? 'bg-black text-white border-black shadow'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-black hover:text-black'
                      } ${isOtpStep ? 'opacity-50 cursor-not-allowed' : ''}`}
                      id="choose-payment-bank"
                    >
                      <Landmark className="w-5 h-5 mb-1.5" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">Bank Trans.</span>
                    </button>
                    <button
                      type="button"
                      disabled={isOtpStep}
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                        paymentMethod === 'COD' || isOtpStep
                          ? 'bg-black text-white border-black shadow'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-black hover:text-black'
                      }`}
                      id="choose-payment-cod"
                    >
                      <Truck className="w-5 h-5 mb-1.5" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">COD Island</span>
                    </button>
                  </div>
                </div>

                {/* Dynamic Sub-Forms depending on selection */}
                
                {/* Option A: High-Contrast Premium Card pay Mask Form */}
                {paymentMethod === 'Card' && !isOtpStep && (
                  <div className="p-5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-4 animate-fade-in animate-duration-300">
                    <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                      <div>
                        <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Secure Connection</span>
                        <h4 className="text-xs font-serif font-extrabold text-neutral-900 uppercase tracking-widest">WebXPay / Commercial Bank IPG</h4>
                      </div>
                      <div className="flex space-x-1">
                        <span className="px-1.5 py-0.5 bg-neutral-200 text-neutral-600 text-[8px] font-bold rounded font-mono">VISA</span>
                        <span className="px-1.5 py-0.5 bg-neutral-200 text-neutral-600 text-[8px] font-bold rounded font-mono">MC</span>
                        <span className="px-1.5 py-0.5 bg-neutral-200 text-neutral-600 text-[8px] font-bold rounded font-mono">AMEX</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-500 mb-1 font-mono">Card Holder Name</label>
                        <input
                          type="text"
                          required
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="e.g. Kevin Perera"
                          className="w-full bg-white px-3 py-2 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-black focus:border-black outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-500 mb-1 font-mono">Card Number</label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          maxLength={19}
                          onChange={(e) => {
                            // clean non-digits & auto format spaces
                            const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                            setCardNumber(val);
                          }}
                          placeholder="e.g. 4505 1234 5678 9010"
                          className="w-full bg-white px-3 py-2 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-black focus:border-black outline-none font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-500 mb-1 font-mono">Expiry Date</label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            value={expiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length > 2) {
                                val = val.substring(0, 2) + '/' + val.substring(2, 4);
                              }
                              setExpiry(val);
                            }}
                            placeholder="MM/YY"
                            className="w-full bg-white px-3 py-2 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-black focus:border-black outline-none font-mono text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-500 mb-1 font-mono">Secure CVV Code</label>
                          <input
                            type="password"
                            required
                            maxLength={3}
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                            placeholder="•••"
                            className="w-full bg-white px-3 py-2 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-black focus:border-black outline-none font-mono text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Option B: Direct Bank Deposit display & receipts uploads */}
                {paymentMethod === 'BankTransfer' && !isOtpStep && (
                  <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-4 animate-fade-in">
                    <div className="text-center pb-2 border-b border-neutral-200">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Beneficiary Details</span>
                      <h4 className="text-xs font-serif font-bold text-neutral-900 mt-1">REƎD Official Account</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Bank Name</span>
                        <span className="text-neutral-900 font-bold">Commercial Bank of Ceylon</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Branch Code</span>
                        <span className="text-neutral-900 font-bold">Colombo Fort - 012</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Account Number</span>
                        <span className="text-neutral-900 font-bold">8123-4567-8901</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Account Holder</span>
                        <span className="text-neutral-900 font-bold uppercase">REED COUTURE APPARELS</span>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-500/10 rounded border border-amber-500/20 text-[10px] text-neutral-600 leading-normal">
                      ⚠️ *Please capture a screenshot or transaction receipt* once the transfer is successful. You can upload the receipt below to instantly verify your payment details here!
                    </div>

                    {/* File Upload zone */}
                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-500 mb-1 font-mono">Transfer Receipt Upload</label>
                      <div className="border-2 border-dashed border-neutral-300 rounded p-4 text-center cursor-pointer hover:border-black transition-colors relative">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setReceiptFile(file);
                              setReceiptName(file.name);
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <span className="text-[10px] text-neutral-500 font-sans font-medium">
                          {receiptName ? `✓ ${receiptName}` : 'Drag & drop receipt or click here to upload proof'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Option C: COD disclaimer before OTP selection */}
                {paymentMethod === 'COD' && !isOtpStep && (
                  <div className="p-5 bg-neutral-50 rounded-lg border border-neutral-100 text-center space-y-3 animate-fade-in">
                    <Truck className="w-8 h-8 text-neutral-700 mx-auto animate-pulse" />
                    <h4 className="text-xs font-serif font-extrabold text-neutral-900">Cash on Delivery Confirmation</h4>
                    <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                      Paying on delivery incurs no extra fees! Your clothing will be dispatched via local courier partners. Please keep Rs. {totalLKR} ready upon arrival.
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono font-medium">
                      Note: You will require a quick mobile verification text challenge in the next step to confirm your shipment.
                    </p>
                  </div>
                )}

                {/* 📲 INTERACTIVE SMS OTP CHALLENGE STEP VIEW FOR COD */}
                {isOtpStep && (
                  <div className="p-5 bg-neutral-900 text-white rounded-lg border border-neutral-800 space-y-4 animate-fade-in">
                    <div className="text-center space-y-2">
                      <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[8px] font-bold uppercase tracking-widest font-mono rounded inline-block">Secure OTP Transmission</span>
                      <h4 className="text-xs font-serif font-bold tracking-wide uppercase text-white">Telephone Verification Token required</h4>
                      <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                        To lock your delivery slot and reduce custom courier overhead, we have sent an automated verification SMS.
                        Please enter the simulated cell code below:
                      </p>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10 rounded text-center space-y-2 max-w-xs mx-auto">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Simulated Cell Text Message:</span>
                      <div className="text-xs font-mono font-semibold text-amber-300">
                        "REED APPAREL COLOMBO CODE: <strong className="text-base select-all text-white bg-black px-1.5 py-0.5 rounded ml-1 tracking-wider border border-white/20">7333</strong>"
                      </div>
                    </div>

                    <div className="space-y-2 max-w-xs mx-auto">
                      <label className="block text-[8px] uppercase font-bold tracking-widest text-neutral-400 mb-1 text-center font-mono">Enter 4-Digit SMS Code</label>
                      <input
                        type="text"
                        required
                        value={otpInput}
                        maxLength={4}
                        onChange={(e) => {
                          setOtpInput(e.target.value);
                          setOtpError('');
                        }}
                        placeholder="e.g. 7333"
                        className="w-full bg-white text-black text-center px-4 py-3 border border-neutral-700 font-mono text-base font-black tracking-widest uppercase outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                      />
                      {otpError && (
                        <p className="text-[10px] font-bold text-red-400 text-center">{otpError}</p>
                      )}
                    </div>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOtpStep(false);
                          setOtpInput('');
                          setOtpError('');
                        }}
                        className="text-[9px] uppercase tracking-widest text-[#F5F5F7]/60 hover:text-white underline font-mono"
                      >
                        Change Payment Channel
                      </button>
                    </div>
                  </div>
                )}

                {/* Summary Bill info */}
                <div className="bg-neutral-900 text-white p-4 rounded-lg flex items-center justify-between font-mono border border-neutral-800">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block">Final Invoice Total:</span>
                    <span className="text-sm font-bold">{formatCurrency(subtotal, currency)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block">Status:</span>
                    <span className="text-xs text-amber-400 font-bold uppercase">{paymentMethod === 'COD' ? 'Pay On Delivery' : 'To Be Authorized'}</span>
                  </div>
                </div>

                {/* Navigation buttons */}
                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (isOtpStep) {
                        setIsOtpStep(false);
                        setOtpInput('');
                        setOtpError('');
                      } else {
                        setStep(1);
                      }
                    }}
                    className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-neutral-950 text-white hover:bg-black rounded-sm text-xs font-semibold tracking-widest uppercase transition-all flex items-center space-x-1.5 shadow cursor-pointer border border-neutral-800 font-mono"
                    id="checkout-step2-pay"
                  >
                    <span>{isOtpStep ? 'Verify shipment' : 'Authorize & Confirm'}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: ORDER SUCCESS & WHATSAPP GENERATION */}
          {step === 3 && completedOrder && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-md">
                <CheckCircle2 className="w-6 h-6 animate-bounce" />
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-600 font-semibold font-mono">Invoice Created Successfully</span>
                <h3 className="text-lg font-serif font-extrabold text-neutral-900 mt-0.5">Order ID: #{completedOrder.orderId}</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto leading-normal">
                  Thank you! Your invoice has been compiled. You must now push this order configuration to our manager Viva on WhatsApp to finalize shipment.
                </p>
              </div>

              {/* Invoice snapshot frame */}
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100 text-left space-y-3 font-mono text-[11px] text-neutral-700">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                  <span className="font-serif font-extrabold text-xs text-neutral-900 tracking-wider">REƎD BILLING</span>
                  <span className="text-[10px] text-neutral-400">{completedOrder.timestamp}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-neutral-450 block text-[9px]">CUSTOMER NAME</span>
                    <span className="text-neutral-900 font-bold">{completedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-450 block text-[9px]">SHIP TO ADDRESS</span>
                    <span className="text-neutral-900 font-bold truncate">{completedOrder.address}, {completedOrder.city}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-neutral-200 pt-2">
                  <span className="text-neutral-450 block text-[9px] mb-1">ITEMS PURCHASED</span>
                  {completedOrder.items.map((item, id) => (
                    <div key={id} className="flex justify-between font-bold text-neutral-900 py-0.5">
                      <span>{item.quantity} x {item.productName} ({item.size})</span>
                      <span>{formatCurrency(item.price * item.quantity, currency)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-neutral-200 pt-2 flex justify-between items-center bg-white p-2 border rounded">
                  <div>
                    <span className="text-[9px] text-neutral-400 font-bold block">REF CODE</span>
                    <span className="text-neutral-900 font-extrabold">{completedOrder.paymentReference}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-neutral-400 font-bold block font-mono">TOTAL PAID</span>
                    <span className="text-xs text-neutral-900 font-extrabold">{formatCurrency(currency === 'USD' ? completedOrder.totalUSD : completedOrder.totalLKR, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Invoice download and direct dispatch to Viva */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={triggerInvoiceDownload}
                  className="py-3 border border-neutral-300 text-neutral-700 hover:text-black hover:border-black rounded text-[11px] font-bold tracking-widest uppercase transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  id="download-invoice-txt"
                >
                  <Download className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Download Slip</span>
                </button>
                <button
                  onClick={() => {
                    const cleanMsg = decodeURIComponent(formattedWhatsAppUrl().split('?text=')[1] || '');
                    navigator.clipboard.writeText(cleanMsg).then(() => {
                      setHasCopiedMsg(true);
                      setTimeout(() => setHasCopiedMsg(false), 2000);
                    });
                  }}
                  className="py-3 border border-neutral-350 text-neutral-700 hover:text-black rounded text-[11px] font-bold tracking-widest uppercase transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  id="copy-order-msg"
                >
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{hasCopiedMsg ? 'Copied !' : 'Copy Message'}</span>
                </button>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <a
                  href={formattedWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center space-x-2.5 shadow-xl select-none"
                  id="complete-whatsapp-btn"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Complete & Chat on WhatsApp</span>
                </a>
                <span className="text-[10px] text-neutral-400 block mt-2 font-mono font-medium">Finalizing order opens Viva's direct chat window</span>
              </div>
            </div>
          )}

        </div>

        {/* Mobile Sticky Footer 'Total' button/bar for Step 1 */}
        {step === 1 && (
          <div className="md:hidden sticky bottom-0 bg-white border-t border-neutral-150 p-4 flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-20 animate-fade-in flex-shrink-0">
            <div className="flex flex-col">
              <span className="text-[8px] uppercase tracking-wider font-extrabold text-neutral-400 font-mono block">Order Total</span>
              <span className="text-sm font-extrabold font-mono text-black">
                {formatCurrency(subtotal, currency)}
              </span>
              <span className="text-[8px] text-neutral-400 font-medium">
                {cartItems.length} item(s) to dispatch
              </span>
            </div>
            <button
              onClick={(e) => {
                const nextBtn = document.getElementById('checkout-step1-next');
                if (nextBtn) {
                  nextBtn.click();
                }
              }}
              className="py-2.5 px-5 bg-black hover:bg-neutral-900 text-white rounded-sm text-[10px] font-bold tracking-widest uppercase transition-all flex items-center space-x-1 shadow-sm cursor-pointer"
            >
              <span>Next: Pay {formatCurrency(subtotal, currency)}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
