import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  useSEO,
  getOrganizationSchema,
  getAutoRentalSchema,
  getBreadcrumbSchema,
} from '@/lib/seo';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  breadcrumbs?: { name: string; url?: string }[];
  structuredData?: Record<string, unknown>;
}

export function SEOHead({
  title,
  description,
  keywords,
  image,
  noIndex,
  breadcrumbs,
  structuredData,
}: SEOHeadProps) {
  const location = useLocation();

  useSEO({
    title,
    description,
    keywords,
    image,
    noIndex,
  });

  useEffect(() => {
    const schemas: Record<string, unknown>[] = [];

    schemas.push(
      getOrganizationSchema({
        name: 'Alkilator',
        url: window.location.origin,
        logo: `${window.location.origin}/images/Alkilator_logo.png`,
        phone: '+34 900 000 000',
        address: {
          street: 'Calle Principal 123',
          city: 'Madrid',
          postalCode: '28001',
          country: 'ES',
        },
      })
    );

    if (location.pathname === '/') {
      schemas.push(
        getAutoRentalSchema({
          name: 'Alkilator',
          url: window.location.origin,
          logo: `${window.location.origin}/images/Alkilator_logo.png`,
          phone: '+34 900 000 000',
          address: {
            street: 'Calle Principal 123',
            city: 'Madrid',
            postalCode: '28001',
            country: 'ES',
            lat: 40.4168,
            lng: -3.7038,
          },
          priceRange: '€€',
          openingHours: ['Mo-Fr 09:00-20:00', 'Sa 09:00-14:00'],
        })
      );
    }

    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push(getBreadcrumbSchema(breadcrumbs));
    }

    if (structuredData) {
      schemas.push(structuredData);
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text =
      schemas.length === 1
        ? JSON.stringify({
            '@context': 'https://schema.org',
            ...schemas[0],
          })
        : JSON.stringify(
            schemas.map((s) => ({
              '@context': 'https://schema.org',
              ...s,
            }))
          );

    document
      .querySelectorAll('script[type="application/ld+json"]')
      .forEach((s) => s.remove());
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [location.pathname, breadcrumbs, structuredData]);

  return null;
}

export function LandingSEO() {
  return (
    <SEOHead
      title="Alquiler de Coches"
      description="Alquila tu coche de forma rápida y sencilla. Amplia flota de vehículos, precios competitivos y servicio de calidad. Recogida en aeropuertos y ciudades principales."
      keywords={[
        'alquiler coches',
        'rent a car',
        'alquiler vehículos',
        'coches de alquiler',
        'alquiler coches baratos',
        'alquiler coche aeropuerto',
      ]}
    />
  );
}

export function SearchResultsSEO({
  location,
  dates,
}: {
  location?: string;
  dates?: string;
}) {
  return (
    <SEOHead
      title={`Coches disponibles${location ? ` en ${location}` : ''}`}
      description={`Encuentra el coche perfecto para tu viaje${location ? ` en ${location}` : ''}${dates ? ` - ${dates}` : ''}. Compara precios y reserva online al mejor precio garantizado.`}
      keywords={[
        'coches disponibles',
        'alquiler coches',
        ...(location ? [`alquiler coches ${location}`] : []),
      ]}
      breadcrumbs={[
        { name: 'Inicio', url: '/' },
        { name: 'Buscar vehículos' },
      ]}
    />
  );
}

export function BookingSEO({
  step,
}: {
  step: 'extras' | 'datos' | 'confirmar' | 'exito';
}) {
  const titles: Record<string, string> = {
    extras: 'Selecciona extras',
    datos: 'Datos del conductor',
    confirmar: 'Confirmar reserva',
    exito: 'Reserva confirmada',
  };

  return (
    <SEOHead
      title={titles[step]}
      description="Completa tu reserva de forma segura. Proceso de reserva rápido y sencillo."
      noIndex
    />
  );
}

export function FranchiseSEO() {
  return (
    <SEOHead
      title="Programa de Franquicias"
      description="Únete a la red de franquicias Alkilator. Modelo de negocio probado, soporte completo y tecnología de vanguardia para tu éxito."
      keywords={[
        'franquicia alquiler coches',
        'franquicia rent a car',
        'negocio alquiler vehículos',
        'oportunidad franquicia',
      ]}
      breadcrumbs={[
        { name: 'Inicio', url: '/' },
        { name: 'Franquicia' },
      ]}
    />
  );
}
