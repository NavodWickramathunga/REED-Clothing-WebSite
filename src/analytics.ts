/**
 * REED Clothing — Analytics & Tracking Module
 * 
 * Provides GA4 Enhanced E-commerce compliant data layer pushes,
 * PII scrubbing, consent gating, and standardized item formatting.
 * 
 * All ad-platform events (Meta Pixel, TikTok Pixel, Google Ads)
 * are fired through GTM tags listening to these same dataLayer events.
 */

import { Product, CartItem } from './types';

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

/** GA4 standard item schema */
export interface GA4Item {
  item_id: string;
  item_name: string;
  item_brand: string;
  item_category: string;
  item_variant?: string;
  price: number;
  quantity: number;
  index?: number;
}

/** Consent state stored in localStorage */
export type ConsentLevel = 'all' | 'essential' | 'pending';

declare global {
  interface Window {
    dataLayer: Record<string, any>[];
  }
}

// ---------------------------------------------------------------------------
// Consent Management
// ---------------------------------------------------------------------------

const CONSENT_STORAGE_KEY = 'reed_tracking_consent';

/** Read consent state from localStorage. Defaults to 'pending'. */
export function getConsentState(): ConsentLevel {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === 'all' || stored === 'essential') return stored;
  } catch (_) { /* ignore */ }
  return 'pending';
}

/** Persist consent choice and push consent update to dataLayer. */
export function setConsentState(level: ConsentLevel): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, level);
  } catch (_) { /* ignore */ }

  const granted = level === 'all' ? 'granted' : 'denied';

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'consent_update',
    ad_storage: granted,
    ad_user_data: granted,
    ad_personalization: granted,
    analytics_storage: level === 'essential' ? 'granted' : granted, // analytics always OK for essential
  });
}

/** Returns true if marketing/analytics tracking is permitted. */
export function isTrackingAllowed(): boolean {
  const consent = getConsentState();
  return consent === 'all' || consent === 'essential';
}

// ---------------------------------------------------------------------------
// Item Formatters
// ---------------------------------------------------------------------------

/**
 * Converts a REED Product to a GA4-standard item object.
 * No PII is included.
 */
export function formatProductForGA4(
  product: Product,
  currency: 'USD' | 'LKR',
  opts?: { quantity?: number; variant?: string; index?: number }
): GA4Item {
  return {
    item_id: product.id,
    item_name: product.name,
    item_brand: 'REED',
    item_category: product.category || 'Uncategorized',
    item_variant: opts?.variant || undefined,
    price: currency === 'USD' ? product.priceUSD : product.priceLKR,
    quantity: opts?.quantity || 1,
    ...(opts?.index !== undefined ? { index: opts.index } : {}),
  };
}

/**
 * Converts an array of CartItems to GA4-standard items with variant info.
 */
export function formatCartForGA4(
  cartItems: CartItem[],
  currency: 'USD' | 'LKR'
): GA4Item[] {
  return cartItems.map((item, idx) => ({
    item_id: item.product.id,
    item_name: item.product.name,
    item_brand: 'REED',
    item_category: item.product.category || 'Uncategorized',
    item_variant: `${item.selectedColor} / ${item.selectedSize}`,
    price: currency === 'USD' ? item.product.priceUSD : item.product.priceLKR,
    quantity: item.quantity,
    index: idx,
  }));
}

/**
 * Calculate the total value of a cart in the given currency.
 */
export function calculateCartValue(
  cartItems: CartItem[],
  currency: 'USD' | 'LKR'
): number {
  return cartItems.reduce((acc, item) => {
    const price = currency === 'USD' ? item.product.priceUSD : item.product.priceLKR;
    return acc + price * item.quantity;
  }, 0);
}

// ---------------------------------------------------------------------------
// Core Data Layer Push (GA4 Enhanced E-commerce compliant)
// ---------------------------------------------------------------------------

