import { useEffect } from 'react';

interface ReactHelmetProps {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

/**
 * ReactHelmet component manages dynamic document head tags (SEO optimization)
 * safely and efficiently on modern React runtimes.
 */
export default function ReactHelmet({ 
  title, 
  description, 
  keywords, 
  ogTitle, 
  ogDescription,
  ogImage = "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=1200&auto=format&fit=crop&q=80"
}: ReactHelmetProps) {
  useEffect(() => {
    // 1. Title Management
    const baseTitle = "REED Apparel";
    const fullTitle = title.toLowerCase().includes(baseTitle.toLowerCase()) 
      ? title 
      : `${title} | ${baseTitle}`;
    
    document.title = fullTitle;

    // 2. Meta Description Management
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Meta Keywords Management
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }

    // 4. OpenGraph SEO Title Management
    let ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (!ogTitleTag) {
      ogTitleTag = document.createElement('meta');
      ogTitleTag.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitleTag);
    }
    ogTitleTag.setAttribute('content', ogTitle || fullTitle);

    // 5. OpenGraph SEO Description Management
    let ogDescTag = document.querySelector('meta[property="og:description"]');
    if (!ogDescTag) {
      ogDescTag = document.createElement('meta');
      ogDescTag.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescTag);
    }
    ogDescTag.setAttribute('content', ogDescription || description);

    // 6. OpenGraph SEO Image Management
    let ogImageTag = document.querySelector('meta[property="og:image"]');
    if (!ogImageTag) {
      ogImageTag = document.createElement('meta');
      ogImageTag.setAttribute('property', 'og:image');
      document.head.appendChild(ogImageTag);
    }
    ogImageTag.setAttribute('content', ogImage);

    // 7. OpenGraph SEO Type & Site Name Management
    let ogTypeTag = document.querySelector('meta[property="og:type"]');
    if (!ogTypeTag) {
      ogTypeTag = document.createElement('meta');
      ogTypeTag.setAttribute('property', 'og:type');
      document.head.appendChild(ogTypeTag);
    }
    ogTypeTag.setAttribute('content', 'website');

    let ogSiteTag = document.querySelector('meta[property="og:site_name"]');
    if (!ogSiteTag) {
      ogSiteTag = document.createElement('meta');
      ogSiteTag.setAttribute('property', 'og:site_name');
      document.head.appendChild(ogSiteTag);
    }
    ogSiteTag.setAttribute('content', 'REƎD Apparel Colombo');

  }, [title, description, keywords, ogTitle, ogDescription, ogImage]);

  return null;
}
