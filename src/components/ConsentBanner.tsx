import React, { useState, useEffect } from 'react';
import { Shield, Cookie, X } from 'lucide-react';
import { getConsentState, setConsentState, ConsentLevel } from '../analytics';

/**
 * REED Clothing — Cookie / Tracking Consent Banner
 * 
 * A minimal, elegant consent banner that:
 * - Displays on first visit when consent is 'pending'
 * - Offers "Accept All" (full tracking) or "Essential Only" (analytics only)
 * - Pushes consent updates to dataLayer for GTM Consent Mode v2
 * - Persists consent choice in localStorage
 * - Styled to match REED's dark/minimal premium aesthetic
 */

interface ConsentBannerProps {
  onConsentChange?: (level: ConsentLevel) => void;
}

export default function ConsentBanner({ onConsentChange }: ConsentBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if consent hasn't been set yet
    const current = getConsentState();
    if (current === 'pending') {
      // Small delay for a smoother entrance
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    setConsentState('all');
    setVisible(false);
    onConsentChange?.('all');
  };

  const handleEssentialOnly = () => {
    setConsentState('essential');
    setVisible(false);
    onConsentChange?.('essential');
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[60] animate-fade-in"
      id="consent-banner"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
              <Cookie className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-xs font-bold tracking-wide text-neutral-900 dark:text-white uppercase">
              Privacy & Cookies
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pb-4">
          <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400 mb-4">
            We use cookies and tracking technologies to enhance your shopping experience,
            analyze site traffic, and enable personalized advertising across Meta, Google, and TikTok.
            Your data is never sold, and no personal information is shared with third parties without your consent.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAcceptAll}
              className="flex-1 py-2.5 bg-black dark:bg-amber-400 text-white dark:text-neutral-950 rounded-lg text-[10px] font-bold tracking-widest uppercase hover:bg-neutral-800 dark:hover:bg-amber-500 transition-all cursor-pointer"
              id="consent-accept-all"
            >
              Accept All
            </button>
            <button
              onClick={handleEssentialOnly}
              className="flex-1 py-2.5 bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 rounded-lg text-[10px] font-bold tracking-widest uppercase hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all border border-neutral-200 dark:border-neutral-800 cursor-pointer"
              id="consent-essential-only"
            >
              Essential Only
            </button>
          </div>

          {/* Privacy Note */}
          <div className="flex items-center justify-center space-x-1.5 mt-3 text-[9px] text-neutral-400 dark:text-neutral-500 font-mono">
            <Shield className="w-3 h-3" />
            <span>PII-protected · No data resale · GDPR-aligned</span>
          </div>
        </div>
      </div>
    </div>
  );
}
