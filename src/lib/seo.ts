import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ==================== META TAGS ====================

export interface MetaTagsConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  locale?: string;
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterSite?: string;
  noIndex?: boolean;
  canonical?: string;
}

const DEFAULT_CONFIG: Partial<MetaTagsConfig> = {
  siteName: 'Alkilator',
  locale: 'es_ES',
  type: 'website',
  twitterCard: 'summary_large_image',
  image: '/og-image.jpg',
};

export function setMetaTags(config: MetaTagsConfig): void {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const {
    title,
    description,
    keywords,
    image,
    url,
    type,
    locale,
    siteName,
    twitterCard,
    twitterSite,
    noIndex,
    canonical,
  } = fullConfig;

  // Title
  document.title = `${title} | ${siteName}`;

  // Helper para actualizar/crear meta tags
  const setMeta = (name: string, content: string, property = false) => {
    const attr = property ? 'property' : 'name';
    let meta = document.querySelector(
      `meta[${attr}="${name}"]`
    ) as HTMLMetaElement | null;

    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attr, name);
      document.head.appendChild(meta);
    }

    meta.content = content;
  };

  // Basic meta tags
  setMeta('description', description);
  if (keywords?.length) {
    setMeta('keywords', keywords.join(', '));
  }

  // Robots
  if (noIndex) {
    setMeta('robots', 'noindex, nofollow');
  } else {
    setMeta('robots', 'index, follow');
  }

  // Canonical
  let canonicalLink = document.querySelector(
    'link[rel="canonical"]'
  ) as HTMLLinkElement | null;
  if (canonical) {
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;
  } else if (canonicalLink) {
    canonicalLink.remove();
  }

  // Open Graph
  setMeta('og:title', title, true);
  setMeta('og:description', description, true);
  setMeta('og:type', type ?? 'website', true);
  setMeta('og:locale', locale ?? 'es_ES', true);
  setMeta('og:site_name', siteName ?? 'Alkilator', true);

  if (url) setMeta('og:url', url, true);
  if (image) setMeta('og:image', image, true);

  // Twitter
  setMeta('twitter:card', twitterCard ?? 'summary_large_image');
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);
  if (image) setMeta('twitter:image', image);
  if (twitterSite) setMeta('twitter:site', twitterSite);
}

// Hook para SEO
export function useSEO(config: MetaTagsConfig) {
  const location = useLocation();

  useEffect(() => {
    const url = `${window.location.origin}${location.pathname}`;
    setMetaTags({ ...config, url, canonical: url });
  }, [config.title, config.description, config.keywords, config.image, config.noIndex, location.pathname]);
}

// ==================== STRUCTURED DATA (Schema.org) ====================

export interface Organization {
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone: string;
    contactType: string;
    areaServed?: string;
    availableLanguage?: string[];
  };
  sameAs?: string[];
  address?: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressCountry: string;
  };
}

export interface LocalBusiness extends Organization {
  '@type': 'LocalBusiness' | 'AutoRental';
  priceRange?: string;
  openingHours?: string[];
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
}

export interface Product {
  '@type': 'Product';
  name: string;
  description: string;
  image: string;
  brand?: {
    '@type': 'Brand';
    name: string;
  };
  offers: {
    '@type': 'Offer';
    price: number;
    priceCurrency: string;
    availability: string;
    priceValidUntil?: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
}

export interface BreadcrumbList {
  '@type': 'BreadcrumbList';
  itemListElement: {
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }[];
}

export interface FAQPage {
  '@type': 'FAQPage';
  mainEntity: {
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }[];
}

export function setStructuredData(data: Record<string, unknown>): void {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify({
    '@context': 'https://schema.org',
    ...data,
  });

  const existingScript = document.querySelector(
    'script[type="application/ld+json"]'
  );
  if (existingScript) {
    existingScript.remove();
  }

  document.head.appendChild(script);
}

// Hook para structured data
export function useStructuredData(data: Record<string, unknown>) {
  useEffect(() => {
    setStructuredData(data);

    return () => {
      const script = document.querySelector(
        'script[type="application/ld+json"]'
      );
      if (script) script.remove();
    };
  }, [data]);
}

// Structured data predefinidos
export function getOrganizationSchema(config: {
  name: string;
  url: string;
  logo: string;
  phone?: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  socialLinks?: string[];
}): Organization {
  return {
    '@type': 'Organization',
    name: config.name,
    url: config.url,
    logo: config.logo,
    ...(config.phone && {
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: config.phone,
        contactType: 'customer service',
        areaServed: 'ES',
        availableLanguage: ['Spanish', 'English'],
      },
    }),
    ...(config.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: config.address.street,
        addressLocality: config.address.city,
        postalCode: config.address.postalCode,
        addressCountry: config.address.country,
      },
    }),
    ...(config.socialLinks && { sameAs: config.socialLinks }),
  };
}

export function getAutoRentalSchema(config: {
  name: string;
  url: string;
  logo: string;
  phone: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  priceRange?: string;
  openingHours?: string[];
}): LocalBusiness {
  return {
    '@type': 'AutoRental',
    name: config.name,
    url: config.url,
    logo: config.logo,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: config.phone,
      contactType: 'reservations',
      areaServed: 'ES',
      availableLanguage: ['Spanish', 'English'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: config.address.street,
      addressLocality: config.address.city,
      postalCode: config.address.postalCode,
      addressCountry: config.address.country,
    },
    ...(config.address.lat != null &&
      config.address.lng != null && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: config.address.lat,
          longitude: config.address.lng,
        },
      }),
    priceRange: config.priceRange ?? '€€',
    openingHours: config.openingHours ?? [
      'Mo-Fr 09:00-20:00',
      'Sa 09:00-14:00',
    ],
  };
}

export function getVehicleProductSchema(vehicle: {
  name: string;
  description: string;
  image: string;
  brand: string;
  price: number;
  available: boolean;
}): Product {
  return {
    '@type': 'Product',
    name: vehicle.name,
    description: vehicle.description,
    image: vehicle.image,
    brand: {
      '@type': 'Brand',
      name: vehicle.brand,
    },
    offers: {
      '@type': 'Offer',
      price: vehicle.price,
      priceCurrency: 'EUR',
      availability: vehicle.available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };
}

export function getBreadcrumbSchema(
  items: { name: string; url?: string }[]
): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}

export function getFAQSchema(
  faqs: { question: string; answer: string }[]
): FAQPage {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
