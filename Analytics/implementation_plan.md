# Full-Funnel Web Analytics & Tracking Strategy for REED Clothing

**Platform**: [reed-clothing-website.web.app](https://reed-clothing-website.web.app)  
**Stack**: React 19 + Vite + Firebase + Tailwind · GTM container `GTM-K46READ` already installed  
**Existing State**: Basic `dataLayer.push()` helper exists (`triggerGtmEvent`) pushing `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, `add_to_wishlist`, and `add_review` events — but the data layer schema is **not GA4 Enhanced E-commerce compliant**, and no ad pixels are connected.

---

## User Review Required

> [!IMPORTANT]
> **Ad Platform Pixel IDs Needed**: You must provide the following IDs before I can implement the ad pixel tags. I will use placeholder values for now.
> - **GA4 Measurement ID** (e.g., `G-XXXXXXXXXX`)
> - **Meta Pixel ID** (e.g., `1234567890123456`)
> - **TikTok Pixel ID** (e.g., `CXXXXXXXXXXXXXXXXX`)
> - **Google Ads Conversion ID** (e.g., `AW-XXXXXXXXX`)
> - **Google Ads Purchase Conversion Label** (e.g., `AbCdEfGhIj`)

> [!WARNING]
> **Consent Management**: This plan includes a basic consent banner implementation. If you are targeting EU/UK users, you should consider a full CMP (Consent Management Platform) like Cookiebot or OneTrust. For Sri Lanka-focused operations, the current approach provides adequate PII protection. Please confirm your primary audience geography.

> [!IMPORTANT]
> **Meta Conversions API (CAPI)**: Server-side event tracking via Meta CAPI requires a server endpoint (typically via a cloud function). Since your backend is a simple Express server (`server.ts`), I can add a CAPI relay endpoint there. Confirm if you want this included or prefer browser-only pixel tracking for now.

---

## Open Questions

1. **Do you have existing GA4, Meta, TikTok, and Google Ads accounts?** If not, I can guide you through account creation first.
2. **Do you want server-side tracking (Meta CAPI)?** This improves data accuracy by ~15-20% but requires adding a server route and access token configuration.
3. **What is your primary conversion goal?** The WhatsApp order confirmation (step 3 of checkout) or the bank transfer confirmation? This affects how we define the "purchase" conversion event.
4. **Do you want to track the WhatsApp click-through** as a secondary conversion event across all ad platforms?

---

## Proposed Changes

### 1. Data Layer Architecture — GA4 Enhanced E-commerce Compliance

The current `triggerGtmEvent` helper pushes flat key-value pairs. GA4 Enhanced E-commerce requires a structured `ecommerce` object with `items[]` arrays. We need to refactor **every** event to comply.

#### Full Event Taxonomy & Data Layer Schemas

| Funnel Stage | Event Name | Trigger Point | GA4 Standard? |
|---|---|---|---|
| **Awareness** | `page_view` | Every route change | ✅ Auto via GA4 config |
| **Discovery** | `view_item_list` | Collection grid renders / filter changes | ✅ |
| **Interest** | `select_item` | Product card click | ✅ |
| **Consideration** | `view_item` | Product detail modal opens | ✅ |
| **Intent** | `add_to_wishlist` | Wishlist toggle | ✅ |
| **Action** | `add_to_cart` | Add to cart button | ✅ |
| **Checkout** | `view_cart` | Cart sidebar opens | ✅ |
| **Checkout** | `begin_checkout` | Checkout wizard opens | ✅ |
| **Checkout** | `add_shipping_info` | Step 1 → Step 2 transition | ✅ |
| **Checkout** | `add_payment_info` | Step 2 confirm (bank transfer selected) | ✅ |
| **Conversion** | `purchase` | Order confirmed (Step 3) | ✅ |
| **Engagement** | `whatsapp_click` | WhatsApp CTA clicked | Custom |
| **Engagement** | `add_review` | Review submitted | Custom |
| **Engagement** | `share` | Product shared (future) | ✅ |

**Example Data Layer Push (GA4-compliant `add_to_cart`):**
```javascript
window.dataLayer.push({
  event: 'add_to_cart',
  ecommerce: {
    currency: 'LKR',
    value: 5400,
    items: [{
      item_id: 'reed-navy-crewneck',
      item_name: 'REED Signature Heavyweight Crewneck - Admiral Navy',
      item_category: 'Signature',
      item_variant: 'Admiral Navy / L',
      price: 5400,
      quantity: 1,
      item_brand: 'REED'
    }]
  }
});
```

---

### 2. Code Implementation

#### [MODIFY] [App.tsx](file:///c:/Users/Navod_09089/OneDrive%20-%20Dialog%20Axiata%20PLC/Back%20Up%20files/Prototype%20Porjects/REED-Clothing-WebSite-main/src/App.tsx)

**Refactor `triggerGtmEvent` → `pushEcommerceEvent`**: Replace the existing flat-push helper with a GA4 Enhanced E-commerce compliant function that:
- Clears the previous `ecommerce` object before each push (GA4 requirement)
- Structures all events with proper `ecommerce.items[]` arrays
- Includes `currency` and `value` at the ecommerce level
- Adds `item_brand: 'REED'` to all items

**Add new event triggers for**:
- `view_item_list` — fired when the product grid renders and on filter/sort changes
- `select_item` — fired when a user clicks a product card
- `view_cart` — fired when the cart sidebar opens
- `add_shipping_info` — fired when checkout step 1 completes
- `add_payment_info` — fired when checkout step 2 confirms
- `whatsapp_click` — fired when the WhatsApp CTA is clicked in step 3

**Add virtual page view tracking**: Push `page_view` events on route changes (React SPA doesn't trigger real page loads).

---

#### [NEW] [analytics.ts](file:///c:/Users/Navod_09089/OneDrive%20-%20Dialog%20Axiata%20PLC/Back%20Up%20files/Prototype%20Porjects/REED-Clothing-WebSite-main/src/analytics.ts)

Create a dedicated analytics module that:
- Houses the `pushEcommerceEvent()` helper
- Provides `formatItemForGA4()` to standardize product → GA4 item mapping
- Provides `formatCartForGA4()` to convert cart arrays
- Implements PII scrubbing before any `dataLayer` push
- Handles consent state checks (only fires if user has consented)

```typescript
// Core type for GA4 item
interface GA4Item {
  item_id: string;
  item_name: string;
  item_brand: string;
  item_category: string;
  item_variant?: string;
  price: number;
  quantity: number;
  index?: number;
}

// Clear + push pattern (mandatory for GA4 e-commerce)
function pushEcommerceEvent(eventName: string, ecommerceData: object, additionalParams?: object) {
  window.dataLayer.push({ ecommerce: null }); // Clear previous
  window.dataLayer.push({
    event: eventName,
    ecommerce: ecommerceData,
    ...additionalParams
  });
}
```

---

#### [MODIFY] [CheckoutWizard.tsx](file:///c:/Users/Navod_09089/OneDrive%20-%20Dialog%20Axiata%20PLC/Back%20Up%20files/Prototype%20Porjects/REED-Clothing-WebSite-main/src/components/CheckoutWizard.tsx)

- Fire `add_shipping_info` when step 1 → step 2 transition occurs
- Fire `add_payment_info` when step 2 → step 3 (order confirmation)
- Fire `whatsapp_click` when the WhatsApp link is clicked
- Accept `onTrackEvent` prop from App.tsx (dependency injection for tracking)

---

#### [MODIFY] [CartSidebar.tsx](file:///c:/Users/Navod_09089/OneDrive%20-%20Dialog%20Axiata%20PLC/Back%20Up%20files/Prototype%20Porjects/REED-Clothing-WebSite-main/src/components/CartSidebar.tsx)

- Fire `view_cart` event when the sidebar opens
- Fire `remove_from_cart` when an item is removed

---

#### [MODIFY] [ProductCard.tsx](file:///c:/Users/Navod_09089/OneDrive%20-%20Dialog%20Axiata%20PLC/Back%20Up%20files/Prototype%20Porjects/REED-Clothing-WebSite-main/src/components/ProductCard.tsx)

- Fire `select_item` event when a product card is clicked

---

#### [NEW] [ConsentBanner.tsx](file:///c:/Users/Navod_09089/OneDrive%20-%20Dialog%20Axiata%20PLC/Back%20Up%20files/Prototype%20Porjects/REED-Clothing-WebSite-main/src/components/ConsentBanner.tsx)

A minimal, GDPR-style consent banner component that:
- Displays on first visit (checks `localStorage` for consent state)
- Offers "Accept All" / "Essential Only" options
- Sets `consent_mode` in `dataLayer` for GTM consent integration
- Stores consent state in `localStorage`
- Styled consistently with REED's dark/minimal aesthetic

---

### 3. GTM Container Configuration (Manual Steps via GTM UI)

> [!NOTE]
> The following GTM configurations must be done in the [GTM web interface](https://tagmanager.google.com/) for container `GTM-K46READ`. I will provide exact names, trigger types, and firing rules.

#### Variables to Create

| Variable Name | Type | Value/Path |
|---|---|---|
| `DLV - ecommerce.currency` | Data Layer Variable | `ecommerce.currency` |
| `DLV - ecommerce.value` | Data Layer Variable | `ecommerce.value` |
| `DLV - ecommerce.items` | Data Layer Variable | `ecommerce.items` |
| `DLV - ecommerce.transaction_id` | Data Layer Variable | `ecommerce.transaction_id` |
| `DLV - page_type` | Data Layer Variable | `page_type` |
| `DLV - user_consent` | Data Layer Variable | `user_consent` |
| `Const - GA4 Measurement ID` | Constant | `G-XXXXXXXXXX` |
| `Const - Meta Pixel ID` | Constant | `YOUR_META_PIXEL_ID` |
| `Const - TikTok Pixel ID` | Constant | `YOUR_TIKTOK_PIXEL_ID` |
| `Const - Google Ads ID` | Constant | `AW-XXXXXXXXX` |
| `Const - Google Ads Purchase Label` | Constant | `YOUR_CONVERSION_LABEL` |

#### Triggers to Create

| Trigger Name | Type | Condition |
|---|---|---|
| `CE - view_item_list` | Custom Event | Event = `view_item_list` |
| `CE - select_item` | Custom Event | Event = `select_item` |
| `CE - view_item` | Custom Event | Event = `view_item` |
| `CE - add_to_cart` | Custom Event | Event = `add_to_cart` |
| `CE - view_cart` | Custom Event | Event = `view_cart` |
| `CE - begin_checkout` | Custom Event | Event = `begin_checkout` |
| `CE - add_shipping_info` | Custom Event | Event = `add_shipping_info` |
| `CE - add_payment_info` | Custom Event | Event = `add_payment_info` |
| `CE - purchase` | Custom Event | Event = `purchase` |
| `CE - add_to_wishlist` | Custom Event | Event = `add_to_wishlist` |
| `CE - whatsapp_click` | Custom Event | Event = `whatsapp_click` |
| `CE - add_review` | Custom Event | Event = `add_review` |
| `All Pages` | Page View | All Pages (built-in) |

#### Tags to Create

##### GA4 Tags

| Tag Name | Type | Trigger | Config |
|---|---|---|---|
| `GA4 - Configuration` | Google Tag | All Pages | Measurement ID = `{{Const - GA4 Measurement ID}}` |
| `GA4 - view_item_list` | GA4 Event | CE - view_item_list | Event = `view_item_list`, E-commerce enabled |
| `GA4 - select_item` | GA4 Event | CE - select_item | Event = `select_item`, E-commerce enabled |
| `GA4 - view_item` | GA4 Event | CE - view_item | Event = `view_item`, E-commerce enabled |
| `GA4 - add_to_cart` | GA4 Event | CE - add_to_cart | Event = `add_to_cart`, E-commerce enabled |
| `GA4 - view_cart` | GA4 Event | CE - view_cart | Event = `view_cart`, E-commerce enabled |
| `GA4 - begin_checkout` | GA4 Event | CE - begin_checkout | Event = `begin_checkout`, E-commerce enabled |
| `GA4 - add_shipping_info` | GA4 Event | CE - add_shipping_info | Event = `add_shipping_info`, E-commerce enabled |
| `GA4 - add_payment_info` | GA4 Event | CE - add_payment_info | Event = `add_payment_info`, E-commerce enabled |
| `GA4 - purchase` | GA4 Event | CE - purchase | Event = `purchase`, E-commerce enabled |
| `GA4 - add_to_wishlist` | GA4 Event | CE - add_to_wishlist | Event = `add_to_wishlist`, E-commerce enabled |

##### Meta Pixel Tags

| Tag Name | Type | Trigger | Config |
|---|---|---|---|
| `Meta - Base Pixel` | Custom HTML | All Pages | Meta Pixel base code with `fbq('init', ...)` |
| `Meta - ViewContent` | Custom HTML | CE - view_item | `fbq('track', 'ViewContent', {...})` |
| `Meta - AddToCart` | Custom HTML | CE - add_to_cart | `fbq('track', 'AddToCart', {...})` |
| `Meta - InitiateCheckout` | Custom HTML | CE - begin_checkout | `fbq('track', 'InitiateCheckout', {...})` |
| `Meta - Purchase` | Custom HTML | CE - purchase | `fbq('track', 'Purchase', {...})` |
| `Meta - AddToWishlist` | Custom HTML | CE - add_to_wishlist | `fbq('track', 'AddToWishlist', {...})` |

##### TikTok Pixel Tags

| Tag Name | Type | Trigger | Config |
|---|---|---|---|
| `TikTok - Base Pixel` | Custom HTML | All Pages | TikTok Pixel base code with `ttq.load(...)` |
| `TikTok - ViewContent` | Custom HTML | CE - view_item | `ttq.track('ViewContent', {...})` |
| `TikTok - AddToCart` | Custom HTML | CE - add_to_cart | `ttq.track('AddToCart', {...})` |
| `TikTok - InitiateCheckout` | Custom HTML | CE - begin_checkout | `ttq.track('InitiateCheckout', {...})` |
| `TikTok - CompletePayment` | Custom HTML | CE - purchase | `ttq.track('CompletePayment', {...})` |

##### Google Ads Tags

| Tag Name | Type | Trigger | Config |
|---|---|---|---|
| `Google Ads - Remarketing` | Google Ads Remarketing | All Pages | Conversion ID = `{{Const - Google Ads ID}}` |
| `Google Ads - Purchase Conversion` | Google Ads Conversion | CE - purchase | Conv ID + Label, Value = `{{DLV - ecommerce.value}}`, Currency = `{{DLV - ecommerce.currency}}` |

---

### 4. GA4 Custom Dimensions & Funnel Explorations

#### Custom Dimensions to Register (GA4 Admin → Custom Definitions)

| Dimension Name | Scope | Event Parameter |
|---|---|---|
| `product_category` | Event | `item_category` |
| `payment_method` | Event | `payment_method` |
| `selected_size` | Event | `item_variant` |
| `page_type` | Event | `page_type` |
| `gender_filter` | Event | `gender_filter` |
| `whatsapp_order_id` | Event | `transaction_id` |

#### Funnel Exploration Setup (GA4 → Explore → Funnel Exploration)

**Primary Purchase Funnel:**
```
Step 1: view_item_list     → "Browsed Collection"
Step 2: select_item        → "Clicked Product"  
Step 3: view_item          → "Viewed Product Details"
Step 4: add_to_cart        → "Added to Cart"
Step 5: begin_checkout     → "Started Checkout"
Step 6: add_shipping_info  → "Entered Delivery Details"
Step 7: add_payment_info   → "Confirmed Payment Method"
Step 8: purchase           → "Order Completed"
```

**Engagement Funnel:**
```
Step 1: view_item          → "Viewed Product"
Step 2: add_to_wishlist    → "Wishlisted"
Step 3: add_to_cart        → "Added to Cart"
Step 4: purchase           → "Purchased"
```

**Segment Breakdowns:**
- By `item_category` (Signature vs Essentials vs Limited)
- By `device_category` (Mobile vs Desktop)
- By `gender_filter` (Men vs Women)
- By traffic source (`session_source / session_medium`)

---

### 5. Looker Studio Reporting Dashboard

#### Data Connection
- Connect GA4 property via the native **Google Analytics** connector in Looker Studio
- Use **BigQuery Export** (if enabled) for raw event-level data

#### Recommended Dashboard Pages

| Page | Key Metrics | Visualizations |
|---|---|---|
| **Executive Overview** | Sessions, Users, Revenue, Conversion Rate, AOV | Scorecards + trend lines |
| **Funnel Performance** | Step completion rates, drop-off % per step | Funnel bar chart |
| **Product Performance** | Top products by views/carts/purchases, conversion rate per product | Table + bar chart |
| **Traffic Acquisition** | Sessions by source/medium, conversion rate by channel | Pie chart + table |
| **Ad Platform ROAS** | Spend vs Revenue by platform (Meta/Google/TikTok) | Multi-metric table |
| **Audience Segments** | New vs Returning, Device split, Gender, Geography | Donut charts |

---

### 6. PII Compliance & Privacy

#### Implementation Safeguards

1. **No PII in Data Layer**: Customer name, email, phone, and address are **never** pushed to `dataLayer`. Only hashed identifiers (SHA-256 of email) are used for enhanced conversions.
2. **Consent-Gated Firing**: All marketing tags (Meta, TikTok, Google Ads) fire only after user consent via the consent banner.
3. **GTM Consent Mode v2**: Implement Google Consent Mode v2 with default `denied` state for `ad_storage` and `analytics_storage`, updated to `granted` upon user acceptance.
4. **Data Retention**: Configure GA4 data retention to 14 months (max).
5. **IP Anonymization**: GA4 automatically anonymizes IP addresses (enabled by default).

#### Consent Mode Implementation

```javascript
// Default consent state (BEFORE GTM loads)
window.dataLayer.push({
  'consent_default': {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied'
  }
});

// After user accepts (pushed by ConsentBanner component)
window.dataLayer.push({
  event: 'consent_update',
  'ad_storage': 'granted',
  'ad_user_data': 'granted',
  'ad_personalization': 'granted',
  'analytics_storage': 'granted'
});
```

---

## Verification Plan

### Automated Tests
- Use **GTM Preview/Debug Mode** to verify every event fires with correct parameters
- Use **GA4 DebugView** (GA4 → Admin → DebugView) to validate real-time event ingestion
- Use **Meta Pixel Helper** (Chrome extension) to verify Meta events
- Use **TikTok Pixel Helper** (Chrome extension) to verify TikTok events

### Manual Verification
1. Walk through the complete purchase flow and verify each event fires in sequence:
   - Load site → `page_view` ✓
   - Scroll to products → `view_item_list` ✓
   - Click product card → `select_item` ✓
   - Modal opens → `view_item` ✓
   - Click wishlist → `add_to_wishlist` ✓
   - Add to cart → `add_to_cart` ✓
   - Open cart → `view_cart` ✓
   - Click checkout → `begin_checkout` ✓
   - Fill details → `add_shipping_info` ✓
   - Confirm order → `add_payment_info` + `purchase` ✓
   - Click WhatsApp → `whatsapp_click` ✓

2. Verify **no PII** (name, email, phone, address) appears in any `dataLayer` push
3. Verify consent banner blocks marketing tags when "Essential Only" is selected
4. Cross-check GA4 real-time report matches the events fired
5. Verify all ad pixel events contain matching `value` and `currency` parameters
