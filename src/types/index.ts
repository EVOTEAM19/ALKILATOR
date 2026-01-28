// =====================================================
// TIPOS BASE
// =====================================================

export type UUID = string;

// Estados
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'inactive';
export type MaintenanceStatus = 'scheduled' | 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type ContractStatus = 'draft' | 'pending_signature' | 'signed' | 'cancelled';
export type UserRole = 'super_admin' | 'rent_admin' | 'employee' | 'customer';
export type BookingSource = 'web' | 'manual' | 'phone';
export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid';
export type TransmissionType = 'manual' | 'automatic';
export type VehicleType = 'car' | 'van' | 'motorcycle';
export type DocumentType = 'dni' | 'passport' | 'nie';
export type DiscountType = 'percentage' | 'fixed';
export type ExtraType = 'accessory' | 'insurance' | 'service' | 'km_package' | 'driver';
export type MaintenanceType = 'oil_change' | 'tires' | 'brakes' | 'filters' | 'battery' | 'timing_belt' | 'air_conditioning' | 'revision' | 'repair' | 'other';
export type ITVResult = 'favorable' | 'unfavorable' | 'negative';
export type TransactionType = 'income' | 'expense';
export type FuelLevel = 'empty' | '1/4' | '1/2' | '3/4' | 'full';
export type PaymentMethod = 'card' | 'cash' | 'transfer' | 'bizum';

// =====================================================
// ENTIDADES PRINCIPALES
// =====================================================

