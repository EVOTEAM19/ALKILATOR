// Estados de reserva
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  in_progress: "En curso",
  completed: "Completada",
  cancelled: "Cancelada",
}

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_progress: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
}

// Estados de vehículo
export const VEHICLE_STATUS = {
  AVAILABLE: "available",
  RENTED: "rented",
  MAINTENANCE: "maintenance",
  INACTIVE: "inactive",
} as const

export const VEHICLE_STATUS_LABELS: Record<string, string> = {
  available: "Disponible",
  rented: "Alquilado",
  maintenance: "En mantenimiento",
  reserved: "Reservado",
  unavailable: "No disponible",
  inactive: "Inactivo",
}

export const VEHICLE_STATUS_COLORS: Record<string, string> = {
  available: "bg-secondary text-white",
  rented: "bg-orange-500 text-white",
  maintenance: "bg-yellow-500 text-white",
  reserved: "bg-blue-500 text-white",
  unavailable: "bg-muted-foreground text-white",
  inactive: "bg-gray-500 text-white",
}

// Tipos de combustible
export const FUEL_TYPES = {
  GASOLINE: "gasoline",
  DIESEL: "diesel",
  ELECTRIC: "electric",
  HYBRID: "hybrid",
} as const

export const FUEL_TYPE_LABELS: Record<string, string> = {
  gasoline: "Gasolina",
  diesel: "Diésel",
  electric: "Eléctrico",
  hybrid: "Híbrido",
  lpg: "GLP",
}

// Tipos de transmisión
export const TRANSMISSION_TYPES = {
  MANUAL: "manual",
  AUTOMATIC: "automatic",
} as const

export const TRANSMISSION_LABELS: Record<string, string> = {
  manual: "Manual",
  automatic: "Automático",
}

// Tipos de propiedad
export const OWNERSHIP_TYPE_LABELS: Record<string, string> = {
  owned: "Propio",
  renting: "Renting",
  leasing: "Leasing",
}

// Tipos de vehículo
export const VEHICLE_TYPES = {
  CAR: "car",
  VAN: "van",
  MOTORCYCLE: "motorcycle",
} as const

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  car: "Coche",
  van: "Furgoneta",
  motorcycle: "Moto",
}

// Roles de usuario
export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  RENT_ADMIN: "rent_admin",
  EMPLOYEE: "employee",
  CUSTOMER: "customer",
} as const

// Tipos de documento
export const DOCUMENT_TYPES = {
  DNI: "dni",
  PASSPORT: "passport",
  NIE: "nie",
} as const

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  dni: "DNI",
  passport: "Pasaporte",
  nie: "NIE",
}

export const COUNTRIES = [
  'España',
  'Portugal',
  'Francia',
  'Alemania',
  'Italia',
  'Reino Unido',
  'Países Bajos',
  'Bélgica',
  'Suiza',
  'Austria',
  'Polonia',
  'Suecia',
  'Noruega',
  'Dinamarca',
  'Finlandia',
  'Irlanda',
  'Estados Unidos',
  'Canadá',
  'México',
  'Argentina',
  'Brasil',
  'Chile',
  'Colombia',
  'Otro',
];

export const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  individual: 'Particular',
  business: 'Empresa',
};

// Niveles de combustible
export const FUEL_LEVELS = ["empty", "1/4", "1/2", "3/4", "full"] as const

export const FUEL_LEVEL_LABELS: Record<string, string> = {
  empty: "Vacío",
  "1/4": "1/4",
  "1/2": "1/2",
  "3/4": "3/4",
  full: "Lleno",
}

// Métodos de pago
export const PAYMENT_METHODS = ["card", "cash", "transfer", "bizum"] as const

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: "Tarjeta",
  cash: "Efectivo",
  transfer: "Transferencia",
  bizum: "Bizum",
}

// Tipos de mantenimiento
export const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  oil_change: 'Cambio de aceite',
  tires: 'Neumáticos',
  brakes: 'Frenos',
  filters: 'Filtros',
  battery: 'Batería',
  timing_belt: 'Correa de distribución',
  air_conditioning: 'Aire acondicionado',
  revision: 'Revisión general',
  repair: 'Reparación',
  other: 'Otro',
};

// Horas disponibles para recogida/devolución
export const AVAILABLE_HOURS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
]
