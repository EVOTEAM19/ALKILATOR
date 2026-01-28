import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import type { UserRole, Company } from '@/types';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  companyId: string | null;
  company: Company | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setRole: (role: UserRole | null) => void;
  setCompanyId: (companyId: string | null) => void;
  setCompany: (company: Company | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  reset: () => void;
  
  // Computed
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isStaff: () => boolean;
  isCustomer: () => boolean;
}

const initialState = {
  user: null,
  session: null,
  role: null,
  companyId: null,
  company: null,
  isLoading: true,
  isInitialized: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setRole: (role) => set({ role }),
      setCompanyId: (companyId) => set({ companyId }),
      setCompany: (company) => set({ company }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setIsInitialized: (isInitialized) => set({ isInitialized }),
      
      reset: () => set(initialState),
      
      isAuthenticated: () => !!get().user && !!get().session,
      isAdmin: () => get().role === 'rent_admin' || get().role === 'super_admin',
      isStaff: () => get().role === 'rent_admin' || get().role === 'employee',
      isCustomer: () => get().role === 'customer',
    }),
    {
      name: 'alkilator-auth',
      partialize: (state) => ({
        // Solo persistir datos no sensibles
        companyId: state.companyId,
        role: state.role,
      }),
    }
  )
);
