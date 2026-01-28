import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholderSrc?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

// Generar URL de imagen optimizada (para Cloudinary, Imgix, etc.)
function getOptimizedUrl(src: string, width?: number, quality = 80): string {
  // Si es una URL de Supabase Storage
  if (src.includes('supabase.co/storage')) {
    const url = new URL(src);
    if (width) {
      url.searchParams.set('width', width.toString());
    }
    url.searchParams.set('quality', quality.toString());
    return url.toString();
  }

  // Si ya es una URL externa, devolver como está
  return src;
}

// Generar srcset para responsive images
function generateSrcSet(src: string, sizes: number[]): string {
  return sizes
    .map((size) => `${getOptimizedUrl(src, size)} ${size}w`)
    .join(', ');
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  placeholderSrc,
  loading = 'lazy',
  priority = false,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true);
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [priority, loading]);

  // Preload para imágenes prioritarias
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Responsive sizes
  const sizes = [320, 640, 768, 1024, 1280, 1536];
  const srcSet = generateSrcSet(src, sizes);
  const sizesAttr = width
    ? `(max-width: ${width}px) 100vw, ${width}px`
    : '100vw';

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width: width ?? undefined, height: height ?? undefined }}
    >
      {/* Skeleton mientras carga */}
      {!isLoaded && !hasError && (
        <Skeleton className="absolute inset-0" />
      )}

      {/* Placeholder de baja resolución */}
      {placeholderSrc && !isLoaded && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-lg scale-110"
          aria-hidden
        />
      )}

      {/* Imagen principal */}
      {isInView && !hasError && (
        <img
          src={getOptimizedUrl(src, width)}
          srcSet={srcSet}
          sizes={sizesAttr}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground text-sm">Error al cargar imagen</span>
        </div>
      )}
    </div>
  );
}

// Componente para imágenes de fondo optimizadas
export function OptimizedBackgroundImage({
  src,
  className,
  children,
}: {
  src: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={cn('relative bg-muted transition-opacity duration-300', className)}
      style={{
        backgroundImage: isLoaded ? `url(${src})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {children}
    </div>
  );
}
