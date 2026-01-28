// Re-export de enums como objetos para usar en selects, etc.
export const BookingStatusEnum = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const VehicleStatusEnum = {
  AVAILABLE: 'available',
  RENTED: 'rented',
  MAINTENANCE: 'maintenance',
  INACTIVE: 'inactive',
} as const;

export const FuelTypeEnum = {
  GASOLINE: 'gasoline',
  DIESEL: 'diesel',
  ELECTRIC: 'electric',
  HYBRID: 'hybrid',
} as const;

export const TransmissionEnum = {
  MANUAL: 'manual',
  AUTOMATIC: 'automatic',
} as const;

export const VehicleTypeEnum = {
  CAR: 'car',
  VAN: 'van',
  MOTORCYCLE: 'motorcycle',
} as const;

export const DocumentTypeEnum = {
  DNI: 'dni',
  PASSPORT: 'passport',
  NIE: 'nie',
} as const;

export const UserRoleEnum = {
  SUPER_ADMIN: 'super_admin',
  RENT_ADMIN: 'rent_admin',
  EMPLOYEE: 'employee',
  CUSTOMER: 'customer',
} as const;

export const ExtraTypeEnum = {
  ACCESSORY: 'accessory',
  INSURANCE: 'insurance',
  SERVICE: 'service',
  KM_PACKAGE: 'km_package',
  DRIVER: 'driver',
} as const;

export const MaintenanceTypeEnum = {
  OIL_CHANGE: 'oil_change',
  TIRES: 'tires',
  BRAKES: 'brakes',
  FILTERS: 'filters',
  BATTERY: 'battery',
  TIMING_BELT: 'timing_belt',
  AIR_CONDITIONING: 'air_conditioning',
  REVISION: 'revision',
  REPAIR: 'repair',
  OTHER: 'other',
} as const;
