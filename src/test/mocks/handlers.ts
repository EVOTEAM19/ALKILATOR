import { http, HttpResponse } from 'msw';

const API_URL = 'https://*.supabase.co/rest/v1';

// Datos de prueba
export const mockCompany = {
  id: 'company-1',
  name: 'Test Rental Company',
  email: 'test@company.com',
  phone: '+34 900 000 000',
};

export const mockUser = {
  id: 'user-1',
  email: 'admin@test.com',
  first_name: 'Admin',
  last_name: 'Test',
  role: 'admin',
  company_id: 'company-1',
};

export const mockVehicleGroups = [
  {
    id: 'group-1',
    name: 'Económico',
    code: 'ECONO',
    vehicle_type: 'car',
    deposit_amount: 300,
    is_active: true,
  },
  {
    id: 'group-2',
    name: 'Compacto',
    code: 'COMPACT',
    vehicle_type: 'car',
    deposit_amount: 400,
    is_active: true,
  },
];

export const mockVehicles = [
  {
    id: 'vehicle-1',
    brand: 'Seat',
    model: 'Ibiza',
    year: 2023,
    plate: '1234ABC',
    status: 'available',
    vehicle_group_id: 'group-1',
    is_active: true,
  },
  {
    id: 'vehicle-2',
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2023,
    plate: '5678DEF',
    status: 'rented',
    vehicle_group_id: 'group-2',
    is_active: true,
  },
];

export const mockLocations = [
  {
    id: 'location-1',
    name: 'Oficina Central Madrid',
    city: 'Madrid',
    is_active: true,
    is_main: true,
  },
  {
    id: 'location-2',
    name: 'Aeropuerto Madrid-Barajas',
    city: 'Madrid',
    is_active: true,
  },
];

export const mockCustomers = [
  {
    id: 'customer-1',
    first_name: 'Juan',
    last_name: 'García',
    email: 'juan@test.com',
    phone: '+34 600 000 001',
    document_type: 'dni',
    document_number: '12345678A',
  },
];

export const mockBookings = [
  {
    id: 'booking-1',
    booking_number: 'ALK-2024-0001',
    status: 'confirmed',
    pickup_date: '2024-03-01',
    return_date: '2024-03-05',
    total_price: 200,
    customer_id: 'customer-1',
    vehicle_group_id: 'group-1',
    pickup_location_id: 'location-1',
    return_location_id: 'location-1',
    is_paid: false,
  },
];

export const handlers = [
  // Auth
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      user: { id: 'user-1', email: 'admin@test.com' },
    });
  }),

  // Companies
  http.get(`${API_URL}/companies`, () => {
    return HttpResponse.json([mockCompany]);
  }),

  // Users
  http.get(`${API_URL}/users`, ({ request }) => {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    if (email) {
      return HttpResponse.json([mockUser]);
    }
    return HttpResponse.json([mockUser]);
  }),

  // Vehicle Groups
  http.get(`${API_URL}/vehicle_groups`, () => {
    return HttpResponse.json(mockVehicleGroups);
  }),

  http.post(`${API_URL}/vehicle_groups`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 'new-group', ...body });
  }),

  // Vehicles
  http.get(`${API_URL}/vehicles`, () => {
    return HttpResponse.json(mockVehicles);
  }),

  // Locations
  http.get(`${API_URL}/locations`, () => {
    return HttpResponse.json(mockLocations);
  }),

  // Customers
  http.get(`${API_URL}/customers`, () => {
    return HttpResponse.json(mockCustomers);
  }),

  http.post(`${API_URL}/customers`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 'new-customer', ...body });
  }),

  // Bookings
  http.get(`${API_URL}/bookings`, () => {
    return HttpResponse.json(mockBookings);
  }),

  http.post(`${API_URL}/bookings`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ 
      id: 'new-booking', 
      booking_number: 'ALK-2024-0002',
      ...body 
    });
  }),

  http.patch(`${API_URL}/bookings/*`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...mockBookings[0], ...body });
  }),

  // Rates
  http.get(`${API_URL}/rates`, () => {
    return HttpResponse.json([
      {
        id: 'rate-1',
        vehicle_group_id: 'group-1',
        daily_price: 40,
        is_active: true,
      },
    ]);
  }),

  // Extras
  http.get(`${API_URL}/extras`, () => {
    return HttpResponse.json([
      {
        id: 'extra-1',
        name: 'GPS',
        code: 'gps',
        daily_price: 5,
        is_per_rental: false,
        is_active: true,
      },
    ]);
  }),
];
