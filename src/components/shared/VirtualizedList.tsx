import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  containerHeight?: number;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  className,
  containerHeight = 400,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const { visibleItems, startIndex, totalHeight } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;
    const endIndex = Math.min(items.length, startIndex + visibleCount);

    return {
      visibleItems: items.slice(startIndex, endIndex),
      startIndex,
      totalHeight: items.length * itemHeight,
    };
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={startIndex + index}
            style={{
              position: 'absolute',
              top: (startIndex + index) * itemHeight,
              height: itemHeight,
              width: '100%',
            }}
          >
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Versión con grid virtual
interface VirtualizedGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: number;
  className?: string;
  containerHeight?: number;
}

export function VirtualizedGrid<T>({
  items,
  itemWidth,
  itemHeight,
  renderItem,
  gap = 16,
  className,
  containerHeight = 400,
}: VirtualizedGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const { visibleItems, totalHeight } = useMemo(() => {
    const columns = Math.max(1, Math.floor((containerWidth + gap) / (itemWidth + gap)));
    const rows = Math.ceil(items.length / columns);
    const rowHeight = itemHeight + gap;
    const totalHeight = rows * rowHeight;

    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 1);
    const visibleRows = Math.ceil(containerHeight / rowHeight) + 2;
    const endRow = Math.min(rows, startRow + visibleRows);

    const startIndex = startRow * columns;
    const endIndex = Math.min(items.length, endRow * columns);

    return {
      visibleItems: items.slice(startIndex, endIndex).map((item, i) => ({
        item,
        index: startIndex + i,
        row: Math.floor((startIndex + i) / columns),
        col: (startIndex + i) % columns,
      })),
      totalHeight,
    };
  }, [items, itemWidth, itemHeight, gap, containerWidth, containerHeight, scrollTop]);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, row, col }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: row * (itemHeight + gap),
              left: col * (itemWidth + gap),
              width: itemWidth,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
