import {
  Suspense,
  lazy,
  ComponentType,
  useState,
  useEffect,
  useRef,
} from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface LazyComponentProps {
  loader: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  loadingDelay?: number;
  props?: Record<string, unknown>;
}

// Componente lazy con Suspense
export function LazyComponent({
  loader,
  fallback,
  loadingDelay = 200,
  props = {},
}: LazyComponentProps) {
  const LazyComp = lazy(loader);

  return (
    <Suspense fallback={fallback ?? <DefaultFallback delay={loadingDelay} />}>
      <LazyComp {...props} />
    </Suspense>
  );
}

// Fallback con delay para evitar flash
function DefaultFallback({ delay }: { delay: number }) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!showLoader) return null;

  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// HOC para lazy loading cuando el componente es visible
export function withLazyLoad<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: {
    fallback?: React.ReactNode;
    rootMargin?: string;
    threshold?: number;
  } = {}
) {
  const LazyComp = lazy(importFn);

  return function LazyLoadWrapper(props: P) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const element = ref.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        {
          rootMargin: options.rootMargin ?? '100px',
          threshold: options.threshold ?? 0,
        }
      );

      observer.observe(element);
      return () => observer.disconnect();
    }, []);

    return (
      <div ref={ref}>
        {isVisible ? (
          <Suspense
            fallback={options.fallback ?? <Skeleton className="h-40 w-full" />}
          >
            <LazyComp {...props} />
          </Suspense>
        ) : (
          options.fallback ?? <Skeleton className="h-40 w-full" />
        )}
      </div>
    );
  };
}

// Preload componente en idle
export function preloadLazyComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>
) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => importFn());
  } else {
    setTimeout(() => importFn(), 1);
  }
}
