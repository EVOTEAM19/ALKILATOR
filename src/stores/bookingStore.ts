import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  VehicleGroup, 
  Vehicle, 
  Location, 
  BookingExtra,
  BookingPriceCalculation 
} from '@/types';

interface BookingSearchParams {
  vehicleType: 'car' | 'van';
  pickupLocationId: string;
  returnLocationId: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
}

interface SelectedVehicle {
  vehicleGroup: VehicleGroup;
  vehicle?: Vehicle; // Vehículo específico si está asignado
  dailyPrice: number;
  totalPrice: number;
  kmPerDay: number;
}

interface BookingState {
  // Parámetros de búsqueda
  searchParams: BookingSearchParams | null;
  
  // Ubicaciones seleccionadas (con datos completos)
  pickupLocation: Location | null;
  returnLocation: Location | null;
  
  // Vehículo seleccionado
  selectedVehicle: SelectedVehicle | null;
  
  // Extras seleccionados
  selectedExtras: BookingExtra[];
  
  // Cálculo de precios
  priceCalculation: BookingPriceCalculation | null;
  
  // Código de descuento
  discountCode: string | null;
  discountAmount: number;
  
  // Datos del cliente (para el formulario)
  customerData: Record<string, any> | null;
  
  // Conductor adicional
  additionalDriver: Record<string, any> | null;
  
  // Paso actual del wizard
  currentStep: number;
  
  // Actions
  setSearchParams: (params: BookingSearchParams) => void;
  setPickupLocation: (location: Location) => void;
  setReturnLocation: (location: Location) => void;
  setSelectedVehicle: (vehicle: SelectedVehicle) => void;
  addExtra: (extra: BookingExtra) => void;
  removeExtra: (extraId: string) => void;
  updateExtraQuantity: (extraId: string, quantity: number) => void;
  setPriceCalculation: (calculation: BookingPriceCalculation) => void;
  setDiscountCode: (code: string | null, amount: number) => void;
  setCustomerData: (data: Record<string, any>) => void;
  setAdditionalDriver: (data: Record<string, any> | null) => void;
  setCurrentStep: (step: number) => void;
  clearBooking: () => void;
  
  // Computed
  getTotalDays: () => number;
  getExtrasTotal: () => number;
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getTotal: () => number;
}

const initialState = {
  searchParams: null,
  pickupLocation: null,
  returnLocation: null,
  selectedVehicle: null,
  selectedExtras: [],
  priceCalculation: null,
  discountCode: null,
  discountAmount: 0,
  customerData: null,
  additionalDriver: null,
  currentStep: 1,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setSearchParams: (params) => set({ searchParams: params }),
      
      setPickupLocation: (location) => set({ pickupLocation: location }),
      
      setReturnLocation: (location) => set({ returnLocation: location }),
      
      setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
      
      addExtra: (extra) => set((state) => ({
        selectedExtras: [...state.selectedExtras, extra],
      })),
      
      removeExtra: (extraId) => set((state) => ({
        selectedExtras: state.selectedExtras.filter((e) => e.extra_id !== extraId),
      })),
      
      updateExtraQuantity: (extraId, quantity) => set((state) => ({
        selectedExtras: state.selectedExtras.map((e) =>
          e.extra_id === extraId
            ? { ...e, quantity, total_price: e.unit_price * quantity }
            : e
        ),
      })),
      
      setPriceCalculation: (calculation) => set({ priceCalculation: calculation }),
      
      setDiscountCode: (code, amount) => set({ 
        discountCode: code, 
        discountAmount: amount 
      }),
      
      setCustomerData: (data) => set({ customerData: data }),
      
      setAdditionalDriver: (data) => set({ additionalDriver: data }),
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      clearBooking: () => set(initialState),
      
      getTotalDays: () => {
        const { searchParams } = get();
        if (!searchParams) return 0;
        
        const pickup = new Date(searchParams.pickupDate);
        const returnDate = new Date(searchParams.returnDate);
        const days = Math.ceil((returnDate.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(days, 1);
      },
      
      getExtrasTotal: () => {
        const { selectedExtras, getTotalDays } = get();
        const days = getTotalDays();
        
        return selectedExtras.reduce((total, extra) => {
          if (extra.is_per_rental) {
            return total + extra.unit_price * extra.quantity;
          } else {
            return total + extra.unit_price * extra.quantity * days;
          }
        }, 0);
      },
      
      getSubtotal: () => {
        const { selectedVehicle, getExtrasTotal, discountAmount, pickupLocation, returnLocation } = get();
        if (!selectedVehicle) return 0;
        
        let subtotal = selectedVehicle.totalPrice + getExtrasTotal();
        
        // Añadir recargo por ubicación diferente
        if (pickupLocation && returnLocation && pickupLocation.id !== returnLocation.id) {
          subtotal += returnLocation.different_return_fee || 0;
        }
        
        // Restar descuento
        subtotal -= discountAmount;
        
        return Math.max(subtotal, 0);
      },
      
      getTaxAmount: () => {
        const { getSubtotal } = get();
        return getSubtotal() * 0.21; // 21% IVA
      },
      
      getTotal: () => {
        const { getSubtotal, getTaxAmount } = get();
        return getSubtotal() + getTaxAmount();
      },
    }),
    {
      name: 'alkilator-booking',
      partialize: (state) => ({
        searchParams: state.searchParams,
        selectedVehicle: state.selectedVehicle,
        selectedExtras: state.selectedExtras,
        discountCode: state.discountCode,
        discountAmount: state.discountAmount,
        customerData: state.customerData,
        additionalDriver: state.additionalDriver,
        currentStep: state.currentStep,
      }),
    }
  )
);