/**
 * Push a GA4 Enhanced E-commerce event to the dataLayer.
 * 
 * ⚠️  GA4 REQUIREMENT: The `ecommerce` object must be cleared
 *     before each new push to prevent stale data leaking between events.
 * 
 * This function also gates on consent — if user hasn't consented,
 * events are silently dropped.
 */
export function pushEcommerceEvent(
  eventName: string,
  ecommerceData: Record<string, any>,
  additionalParams?: Record<string, any>
): void {
  if (!isTrackingAllowed()) return;

  window.dataLayer = window.dataLayer || [];

  // 1. Clear previous ecommerce object (GA4 mandatory pattern)
  window.dataLayer.push({ ecommerce: null });

  // 2. Push the new event with structured ecommerce data
  window.dataLayer.push({
    event: eventName,
    ecommerce: ecommerceData,
    ...(additionalParams || {}),
  });
}

/**
 * Push a non-ecommerce custom event to the dataLayer.
 * Used for events like `whatsapp_click`, `add_review`, etc.
 */
export function pushCustomEvent(
  eventName: string,
  params: Record<string, any>
): void {
  if (!isTrackingAllowed()) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...scrubPII(params),
  });
}

/**
 * Push a virtual page view for SPA navigation.
 */
export function pushPageView(
  pagePath: string,
  pageTitle: string,
  pageType?: string
): void {
  if (!isTrackingAllowed()) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'page_view',
    page_path: pagePath,
    page_title: pageTitle,
    page_type: pageType || 'general',
  });
}

// ---------------------------------------------------------------------------
// PII Scrubbing
// ---------------------------------------------------------------------------

/** Keys that should NEVER be pushed to the dataLayer. */
const PII_KEYS = new Set([
  'customerName', 'customer_name', 'name',
  'email', 'phone', 'telephone', 'tel',
  'address', 'street', 'postalCode', 'postal_code', 'zipCode', 'zip_code',
  'city', 'notes', 'paymentReference', 'payment_reference',
]);

/** Patterns that look like PII values (email, phone numbers). */
const PII_PATTERNS = [
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/,          // email
  /^\+?[\d\s\-()]{8,}$/,                  // phone number
];

/**
 * Deep-scrub an object to remove any PII before dataLayer push.
 * Returns a new object with PII keys removed.
 */
function scrubPII(data: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip known PII keys
    if (PII_KEYS.has(key)) continue;

    // Skip values that match PII patterns
    if (typeof value === 'string' && PII_PATTERNS.some(p => p.test(value))) continue;

    // Recurse into nested objects (but not arrays — items are trusted)
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      clean[key] = scrubPII(value);
    } else {
      clean[key] = value;
    }
  }

  return clean;
}

// ---------------------------------------------------------------------------
// High-Level Event Helpers
// ---------------------------------------------------------------------------

/**
 * Track when a list of products is viewed (collection grid, search results).
 */
export function trackViewItemList(
  products: Product[],
  currency: 'USD' | 'LKR',
  listName: string = 'Collection Grid'
): void {
  const items = products.slice(0, 20).map((p, idx) =>
    formatProductForGA4(p, currency, { index: idx })
  );

  pushEcommerceEvent('view_item_list', {
    item_list_name: listName,
    items,
  });
}

/**
 * Track when a user clicks/selects a product from a list.
 */
export function trackSelectItem(
  product: Product,
  currency: 'USD' | 'LKR',
  index?: number
): void {
  pushEcommerceEvent('select_item', {
    items: [formatProductForGA4(product, currency, { index })],
  });
}

/**
 * Track when a product detail view is opened.
 */
export function trackViewItem(
  product: Product,
  currency: 'USD' | 'LKR'
): void {
  const price = currency === 'USD' ? product.priceUSD : product.priceLKR;

  pushEcommerceEvent('view_item', {
    currency,
    value: price,
    items: [formatProductForGA4(product, currency)],
  });
}

/**
 * Track when a product is added to cart.
 */
