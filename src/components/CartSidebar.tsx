import React from 'react';
import { CartItem } from '../types';
import { formatCurrency } from '../utils';
import { X, Trash2, ArrowRight, ArrowLeft, Shield } from 'lucide-react';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (itemId: string, qty: number) => void;
  onRemoveItem: (itemId: string) => void;
  currency: 'USD' | 'LKR';
  onProceedToCheckout: () => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  currency,
  onProceedToCheckout,
}: CartSidebarProps) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => {
    const price = currency === 'USD' ? item.product.priceUSD : item.product.priceLKR;
    return acc + price * item.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      {/* Tap out background to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Drawer content frame */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in" id="cart-sidebar">
        {/* Header Section */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-md font-serif font-bold tracking-tight text-neutral-900">Your Shopping Bag</h3>
            <span className="text-[10px] bg-neutral-900 text-white rounded-full font-mono px-2 py-0.5 font-bold">
              {cartItems.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-50 transition-colors"
            id="close-cart-sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item Row List */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-4xl">👜</span>
              <p className="text-sm text-neutral-500 font-serif">Your shopping bag is completely empty</p>
              <button
                onClick={onClose}
                className="text-xs font-bold tracking-widest text-black underline uppercase hover:text-neutral-600 cursor-pointer"
              >
                Let's Add Something
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const itemPrice = currency === 'USD' ? item.product.priceUSD : item.product.priceLKR;
              return (
                <div key={item.id} className="flex space-x-4 pb-4 border-b border-neutral-100">
                  <div className="w-16 aspect-[3/4] rounded bg-neutral-50 overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.colors[0]?.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-grow flex flex-col">
                    <div className="flex justify-between">
                      <h4 className="text-xs font-bold text-neutral-900 line-clamp-1 pr-2">{item.product.name}</h4>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-neutral-400 hover:text-red-500 transition-colors cursor-pointer p-0.5"
                        id={`remove-item-${item.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    {/* Selected specifics */}
                    <div className="flex items-center space-x-2 mt-1 mb-2 text-[10px] text-neutral-500 font-mono">
                      <span>Color: {item.selectedColor}</span>
                      <span>|</span>
                      <span>Size: {item.selectedSize}</span>
                    </div>

                    <div className="flex justify-between items-center mt-auto">
                      {/* Quantity Toggles */}
                      <div className="flex items-center border border-neutral-200 rounded overflow-hidden bg-neutral-50 h-7 text-xs font-mono">
                        <button
                          onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                          className="px-2 hover:bg-neutral-100 text-neutral-600 hover:text-black"
                          id={`cart-qty-dec-${item.id}`}
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 font-bold text-neutral-900">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                          className="px-2 hover:bg-neutral-100 text-neutral-600 hover:text-black"
                          id={`cart-qty-inc-${item.id}`}
                        >
                          +
                        </button>
                      </div>

                      {/* Total Pricing info */}
                      <span className="text-xs font-bold font-mono text-neutral-900">
                        {formatCurrency(itemPrice * item.quantity, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Action / Checkout section */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-neutral-50 border-t border-neutral-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold font-mono">Estimated Subtotal</span>
              <span className="text-md font-extrabold font-mono text-black">
                {formatCurrency(subtotal, currency)}
              </span>
            </div>
            
            <p className="text-[10px] text-neutral-400 mb-4 leading-normal font-medium">To complete the purchase, orders are finalized on WhatsApp. Your checkout selections here will prepare the invoice, payment options, and delivery information instantly.</p>

            <button
              onClick={onProceedToCheckout}
              className="w-full py-4 bg-black text-white hover:bg-neutral-900 rounded-sm text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
              id="proceed-to-checkout-btn"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full mt-2.5 py-2 text-center text-xs font-semibold text-neutral-500 hover:text-black uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Keep Browsing</span>
            </button>

            <div className="flex items-center justify-center space-x-1 text-[9px] text-neutral-400 text-center font-mono font-medium mt-4">
              <Shield className="w-3.5 h-3.5 text-neutral-300" />
              <span>Secure Checkout Prepared</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
