import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bookingService } from '../bookingService';
import { supabase } from '@/lib/supabase';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({ data: [], count: 0, error: null })),
          })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'new-id', booking_number: 'ALK-2024-0001' }, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: 'updated' }, error: null })),
          })),
        })),
      })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: 'ALK-2024-0001', error: null })),
  },
}));

describe('bookingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createBooking', () => {
    it('creates a booking successfully', async () => {
      const bookingData = {
        companyId: 'company-1',
        customerId: 'customer-1',
        vehicleGroupId: 'group-1',
        pickupLocationId: 'location-1',
        returnLocationId: 'location-1',
        pickupDate: '2024-06-01',
        pickupTime: '10:00',
        returnDate: '2024-06-05',
        returnTime: '10:00',
        basePrice: 200,
        extrasTotal: 0,
        locationSurcharge: 0,
        discountAmount: 0,
        subtotal: 200,
        taxAmount: 42,
        totalPrice: 242,
        depositAmount: 300,
        extras: [],
      };

      const result = await bookingService.createBooking(bookingData);

      expect(result).toBeDefined();
      expect(result.id).toBe('new-id');
      expect(supabase.rpc).toHaveBeenCalledWith('generate_booking_number', expect.any(Object));
    });

    it('handles errors when creating booking', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Error generating number' } as any 
      });

      const bookingData = {
        companyId: 'company-1',
        customerId: 'customer-1',
        vehicleGroupId: 'group-1',
        pickupLocationId: 'location-1',
        returnLocationId: 'location-1',
        pickupDate: '2024-06-01',
        pickupTime: '10:00',
        returnDate: '2024-06-05',
        returnTime: '10:00',
        basePrice: 200,
        extrasTotal: 0,
        locationSurcharge: 0,
        discountAmount: 0,
        subtotal: 200,
        taxAmount: 42,
        totalPrice: 242,
        depositAmount: 300,
        extras: [],
      };

      await expect(bookingService.createBooking(bookingData)).rejects.toThrow();
    });
  });

  describe('getBookings', () => {
    it('fetches bookings with pagination', async () => {
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() => Promise.resolve({ 
                data: [{ id: '1', booking_number: 'ALK-2024-0001' }], 
                count: 1, 
                error: null 
              })),
            })),
          })),
        })),
      } as any);

      const result = await bookingService.getBookings('company-1', {}, 1, 20);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
    });
  });
});
