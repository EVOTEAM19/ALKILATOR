import { useEffect, useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';

// ==================== FOCUS MANAGEMENT ====================

// Trap focus dentro de un elemento (para modales)
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement | undefined;
    const lastFocusable = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement | undefined;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    firstFocusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isActive]);

  return containerRef;
}

// Restaurar foco al cerrar modal
export function useRestoreFocus() {
  const previousElement = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousElement.current = document.activeElement as HTMLElement | null;
  }, []);

  const restoreFocus = useCallback(() => {
    previousElement.current?.focus();
  }, []);

  return { saveFocus, restoreFocus };
}

// Focus visible (skip en click, visible en keyboard)
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const hadKeyboardEvent = useRef(false);

  useEffect(() => {
    const onKeyDown = () => {
      hadKeyboardEvent.current = true;
    };

    const onPointerDown = () => {
      hadKeyboardEvent.current = false;
    };

    const onFocus = () => {
      if (hadKeyboardEvent.current) {
        setIsFocusVisible(true);
      }
    };

    const onBlur = () => {
      setIsFocusVisible(false);
    };

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('focus', onFocus, true);
    document.addEventListener('blur', onBlur, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('focus', onFocus, true);
      document.removeEventListener('blur', onBlur, true);
    };
  }, []);

  return isFocusVisible;
}

// ==================== SCREEN READER ====================

// Anuncios para screen readers
export function useAnnounce() {
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', priority);
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;

      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    },
    []
  );

  return announce;
}

// Hook para anunciar cambios de página
export function usePageAnnounce(title: string) {
  const announce = useAnnounce();

  useEffect(() => {
    announce(`Página cargada: ${title}`);
  }, [title, announce]);
}

// ==================== KEYBOARD NAVIGATION ====================

// Navegación con flechas en listas
export function useArrowNavigation(
  items: HTMLElement[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
    onSelect?: (index: number) => void;
  } = {}
) {
  const { orientation = 'vertical', loop = true, onSelect } = options;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const vertical = orientation === 'vertical' || orientation === 'both';
      const horizontal = orientation === 'horizontal' || orientation === 'both';

      let newIndex = activeIndex;

      switch (e.key) {
        case 'ArrowDown':
          if (vertical) {
            e.preventDefault();
            newIndex = activeIndex + 1;
          }
          break;
        case 'ArrowUp':
          if (vertical) {
            e.preventDefault();
            newIndex = activeIndex - 1;
          }
          break;
        case 'ArrowRight':
          if (horizontal) {
            e.preventDefault();
            newIndex = activeIndex + 1;
          }
          break;
        case 'ArrowLeft':
          if (horizontal) {
            e.preventDefault();
            newIndex = activeIndex - 1;
          }
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = items.length - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect?.(activeIndex);
          return;
        default:
          return;
      }

      if (loop) {
        if (newIndex < 0) newIndex = items.length - 1;
        if (newIndex >= items.length) newIndex = 0;
      } else {
        newIndex = Math.max(0, Math.min(items.length - 1, newIndex));
      }

      setActiveIndex(newIndex);
      items[newIndex]?.focus();
    },
    [activeIndex, items, orientation, loop, onSelect]
  );

  return { activeIndex, setActiveIndex, handleKeyDown };
}

// Escape para cerrar
export function useEscapeKey(onEscape: () => void, isActive = true) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, isActive]);
}

// ==================== REDUCED MOTION ====================

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// ==================== COLOR CONTRAST ====================

export function usePrefersColorScheme(): 'light' | 'dark' {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setColorScheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return colorScheme;
}

// Verificar contraste de color (WCAG AA = 4.5:1, AAA = 7:1)
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rs, gs, bs] = [r, g, b].map((c) => {
      const normalized = c / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAG(
  color1: string,
  color2: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(color1, color2);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

// ==================== SKIP LINKS ====================

export function SkipLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
      {children}
    </a>
  );
}

// ==================== LIVE REGIONS ====================

export function LiveRegion({
  children,
  'aria-live': ariaLive = 'polite',
  'aria-atomic': ariaAtomic = true,
  className,
}: {
  children: ReactNode;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      className={className}
    >
      {children}
    </div>
  );
}
