import { useEffect, useCallback, useRef, useState } from 'react';
import type { RefObject } from 'react';

// ==================== DEBOUNCE & THROTTLE ====================

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Hook de debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Hook de throttle
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + interval) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timerId = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval);

      return () => clearTimeout(timerId);
    }
  }, [value, interval]);

  return throttledValue;
}

// ==================== INTERSECTION OBSERVER ====================

export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [RefObject<HTMLElement | null>, boolean] {
  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [options.threshold, options.root, options.rootMargin]);

  return [elementRef, isVisible];
}

// Hook para lazy loading de componentes cuando son visibles
export function useLazyLoad(threshold = 0.1): [RefObject<HTMLElement | null>, boolean] {
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, hasLoaded]);

  return [elementRef, hasLoaded];
}

// ==================== PRELOADING ====================

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export function preloadImages(sources: string[]): Promise<void[]> {
  return Promise.all(sources.map(preloadImage));
}

export function preloadComponent(
  importFn: () => Promise<{ default: React.ComponentType<any> }>
): void {
  importFn();
}

// Preload en hover
export function usePreloadOnHover(
  importFn: () => Promise<{ default: React.ComponentType<any> }>
) {
  const preloaded = useRef(false);

  const onMouseEnter = useCallback(() => {
    if (!preloaded.current) {
      preloaded.current = true;
      importFn();
    }
  }, [importFn]);

  return { onMouseEnter };
}

// ==================== MEMOIZATION ====================

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);

    // Limitar tamaño del cache
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  }) as T;
}

// ==================== REQUEST IDLE CALLBACK ====================

export function requestIdleCallback(
  callback: () => void,
  options?: { timeout?: number }
): number {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }

  // Fallback para navegadores sin soporte
  return window.setTimeout(callback, options?.timeout || 1) as unknown as number;
}

export function cancelIdleCallback(id: number): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    window.clearTimeout(id);
  }
}

// Hook para ejecutar tareas en idle
export function useIdleCallback(callback: () => void, deps: readonly unknown[] = []) {
  useEffect(() => {
    const id = requestIdleCallback(callback);
    return () => cancelIdleCallback(id);
  }, deps);
}

// ==================== PERFORMANCE METRICS ====================

export interface PerformanceMetrics {
  FCP: number | null;
  LCP: number | null;
  FID: number | null;
  CLS: number | null;
  TTFB: number | null;
}

export function measureWebVitals(
  onMetric: (metric: { name: string; value: number }) => void
): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  // First Contentful Paint
  try {
    const paintObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          onMetric({ name: 'FCP', value: entry.startTime });
        }
      }
    });
    paintObserver.observe({ entryTypes: ['paint'] });
  } catch {
    // Algunos navegadores no soportan 'paint'
  }

  // Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      onMetric({ name: 'LCP', value: lastEntry.startTime });
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch {
    // Ignorar si no soportado
  }

  // First Input Delay
  try {
    const fidObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const fidEntry = entry as PerformanceEventTiming;
        onMetric({
          name: 'FID',
          value: fidEntry.processingStart - fidEntry.startTime,
        });
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch {
    // Ignorar
  }

  // Cumulative Layout Shift
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const layoutShift = entry as { hadRecentInput?: boolean; value?: number };
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value ?? 0;
          onMetric({ name: 'CLS', value: clsValue });
        }
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch {
    // Ignorar
  }

  // Time to First Byte
  try {
    const navEntry = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (navEntry) {
      onMetric({
        name: 'TTFB',
        value: navEntry.responseStart - navEntry.requestStart,
      });
    }
  } catch {
    // Ignorar
  }
}

// ==================== MEMORY MANAGEMENT ====================

export function useCleanup(cleanup: () => void) {
  useEffect(() => {
    return cleanup;
  }, []);
}

// Hook para detectar memory leaks en desarrollo
export function useMemoryWarning(componentName: string) {
  useEffect(() => {
    if (import.meta.env.DEV && typeof (performance as any).memory?.usedJSHeapSize === 'number') {
      const startMemory = (performance as any).memory.usedJSHeapSize;

      return () => {
        const endMemory = (performance as any).memory?.usedJSHeapSize;
        if (endMemory && startMemory && endMemory > startMemory + 5000000) {
          console.warn(
            `[Memory Warning] ${componentName} may have a memory leak. ` +
              `Memory increased by ${((endMemory - startMemory) / 1000000).toFixed(2)}MB`
          );
        }
      };
    }
  }, [componentName]);
}
