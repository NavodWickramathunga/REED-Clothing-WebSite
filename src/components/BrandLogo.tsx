import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number; // Sets the general height or boundary scaling
}

export default function BrandLogo({ className = '', size = 50 }: BrandLogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`} id="brand-logo-root">
      {/* 
        This is a highly polished, responsive SVG wordmark representation of the REƎD Colombo brand logo.
        It uses Google's luxury 'Playfair Display' serif styling to render beautiful, razor-sharp vector letters,
        guaranteeing perfect high-contrast luxury branding that seamlessly adapts to light and dark themes.
      */}
      <svg
        height={size}
        viewBox="0 0 520 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-auto h-full select-none max-w-full"
        aria-label="REƎD BRAND LOGO"
      >
        <g className="fill-current transition-colors duration-300">
          {/* 
            We use absolute typographic mapping on Google's high-contrast Didone serif 'Playfair Display'.
            Letter spacing and positions are handcrafted to match the reference graphic, with the 
            open bars of E and mirrored Ǝ elegantly meeting at the center axis.
          */}
          
          {/* Letter R */}
          <text
            x="50"
            y="92"
            fontFamily="'Playfair Display', Didot, 'Times New Roman', Georgia, serif"
            fontSize="108"
            fontWeight="700"
            letterSpacing="0"
          >
            R
          </text>

          {/* Letter E */}
          <text
            x="162"
            y="92"
            fontFamily="'Playfair Display', Didot, 'Times New Roman', Georgia, serif"
            fontSize="108"
            fontWeight="700"
            letterSpacing="0"
          >
            E
          </text>

          {/* Letter Ǝ - Hand-mirrored using SVG transformation to align flawlessly with the back-end of E */}
          <text
            x="-356" /* Transformed coordinate on mirrored X-axis */
            y="92"
            fontFamily="'Playfair Display', Didot, 'Times New Roman', Georgia, serif"
            fontSize="108"
            fontWeight="700"
            letterSpacing="0"
            transform="scale(-1, 1)"
          >
            E
          </text>

          {/* Letter D */}
          <text
            x="378"
            y="92"
            fontFamily="'Playfair Display', Didot, 'Times New Roman', Georgia, serif"
            fontSize="108"
            fontWeight="700"
            letterSpacing="0"
          >
            D
          </text>
        </g>
      </svg>
    </div>
  );
}