export interface Company {
  id: UUID;
  name: string;
  slug: string;
  logo_url?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country: string;
  tax_id?: string;
  tax_rate: number;
  currency: string;
  timezone: string;
  contract_terms?: string;
  contract_header?: string;
  contract_footer?: string;
  invoice_prefix: string;
  invoice_next_number: number;
  primary_color: string;
  secondary_color: string;
  web_global_discount_enabled: boolean;
  web_global_discount_percent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: UUID;
  company_id: UUID;
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  opening_hours: Record<string, { open: string; close: string } | null>;
  closed_dates: string[];
  is_active: boolean;
  is_main: boolean;
  allows_different_return: boolean;
  different_return_fee: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleGroup {
  id: UUID;
  company_id: UUID;
  name: string;
  code: string;
  description?: string;
  image_url?: string;
  vehicle_type: VehicleType;
  km_per_day: number;
  extra_km_price: number;
  deposit_amount: number;
  display_order: number;
  is_active: boolean;
  show_on_web?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: UUID;
  company_id: UUID;
  vehicle_group_id?: UUID;
  brand: string;
  model: string;
  year: number;
  plate: string;
  vin?: string;
  color?: string;
  fuel_type: FuelType;
  transmission: TransmissionType;
  seats: number;
  doors: number;
  engine_cc?: number;
  horsepower?: number;
  current_mileage: number;
  current_location_id?: UUID;
  status: VehicleStatus;
  ownership_type: 'purchase' | 'renting';
  purchase_price?: number;
  monthly_cost?: number;
  image_url?: string;
  gallery_images: string[];
  features: string[];
  documentation_url?: string;
  insurance_url?: string;
  contract_url?: string;
  damages: VehicleDamage[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relaciones (opcionales, para joins)
  vehicle_group?: VehicleGroup;
  current_location?: Location;
}

export interface VehicleDamage {
  date: string;
  description: string;
  cost?: number;
  repaired: boolean;
  photos?: string[];
}

export interface Customer {
  id: UUID;
  company_id: UUID;
  user_id?: UUID;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  document_type: DocumentType;
  document_number?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country: string;
  license_number?: string;
  license_issue_date?: string;
  license_expiry_date?: string;
  license_country: string;
  notes?: string;
  is_blocked: boolean;
  block_reason?: string;
  total_bookings: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Rate {
  id: UUID;
  company_id: UUID;
  name: string;
  description?: string;
  valid_from?: string;
  valid_until?: string;
  online_payment_discount: number;
  is_active: boolean;
  show_on_web: boolean;
  created_at: string;
  updated_at: string;
  // Relación
  prices?: RateGroupPrice[];
}

export interface RateGroupPrice {
  id: UUID;
  rate_id: UUID;
  vehicle_group_id: UUID;
  min_days: number;
  max_days?: number;
  daily_price: number;
  km_per_day: number;
  unlimited_km: boolean;
  created_at: string;
  updated_at: string;
  // Relación
  vehicle_group?: VehicleGroup;
}

export interface Extra {
  id: UUID;
  company_id: UUID;
  name: string;
  description?: string;
  icon?: string;
  extra_type: ExtraType;
  daily_price: number;
  is_per_rental: boolean;
  max_quantity: number;
  is_active: boolean;
  show_on_web: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DiscountCode {
  id: UUID;
  company_id: UUID;
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  valid_from?: string;
  valid_until?: string;
  max_uses: number;
  current_uses: number;
  single_use_per_customer: boolean;
  min_days?: number;
  min_amount?: number;
  vehicle_groups: UUID[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: UUID;
  company_id: UUID;
  booking_number: string;
  customer_id?: UUID;
  vehicle_group_id?: UUID;
  vehicle_id?: UUID;
  rate_id?: UUID;
  pickup_location_id?: UUID;
  return_location_id?: UUID;
  pickup_date: string;
  pickup_time: string;
  return_date: string;
  return_time: string;
  status: BookingStatus;
  source: BookingSource;
  base_price: number;
  extras_total: number;
  location_surcharge: number;
  discount_code?: string;
  discount_amount: number;
  subtotal: number;
  tax_amount: number;
  total_price: number;
  deposit_amount: number;
  deposit_paid: boolean;
  deposit_method?: string;
  deposit_returned: boolean;
  deposit_returned_amount?: number;
  is_paid: boolean;
  payment_method?: PaymentMethod;
  paid_at?: string;
  pickup_mileage?: number;
  pickup_fuel_level?: FuelLevel;
  pickup_photos: string[];
  pickup_notes?: string;
  pickup_completed_at?: string;
  return_mileage?: number;
  return_fuel_level?: FuelLevel;
  return_photos: string[];
  return_notes?: string;
  return_completed_at?: string;
  has_damages: boolean;
  damage_description?: string;
  damage_charges: number;
  fuel_charges: number;
  cleaning_charges: number;
  extra_km_charges: number;
  late_return_charges: number;
  additional_charges: number;
  additional_charges_description?: string;
  total_additional_charges: number;
  notes?: string;
  internal_notes?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  // Relaciones
  customer?: Customer;
  vehicle?: Vehicle;
  vehicle_group?: VehicleGroup;
  pickup_location?: Location;
  return_location?: Location;
  rate?: Rate;
  extras?: BookingExtra[];
  contract?: Contract;
}

export interface BookingExtra {
  id: UUID;
  booking_id: UUID;
  extra_id?: UUID;
  extra_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_per_rental: boolean;
  created_at: string;
  // Relación
  extra?: Extra;
}

export interface Contract {
  id: UUID;
  company_id: UUID;
  booking_id: UUID;
  contract_number: string;
  signature_data?: string;
  signed_at?: string;
  signed_by_name?: string;
  signed_by_document?: string;
  signed_from_ip?: string;
  signed_from_device?: string;
  pdf_url?: string;
  status: ContractStatus;
  contract_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface VehicleMaintenance {
  id: UUID;
  company_id: UUID;
  vehicle_id: UUID;
  maintenance_type: MaintenanceType;
  title: string;
  description?: string;
  scheduled_date?: string;
  scheduled_km?: number;
  status: MaintenanceStatus;
  completed_date?: string;
  completed_mileage?: number;
  workshop_name?: string;
  workshop_phone?: string;
  workshop_address?: string;
  estimated_cost?: number;
  actual_cost?: number;
  document_url?: string;
  photos: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relación
  vehicle?: Vehicle;
}

export interface VehicleITV {
  id: UUID;
  company_id: UUID;
  vehicle_id: UUID;
  scheduled_date: string;
  status: MaintenanceStatus;
  completed_date?: string;
  result?: ITVResult;
  station_name?: string;
  station_address?: string;
  cost?: number;
  document_url?: string;
  next_itv_date?: string;
  notes?: string;
  defects_description?: string;
  created_at: string;
  updated_at: string;
  // Relación
  vehicle?: Vehicle;
}

export interface AccountingTransaction {
  id: UUID;
  company_id: UUID;
  type: TransactionType;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  net_amount?: number;
  vat_rate?: number;
  vat_amount?: number;
  transaction_date: string;
  booking_id?: UUID;
  customer_id?: UUID;
  vehicle_id?: UUID;
  maintenance_id?: UUID;
  external_entity_name?: string;
  external_entity_tax_id?: string;
  is_paid: boolean;
  payment_date?: string;
  payment_method?: PaymentMethod;
  payment_reference?: string;
  due_date?: string;
  is_invoiced: boolean;
  invoice_number?: string;
  invoice_date?: string;
  invoice_url?: string;
  document_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: UUID;
  user_id: UUID;
  company_id?: UUID;
  role: UserRole;
  permissions: Record<string, boolean>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================
// TIPOS DE FORMULARIOS Y REQUESTS
// =====================================================

export interface CreateBookingRequest {
  company_id: UUID;
  customer: CreateCustomerRequest;
  vehicle_group_id: UUID;
  pickup_location_id: UUID;
  return_location_id: UUID;
  pickup_date: string;
  pickup_time: string;
  return_date: string;
  return_time: string;
  extras: { extra_id: UUID; quantity: number }[];
  discount_code?: string;
  notes?: string;
  source?: BookingSource;
}

export interface CreateCustomerRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  document_type: DocumentType;
  document_number?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  license_number?: string;
  license_issue_date?: string;
  license_country?: string;
}

export interface BookingPriceCalculation {
  total_days: number;
  daily_price: number;
  base_price: number;
  km_per_day: number;
  rate_id: UUID;
  rate_name: string;
  extras_total: number;
  location_surcharge: number;
  discount_amount: number;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_price: number;
  deposit_amount: number;
}

export interface AvailableVehicle {
  id: UUID;
  vehicle_group_id: UUID;
  brand: string;
  model: string;
  year: number;
  plate: string;
  fuel_type: FuelType;
  transmission: TransmissionType;
  seats: number;
  image_url?: string;
  features: string[];
  group_name: string;
  group_code: string;
  deposit_amount: number;
  daily_price: number;
  total_price: number;
  km_per_day: number;
}

// =====================================================
// TIPOS DE RESPUESTAS Y PAGINACIÓN
// =====================================================

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// =====================================================
// TIPOS DE FILTROS
// =====================================================

export interface BookingFilters {
  status?: BookingStatus;
  search?: string;
  pickup_date_from?: string;
  pickup_date_to?: string;
  location_id?: UUID;
  source?: BookingSource;
}

export interface VehicleFilters {
  status?: VehicleStatus;
  search?: string;
  vehicle_group_id?: UUID;
  location_id?: UUID;
  fuel_type?: FuelType;
  transmission?: TransmissionType;
}

export interface CustomerFilters {
  search?: string;
  is_blocked?: boolean;
  customerType?: string;
  isBlacklisted?: boolean;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

export interface RateFilters {
  vehicleGroupId?: string;
  isActive?: boolean;
  seasonType?: string;
}

export interface MaintenanceFilters {
  status?: MaintenanceStatus;
  vehicleId?: UUID;
  vehicle_id?: UUID;
  maintenanceType?: MaintenanceType;
  maintenance_type?: MaintenanceType;
  dateFrom?: string;
  date_from?: string;
  dateTo?: string;
  date_to?: string;
  search?: string;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  date_from?: string;
  date_to?: string;
  is_paid?: boolean;
  is_invoiced?: boolean;
}

export interface DiscountFilters {
  isActive?: boolean;
  discountType?: string;
  search?: string;
}

export interface LocationFilters {
  isActive?: boolean;
  isMainOffice?: boolean;
  locationType?: string;
  search?: string;
}
