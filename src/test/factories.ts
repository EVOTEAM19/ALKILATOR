// Factorías para generar datos de prueba

export const createCustomer = (overrides = {}) => ({
  id: `customer-${Math.random().toString(36).slice(2)}`,
  first_name: 'Juan',
  last_name: 'García',
  email: `test-${Math.random().toString(36).slice(2)}@example.com`,
  phone: '+34 600 000 000',
  document_type: 'dni',
  document_number: '12345678A',
  company_id: 'company-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createVehicle = (overrides = {}) => ({
  id: `vehicle-${Math.random().toString(36).slice(2)}`,
  brand: 'Seat',
  model: 'Ibiza',
  year: 2023,
  plate: `${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
  vin: `VIN${Math.random().toString(36).slice(2, 12).toUpperCase()}`,
  status: 'available',
  fuel_type: 'gasoline',
  transmission: 'manual',
  seats: 5,
  doors: 5,
  current_mileage: 15000,
  vehicle_group_id: 'group-1',
  company_id: 'company-1',
  is_active: true,
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createBooking = (overrides = {}) => {
  const pickupDate = new Date();
  const returnDate = new Date(pickupDate);
  returnDate.setDate(returnDate.getDate() + 3);

  return {
    id: `booking-${Math.random().toString(36).slice(2)}`,
    booking_number: `ALK-${new Date().getFullYear()}-${Math.random().toString().slice(2, 6)}`,
    status: 'pending',
    pickup_date: pickupDate.toISOString().split('T')[0],
    return_date: returnDate.toISOString().split('T')[0],
    pickup_time: '10:00',
    return_time: '10:00',
    base_price: 120,
    extras_total: 15,
    total_price: 135,
    customer_id: 'customer-1',
    vehicle_group_id: 'group-1',
    pickup_location_id: 'location-1',
    return_location_id: 'location-1',
    company_id: 'company-1',
    is_paid: false,
    created_at: new Date().toISOString(),
    ...overrides,
  };
};

export const createVehicleGroup = (overrides = {}) => ({
  id: `group-${Math.random().toString(36).slice(2)}`,
  name: 'Económico',
  code: `GRP-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
  vehicle_type: 'car',
  deposit_amount: 300,
  km_per_day: 150,
  is_active: true,
  show_on_web: true,
  company_id: 'company-1',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createLocation = (overrides = {}) => ({
  id: `location-${Math.random().toString(36).slice(2)}`,
  name: 'Oficina Test',
  address: 'Calle Test 123',
  city: 'Madrid',
  postal_code: '28001',
  country: 'España',
  is_active: true,
  is_main: false,
  company_id: 'company-1',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createRate = (overrides = {}) => ({
  id: `rate-${Math.random().toString(36).slice(2)}`,
  name: 'Tarifa Standard',
  vehicle_group_id: 'group-1',
  valid_from: new Date().toISOString().split('T')[0],
  valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  is_active: true,
  company_id: 'company-1',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMaintenance = (overrides = {}) => ({
  id: `maintenance-${Math.random().toString(36).slice(2)}`,
  vehicle_id: 'vehicle-1',
  maintenance_type: 'revision',
  title: 'Revisión general',
  description: 'Revisión general',
  scheduled_date: new Date().toISOString().split('T')[0],
  estimated_cost: 150,
  status: 'scheduled',
  company_id: 'company-1',
  created_at: new Date().toISOString(),
  ...overrides,
});