export function trackAddToCart(
  product: Product,
  currency: 'USD' | 'LKR',
  quantity: number,
  size: string,
  color: string
): void {
  const price = currency === 'USD' ? product.priceUSD : product.priceLKR;

  pushEcommerceEvent('add_to_cart', {
    currency,
    value: price * quantity,
    items: [formatProductForGA4(product, currency, {
      quantity,
      variant: `${color} / ${size}`,
    })],
  });
}

/**
 * Track when a product is removed from cart.
 */
export function trackRemoveFromCart(
  item: CartItem,
  currency: 'USD' | 'LKR'
): void {
  const price = currency === 'USD' ? item.product.priceUSD : item.product.priceLKR;

  pushEcommerceEvent('remove_from_cart', {
    currency,
    value: price * item.quantity,
    items: [formatProductForGA4(item.product, currency, {
      quantity: item.quantity,
      variant: `${item.selectedColor} / ${item.selectedSize}`,
    })],
  });
}

/**
 * Track when the cart sidebar is opened/viewed.
 */
export function trackViewCart(
  cartItems: CartItem[],
  currency: 'USD' | 'LKR'
): void {
  pushEcommerceEvent('view_cart', {
    currency,
    value: calculateCartValue(cartItems, currency),
    items: formatCartForGA4(cartItems, currency),
  });
}

/**
 * Track when the checkout process begins.
 */
export function trackBeginCheckout(
  cartItems: CartItem[],
  currency: 'USD' | 'LKR'
): void {
  pushEcommerceEvent('begin_checkout', {
    currency,
    value: calculateCartValue(cartItems, currency),
    items: formatCartForGA4(cartItems, currency),
  });
}

/**
 * Track when shipping information is submitted (checkout step 1 → step 2).
 */
export function trackAddShippingInfo(
  cartItems: CartItem[],
  currency: 'USD' | 'LKR'
): void {
  pushEcommerceEvent('add_shipping_info', {
    currency,
    value: calculateCartValue(cartItems, currency),
    shipping_tier: 'Standard Delivery',
    items: formatCartForGA4(cartItems, currency),
  });
}

/**
 * Track when payment information is confirmed (checkout step 2 → step 3).
 */
export function trackAddPaymentInfo(
  cartItems: CartItem[],
  currency: 'USD' | 'LKR',
  paymentMethod: string
): void {
  pushEcommerceEvent('add_payment_info', {
    currency,
    value: calculateCartValue(cartItems, currency),
    payment_type: paymentMethod,
    items: formatCartForGA4(cartItems, currency),
  });
}

/**
 * Track a completed purchase.
 */
export function trackPurchase(
  orderId: string,
  cartItems: CartItem[],
  currency: 'USD' | 'LKR',
  totalValue: number,
  paymentMethod: string
): void {
  pushEcommerceEvent('purchase', {
    transaction_id: orderId,
    currency,
    value: totalValue,
    payment_type: paymentMethod,
    items: formatCartForGA4(cartItems, currency),
  });
}

/**
 * Track when an item is added to the wishlist.
 */
export function trackAddToWishlist(
  product: Product,
  currency: 'USD' | 'LKR'
): void {
  const price = currency === 'USD' ? product.priceUSD : product.priceLKR;

  pushEcommerceEvent('add_to_wishlist', {
    currency,
    value: price,
    items: [formatProductForGA4(product, currency)],
  });
}

/**
 * Track a WhatsApp CTA click (custom event, not e-commerce).
 */
export function trackWhatsAppClick(
  orderId: string,
  totalValue: number,
  currency: 'USD' | 'LKR'
): void {
  pushCustomEvent('whatsapp_click', {
    order_id: orderId,
    value: totalValue,
    currency,
  });
}

/**
 * Track a product review submission (custom event).
 */
export function trackAddReview(
  productId: string,
  rating: number
): void {
  pushCustomEvent('add_review', {
    item_id: productId,
    rating,
  });
}
