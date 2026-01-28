import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBookings } from '../useBookings';
import { useAuthStore } from '@/stores/authStore';

// Mock auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    companyId: 'company-1',
  })),
}));

// Mock booking service
vi.mock('@/services/bookingService', () => ({
  bookingService: {
    getBookings: vi.fn(() => Promise.resolve({
      data: [
        { id: '1', booking_number: 'ALK-2024-0001', status: 'confirmed' },
        { id: '2', booking_number: 'ALK-2024-0002', status: 'pending' },
      ],
      count: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useBookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches bookings successfully', async () => {
    const { result } = renderHook(() => useBookings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.count).toBe(2);
  });

  it('returns loading state initially', () => {
    const { result } = renderHook(() => useBookings(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('does not fetch when companyId is missing', () => {
    vi.mocked(useAuthStore).mockReturnValue({ companyId: null } as any);

    const { result } = renderHook(() => useBookings(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });
});
