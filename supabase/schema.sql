-- =====================================================
-- ALKILATOR - SCHEMA DE BASE DE DATOS
-- Sistema de alquiler de coches y furgonetas
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TABLA: COMPANIES (Empresas de alquiler)
-- =====================================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    
    -- Datos de contacto
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'España',
    
    -- Datos fiscales
    tax_id TEXT, -- CIF/NIF
    tax_rate DECIMAL(5,2) DEFAULT 21.00, -- IVA por defecto
    currency TEXT DEFAULT 'EUR',
    timezone TEXT DEFAULT 'Europe/Madrid',
    
    -- Configuración de contratos
    contract_terms TEXT, -- Términos y condiciones
    contract_header TEXT, -- Cabecera del contrato
    contract_footer TEXT, -- Pie del contrato
    
    -- Facturación
    invoice_prefix TEXT DEFAULT 'ALK',
    invoice_next_number INTEGER DEFAULT 1,
    
    -- Personalización
    primary_color TEXT DEFAULT '#0066CC',
    secondary_color TEXT DEFAULT '#00CC66',
    
    -- Descuentos web
    web_global_discount_enabled BOOLEAN DEFAULT false,
    web_global_discount_percent DECIMAL(5,2) DEFAULT 0,
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para companies
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentario de tabla
COMMENT ON TABLE companies IS 'Empresas de alquiler de vehículos registradas en la plataforma';

-- =====================================================
-- TABLA: LOCATIONS (Ubicaciones/Sucursales)
-- =====================================================
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Datos básicos
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'España',
    
    -- Contacto
    phone TEXT,
    email TEXT,
    
    -- Geolocalización
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Horarios (JSON: {"monday": {"open": "09:00", "close": "20:00"}, ...})
    opening_hours JSONB DEFAULT '{
        "monday": {"open": "09:00", "close": "20:00"},
        "tuesday": {"open": "09:00", "close": "20:00"},
        "wednesday": {"open": "09:00", "close": "20:00"},
        "thursday": {"open": "09:00", "close": "20:00"},
        "friday": {"open": "09:00", "close": "20:00"},
        "saturday": {"open": "09:00", "close": "14:00"},
        "sunday": null
    }'::jsonb,
    
    -- Fechas cerrado (array de strings "YYYY-MM-DD")
    closed_dates TEXT[] DEFAULT '{}',
    
    -- Configuración
    is_active BOOLEAN DEFAULT true,
    is_main BOOLEAN DEFAULT false, -- Ubicación principal
    allows_different_return BOOLEAN DEFAULT true, -- Permite devolver en otra ubicación
    different_return_fee DECIMAL(10,2) DEFAULT 0, -- Cargo por devolución diferente
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para locations
CREATE INDEX IF NOT EXISTS idx_locations_company_id ON locations(company_id);
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON locations(is_active);
CREATE INDEX IF NOT EXISTS idx_locations_city ON locations(city);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE locations IS 'Ubicaciones o sucursales donde se pueden recoger/devolver vehículos';

-- =====================================================
-- TABLA: VEHICLE_GROUPS (Grupos/Categorías de vehículos)
-- =====================================================
CREATE TABLE IF NOT EXISTS vehicle_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Identificación
    name TEXT NOT NULL, -- Ej: "Económico", "Compacto", "SUV"
    code TEXT NOT NULL, -- Ej: "ECO", "COM", "SUV"
    description TEXT,
    image_url TEXT,
    
    -- Tipo de vehículo
    vehicle_type TEXT DEFAULT 'car' CHECK (vehicle_type IN ('car', 'van', 'motorcycle')),
    
    -- Configuración de km
    km_per_day INTEGER DEFAULT 150, -- Km incluidos por día por defecto
    extra_km_price DECIMAL(10,2) DEFAULT 0.15, -- Precio por km extra
    
    -- Fianza
    deposit_amount DECIMAL(10,2) DEFAULT 500, -- Fianza por defecto
    
    -- Visualización
    display_order INTEGER DEFAULT 0, -- Orden en la web
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- El código debe ser único por empresa
    UNIQUE(company_id, code)
);

-- Índices para vehicle_groups
CREATE INDEX IF NOT EXISTS idx_vehicle_groups_company_id ON vehicle_groups(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_groups_is_active ON vehicle_groups(is_active);
CREATE INDEX IF NOT EXISTS idx_vehicle_groups_vehicle_type ON vehicle_groups(vehicle_type);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_vehicle_groups_updated_at ON vehicle_groups;
CREATE TRIGGER update_vehicle_groups_updated_at
    BEFORE UPDATE ON vehicle_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE vehicle_groups IS 'Grupos o categorías de vehículos (Económico, Compacto, SUV, etc.)';

-- =====================================================
-- INSERTAR DATOS DE EJEMPLO (EMPRESA DEMO)
-- =====================================================
INSERT INTO companies (name, slug, email, phone, address, city, postal_code, tax_id)
VALUES (
    'Alkilator Demo',
    'alkilator-demo',
    'demo@alkilator.com',
    '+34 900 123 456',
    'Calle Principal 123',
    'Madrid',
    '28001',
    'B12345678'
)
ON CONFLICT (slug) DO NOTHING;

-- Obtener el ID de la empresa demo para insertar ubicaciones y grupos
DO $$
DECLARE
    demo_company_id UUID;
BEGIN
    SELECT id INTO demo_company_id FROM companies WHERE slug = 'alkilator-demo';
    
    IF demo_company_id IS NOT NULL THEN
        -- Insertar ubicaciones de ejemplo (solo si no existen)
        INSERT INTO locations (company_id, name, address, city, postal_code, is_main) VALUES
        (demo_company_id, 'Madrid Aeropuerto T4', 'Terminal 4, Aeropuerto Adolfo Suárez', 'Madrid', '28042', true),
        (demo_company_id, 'Madrid Centro', 'Calle Gran Vía 50', 'Madrid', '28013', false),
        (demo_company_id, 'Barcelona Aeropuerto', 'Terminal 1, Aeropuerto El Prat', 'Barcelona', '08820', false)
        ON CONFLICT DO NOTHING;
        
        -- Insertar grupos de vehículos de ejemplo (solo si no existen)
        INSERT INTO vehicle_groups (company_id, name, code, description, vehicle_type, km_per_day, deposit_amount, display_order) VALUES
        (demo_company_id, 'Económico', 'ECO', 'Vehículos pequeños y eficientes en consumo', 'car', 150, 500, 1),
        (demo_company_id, 'Compacto', 'COM', 'Vehículos compactos versátiles', 'car', 150, 600, 2),
        (demo_company_id, 'SUV', 'SUV', 'Vehículos todoterreno y SUV', 'car', 200, 800, 3),
        (demo_company_id, 'Premium', 'PRE', 'Vehículos de alta gama', 'car', 200, 1500, 4),
        (demo_company_id, 'Furgoneta Pequeña', 'VAN-S', 'Furgonetas para mudanzas pequeñas', 'van', 100, 600, 5),
        (demo_company_id, 'Furgoneta Grande', 'VAN-L', 'Furgonetas de gran capacidad', 'van', 100, 800, 6)
        ON CONFLICT (company_id, code) DO NOTHING;
    END IF;
END $$;

-- =====================================================
-- TABLA: VEHICLES (Vehículos individuales)
-- =====================================================
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_group_id UUID REFERENCES vehicle_groups(id) ON DELETE SET NULL,
    
    -- Identificación del vehículo
    brand TEXT NOT NULL, -- Marca (SEAT, Renault, etc.)
    model TEXT NOT NULL, -- Modelo (Ibiza, Clio, etc.)
    year INTEGER NOT NULL, -- Año
    plate TEXT NOT NULL, -- Matrícula
    vin TEXT, -- Número de bastidor (17 caracteres)
    color TEXT,
    
    -- Especificaciones técnicas
    fuel_type TEXT DEFAULT 'gasoline' CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid')),
    transmission TEXT DEFAULT 'manual' CHECK (transmission IN ('manual', 'automatic')),
    seats INTEGER DEFAULT 5 CHECK (seats > 0 AND seats <= 9),
    doors INTEGER DEFAULT 5 CHECK (doors > 0 AND doors <= 5),
    engine_cc INTEGER, -- Cilindrada en CC
    horsepower INTEGER, -- Potencia en CV
    
    -- Estado actual
    current_mileage INTEGER DEFAULT 0, -- Kilometraje actual
    current_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'inactive')),
    
    -- Propiedad
    ownership_type TEXT DEFAULT 'purchase' CHECK (ownership_type IN ('purchase', 'renting')),
    purchase_price DECIMAL(10,2), -- Precio de compra (si es propio)
    monthly_cost DECIMAL(10,2), -- Coste mensual (si es renting)
    
    -- Imágenes
    image_url TEXT, -- Imagen principal
    gallery_images TEXT[] DEFAULT '{}', -- Galería de imágenes
    
    -- Características (JSON array de strings)
    features JSONB DEFAULT '[]'::jsonb,
    -- Ejemplo: ["air_conditioning", "bluetooth", "gps", "usb", "cruise_control"]
    
    -- Documentación
    documentation_url TEXT,
    insurance_url TEXT,
    contract_url TEXT, -- Contrato de renting si aplica
    
    -- Historial de daños (JSON array)
    damages JSONB DEFAULT '[]'::jsonb,
    -- Ejemplo: [{"date": "2024-01-15", "description": "Rayón puerta", "cost": 150, "repaired": true}]
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Matrícula única por empresa
    UNIQUE(company_id, plate)
);

-- Índices para vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_company_id ON vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_group_id ON vehicles(vehicle_group_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_current_location_id ON vehicles(current_location_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_active ON vehicles(is_active);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand_model ON vehicles(brand, model);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE vehicles IS 'Vehículos individuales de la flota';

-- =====================================================
-- TABLA: VEHICLE_LOCATIONS (Ubicaciones disponibles por vehículo)
-- Relación muchos a muchos entre vehículos y ubicaciones
-- =====================================================
CREATE TABLE IF NOT EXISTS vehicle_locations (
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    
    PRIMARY KEY (vehicle_id, location_id)
);

-- Índices para vehicle_locations
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_vehicle_id ON vehicle_locations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_location_id ON vehicle_locations(location_id);

COMMENT ON TABLE vehicle_locations IS 'Relación de ubicaciones donde puede estar disponible cada vehículo';

-- =====================================================
-- TABLA: CUSTOMERS (Clientes)
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Si tiene cuenta
    
    -- Datos personales
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    
    -- Documentación
    document_type TEXT DEFAULT 'dni' CHECK (document_type IN ('dni', 'passport', 'nie')),
    document_number TEXT,
    birth_date DATE,
    
    -- Dirección
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'España',
    
    -- Carnet de conducir
    license_number TEXT,
    license_issue_date DATE,
    license_expiry_date DATE,
    license_country TEXT DEFAULT 'España',
    
    -- Notas y estado
    notes TEXT,
    is_blocked BOOLEAN DEFAULT false, -- Cliente bloqueado (problemas previos)
    block_reason TEXT,
    
    -- Estadísticas
    total_bookings INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Email único por empresa
    UNIQUE(company_id, email)
);

-- Índices para customers
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_document_number ON customers(document_number);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE customers IS 'Clientes que han realizado reservas';

-- =====================================================
-- INSERTAR VEHÍCULOS DE EJEMPLO
-- =====================================================
DO $$
DECLARE
    demo_company_id UUID;
    eco_group_id UUID;
    com_group_id UUID;
    suv_group_id UUID;
    madrid_airport_id UUID;
    madrid_centro_id UUID;
    v_id UUID;
BEGIN
    -- Obtener IDs
    SELECT id INTO demo_company_id FROM companies WHERE slug = 'alkilator-demo';
    SELECT id INTO eco_group_id FROM vehicle_groups WHERE company_id = demo_company_id AND code = 'ECO';
    SELECT id INTO com_group_id FROM vehicle_groups WHERE company_id = demo_company_id AND code = 'COM';
    SELECT id INTO suv_group_id FROM vehicle_groups WHERE company_id = demo_company_id AND code = 'SUV';
    SELECT id INTO madrid_airport_id FROM locations WHERE company_id = demo_company_id AND name LIKE '%Aeropuerto T4%';
    SELECT id INTO madrid_centro_id FROM locations WHERE company_id = demo_company_id AND name LIKE '%Centro%';
    
    IF demo_company_id IS NOT NULL AND eco_group_id IS NOT NULL AND madrid_airport_id IS NOT NULL THEN
        -- Vehículos económicos
        INSERT INTO vehicles (company_id, vehicle_group_id, brand, model, year, plate, color, fuel_type, transmission, seats, doors, current_mileage, current_location_id, features, is_active)
        VALUES 
        (demo_company_id, eco_group_id, 'SEAT', 'Ibiza', 2023, '1234ABC', 'Blanco', 'gasoline', 'manual', 5, 5, 15000, madrid_airport_id, '["air_conditioning", "bluetooth", "usb"]'::jsonb, true)
        ON CONFLICT (company_id, plate) DO NOTHING
        RETURNING id INTO v_id;
        
        IF v_id IS NOT NULL THEN
            INSERT INTO vehicle_locations (vehicle_id, location_id) 
            VALUES (v_id, madrid_airport_id), (v_id, madrid_centro_id)
            ON CONFLICT DO NOTHING;
        END IF;
        
        INSERT INTO vehicles (company_id, vehicle_group_id, brand, model, year, plate, color, fuel_type, transmission, seats, doors, current_mileage, current_location_id, features, is_active)
        VALUES 
        (demo_company_id, eco_group_id, 'Renault', 'Clio', 2023, '5678DEF', 'Rojo', 'gasoline', 'manual', 5, 5, 22000, madrid_airport_id, '["air_conditioning", "bluetooth", "cruise_control"]'::jsonb, true)
        ON CONFLICT (company_id, plate) DO NOTHING
        RETURNING id INTO v_id;
        
        IF v_id IS NOT NULL THEN
            INSERT INTO vehicle_locations (vehicle_id, location_id) 
            VALUES (v_id, madrid_airport_id), (v_id, madrid_centro_id)
            ON CONFLICT DO NOTHING;
        END IF;
        
        -- Vehículos compactos
        IF com_group_id IS NOT NULL THEN
            INSERT INTO vehicles (company_id, vehicle_group_id, brand, model, year, plate, color, fuel_type, transmission, seats, doors, current_mileage, current_location_id, features, is_active)
            VALUES 
            (demo_company_id, com_group_id, 'Volkswagen', 'Golf', 2023, '9012GHI', 'Gris', 'diesel', 'automatic', 5, 5, 18000, madrid_centro_id, '["air_conditioning", "bluetooth", "gps", "parking_sensors"]'::jsonb, true)
            ON CONFLICT (company_id, plate) DO NOTHING
            RETURNING id INTO v_id;
            
            IF v_id IS NOT NULL THEN
                INSERT INTO vehicle_locations (vehicle_id, location_id) 
                VALUES (v_id, madrid_airport_id), (v_id, madrid_centro_id)
                ON CONFLICT DO NOTHING;
            END IF;
        END IF;
        
        -- SUV
        IF suv_group_id IS NOT NULL THEN
            INSERT INTO vehicles (company_id, vehicle_group_id, brand, model, year, plate, color, fuel_type, transmission, seats, doors, current_mileage, current_location_id, features, is_active)
            VALUES 
            (demo_company_id, suv_group_id, 'Audi', 'Q3', 2024, '3456JKL', 'Negro', 'diesel', 'automatic', 5, 5, 8000, madrid_airport_id, '["air_conditioning", "bluetooth", "gps", "leather_seats", "panoramic_roof", "parking_sensors", "rear_camera"]'::jsonb, true)
            ON CONFLICT (company_id, plate) DO NOTHING
            RETURNING id INTO v_id;
            
            IF v_id IS NOT NULL THEN
                INSERT INTO vehicle_locations (vehicle_id, location_id) 
                VALUES (v_id, madrid_airport_id), (v_id, madrid_centro_id)
                ON CONFLICT DO NOTHING;
            END IF;
        END IF;
    END IF;
END $$;

-- =====================================================
-- TABLA: RATES (Tarifas)
-- =====================================================
CREATE TABLE IF NOT EXISTS rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Identificación
    name TEXT NOT NULL, -- Ej: "Tarifa General", "Temporada Alta Verano"
    description TEXT,
    
    -- Periodo de validez (NULL = tarifa general sin fechas)
    valid_from DATE, -- Fecha inicio
    valid_until DATE, -- Fecha fin
    
    -- Descuentos
    online_payment_discount DECIMAL(5,2) DEFAULT 0, -- % descuento por pago online
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    show_on_web BOOLEAN DEFAULT true, -- Visible en la web pública
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para rates
CREATE INDEX IF NOT EXISTS idx_rates_company_id ON rates(company_id);
CREATE INDEX IF NOT EXISTS idx_rates_is_active ON rates(is_active);
CREATE INDEX IF NOT EXISTS idx_rates_valid_dates ON rates(valid_from, valid_until);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_rates_updated_at ON rates;
CREATE TRIGGER update_rates_updated_at
    BEFORE UPDATE ON rates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE rates IS 'Tarifas de precios (general y por temporadas)';

-- =====================================================
-- TABLA: RATE_GROUP_PRICES (Precios por grupo y rango de días)
-- =====================================================
CREATE TABLE IF NOT EXISTS rate_group_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rate_id UUID NOT NULL REFERENCES rates(id) ON DELETE CASCADE,
    vehicle_group_id UUID NOT NULL REFERENCES vehicle_groups(id) ON DELETE CASCADE,
    
    -- Rango de días
    min_days INTEGER NOT NULL DEFAULT 1, -- Días mínimos
    max_days INTEGER, -- Días máximos (NULL = sin límite)
    
    -- Precio
    daily_price DECIMAL(10,2) NOT NULL, -- Precio por día (sin IVA)
    
    -- Kilómetros
    km_per_day INTEGER DEFAULT 150, -- Km incluidos por día
    unlimited_km BOOLEAN DEFAULT false, -- Km ilimitados
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para rate_group_prices
CREATE INDEX IF NOT EXISTS idx_rate_group_prices_rate_id ON rate_group_prices(rate_id);
CREATE INDEX IF NOT EXISTS idx_rate_group_prices_vehicle_group_id ON rate_group_prices(vehicle_group_id);
CREATE INDEX IF NOT EXISTS idx_rate_group_prices_days ON rate_group_prices(min_days, max_days);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_rate_group_prices_updated_at ON rate_group_prices;
CREATE TRIGGER update_rate_group_prices_updated_at
    BEFORE UPDATE ON rate_group_prices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE rate_group_prices IS 'Precios por grupo de vehículo y rango de días dentro de cada tarifa';

-- =====================================================
-- TABLA: EXTRAS (Complementos opcionales)
-- =====================================================
CREATE TABLE IF NOT EXISTS extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Identificación
    name TEXT NOT NULL, -- Ej: "GPS", "Silla bebé", "Conductor adicional"
    description TEXT,
    icon TEXT, -- Nombre del icono (de Lucide)
    
    -- Tipo de extra
    extra_type TEXT DEFAULT 'accessory' CHECK (extra_type IN ('accessory', 'insurance', 'service', 'km_package', 'driver')),
    -- accessory: GPS, silla bebé, cadenas
    -- insurance: Reducción de franquicia
    -- service: Limpieza, entrega fuera de horario
    -- km_package: Paquetes de km ilimitados
    -- driver: Conductor adicional
    
    -- Precio
    daily_price DECIMAL(10,2) NOT NULL, -- Precio por día o por alquiler
    is_per_rental BOOLEAN DEFAULT false, -- true = precio único por alquiler, false = por día
    
    -- Configuración
    max_quantity INTEGER DEFAULT 1, -- Cantidad máxima seleccionable
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    show_on_web BOOLEAN DEFAULT true,
    
    -- Orden de visualización
    display_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para extras
CREATE INDEX IF NOT EXISTS idx_extras_company_id ON extras(company_id);
CREATE INDEX IF NOT EXISTS idx_extras_is_active ON extras(is_active);
CREATE INDEX IF NOT EXISTS idx_extras_extra_type ON extras(extra_type);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_extras_updated_at ON extras;
CREATE TRIGGER update_extras_updated_at
    BEFORE UPDATE ON extras
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE extras IS 'Complementos opcionales que se pueden añadir a las reservas';

-- =====================================================
-- TABLA: DISCOUNT_CODES (Cupones de descuento)
-- =====================================================
CREATE TABLE IF NOT EXISTS discount_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Código
    code TEXT NOT NULL, -- Ej: "VERANO10", "WELCOME20"
    description TEXT,
    
    -- Tipo de descuento
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL, -- % o € según tipo
    
    -- Validez
    valid_from DATE,
    valid_until DATE,
    
    -- Límites de uso
    max_uses INTEGER DEFAULT 0, -- 0 = ilimitado
    current_uses INTEGER DEFAULT 0,
    single_use_per_customer BOOLEAN DEFAULT false,
    
    -- Requisitos mínimos
    min_days INTEGER, -- Mínimo de días de alquiler
    min_amount DECIMAL(10,2), -- Importe mínimo de reserva
    
    -- Restricciones por grupo de vehículo (array de UUIDs, vacío = todos)
    vehicle_groups UUID[] DEFAULT '{}',
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Código único por empresa
    UNIQUE(company_id, code)
);

-- Índices para discount_codes
CREATE INDEX IF NOT EXISTS idx_discount_codes_company_id ON discount_codes(company_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_is_active ON discount_codes(is_active);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_discount_codes_updated_at ON discount_codes;
CREATE TRIGGER update_discount_codes_updated_at
    BEFORE UPDATE ON discount_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE discount_codes IS 'Cupones y códigos de descuento';

-- =====================================================
-- TABLA: BOOKINGS (Reservas)
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Número de reserva único
    booking_number TEXT UNIQUE NOT NULL, -- Ej: "ALK-202501-0042"
    
    -- Referencias
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    vehicle_group_id UUID REFERENCES vehicle_groups(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL, -- Vehículo asignado
    rate_id UUID REFERENCES rates(id) ON DELETE SET NULL,
    
    -- Ubicaciones
    pickup_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    return_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    
    -- Fechas y horas
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL DEFAULT '10:00',
    return_date DATE NOT NULL,
    return_time TIME NOT NULL DEFAULT '10:00',
    
    -- Estado
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    -- pending: Nueva reserva, sin vehículo asignado
    -- confirmed: Vehículo asignado
    -- in_progress: Vehículo entregado al cliente
    -- completed: Vehículo devuelto y liquidado
    -- cancelled: Reserva cancelada
    
    -- Origen de la reserva
    source TEXT DEFAULT 'web' CHECK (source IN ('web', 'manual', 'phone')),
    
    -- =====================================================
    -- DATOS ECONÓMICOS
    -- =====================================================
    
    -- Precio base del alquiler
    base_price DECIMAL(10,2) DEFAULT 0,
    
    -- Extras
    extras_total DECIMAL(10,2) DEFAULT 0,
    
    -- Recargo ubicación diferente
    location_surcharge DECIMAL(10,2) DEFAULT 0,
    
    -- Descuento
    discount_code TEXT,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Totales
    subtotal DECIMAL(10,2) DEFAULT 0, -- Antes de IVA
    tax_amount DECIMAL(10,2) DEFAULT 0, -- IVA
    total_price DECIMAL(10,2) DEFAULT 0, -- Total con IVA
    
    -- Fianza
    deposit_amount DECIMAL(10,2) DEFAULT 0,
    deposit_paid BOOLEAN DEFAULT false,
    deposit_method TEXT, -- 'card', 'cash'
    deposit_returned BOOLEAN DEFAULT false,
    deposit_returned_amount DECIMAL(10,2),
    
    -- Pago
    is_paid BOOLEAN DEFAULT false,
    payment_method TEXT,
    paid_at TIMESTAMPTZ,
    
    -- =====================================================
    -- DATOS DE RECOGIDA (pickup)
    -- =====================================================
    pickup_mileage INTEGER, -- Km al recoger
    pickup_fuel_level TEXT, -- 'empty', '1/4', '1/2', '3/4', 'full'
    pickup_photos TEXT[] DEFAULT '{}', -- URLs de fotos
    pickup_notes TEXT,
    pickup_completed_at TIMESTAMPTZ,
    
    -- =====================================================
    -- DATOS DE DEVOLUCIÓN (return)
    -- =====================================================
    return_mileage INTEGER, -- Km al devolver
    return_fuel_level TEXT,
    return_photos TEXT[] DEFAULT '{}',
    return_notes TEXT,
    return_completed_at TIMESTAMPTZ,
    
    -- =====================================================
    -- CARGOS ADICIONALES (al devolver)
    -- =====================================================
    has_damages BOOLEAN DEFAULT false,
    damage_description TEXT,
    damage_charges DECIMAL(10,2) DEFAULT 0,
    
    fuel_charges DECIMAL(10,2) DEFAULT 0, -- Cargo por combustible
    cleaning_charges DECIMAL(10,2) DEFAULT 0, -- Cargo por limpieza
    extra_km_charges DECIMAL(10,2) DEFAULT 0, -- Cargo por km extras
    late_return_charges DECIMAL(10,2) DEFAULT 0, -- Cargo por devolución tardía
    additional_charges DECIMAL(10,2) DEFAULT 0, -- Otros cargos
    additional_charges_description TEXT,
    
    -- Total cargos adicionales
    total_additional_charges DECIMAL(10,2) DEFAULT 0,
    
    -- =====================================================
    -- NOTAS
    -- =====================================================
    notes TEXT, -- Notas del cliente
    internal_notes TEXT, -- Notas internas (solo admin)
    cancellation_reason TEXT,
    
    -- =====================================================
    -- TIMESTAMPS
    -- =====================================================
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ -- Fecha de cierre/liquidación
);

-- Índices para bookings
CREATE INDEX IF NOT EXISTS idx_bookings_company_id ON bookings(company_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_group_id ON bookings(vehicle_group_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_date ON bookings(pickup_date);
CREATE INDEX IF NOT EXISTS idx_bookings_return_date ON bookings(return_date);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_location ON bookings(pickup_location_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(pickup_date, return_date);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE bookings IS 'Reservas de vehículos';

-- =====================================================
-- TABLA: BOOKING_EXTRAS (Extras seleccionados en cada reserva)
-- =====================================================
CREATE TABLE IF NOT EXISTS booking_extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    extra_id UUID REFERENCES extras(id) ON DELETE SET NULL,
    
    -- Datos del extra en el momento de la reserva
    extra_name TEXT NOT NULL, -- Guardamos el nombre por si se elimina el extra
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    is_per_rental BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para booking_extras
CREATE INDEX IF NOT EXISTS idx_booking_extras_booking_id ON booking_extras(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_extras_extra_id ON booking_extras(extra_id);

COMMENT ON TABLE booking_extras IS 'Extras seleccionados en cada reserva';

-- =====================================================
-- INSERTAR TARIFAS Y EXTRAS DE EJEMPLO
-- =====================================================
DO $$
DECLARE
    demo_company_id UUID;
    general_rate_id UUID;
    eco_group_id UUID;
    com_group_id UUID;
    suv_group_id UUID;
    pre_group_id UUID;
BEGIN
    -- Obtener IDs
    SELECT id INTO demo_company_id FROM companies WHERE slug = 'alkilator-demo';
    SELECT id INTO eco_group_id FROM vehicle_groups WHERE company_id = demo_company_id AND code = 'ECO';
    SELECT id INTO com_group_id FROM vehicle_groups WHERE company_id = demo_company_id AND code = 'COM';
    SELECT id INTO suv_group_id FROM vehicle_groups WHERE company_id = demo_company_id AND code = 'SUV';
    SELECT id INTO pre_group_id FROM vehicle_groups WHERE company_id = demo_company_id AND code = 'PRE';
    
    IF demo_company_id IS NOT NULL THEN
        -- Crear tarifa general
        INSERT INTO rates (company_id, name, description, online_payment_discount, is_active, show_on_web)
        VALUES (demo_company_id, 'Tarifa General', 'Tarifa estándar todo el año', 10, true, true)
        ON CONFLICT DO NOTHING
        RETURNING id INTO general_rate_id;
        
        -- Si no existe, obtenerla
        IF general_rate_id IS NULL THEN
            SELECT id INTO general_rate_id FROM rates WHERE company_id = demo_company_id AND name = 'Tarifa General';
        END IF;
        
        IF general_rate_id IS NOT NULL THEN
            -- Precios tarifa general - Económico
            IF eco_group_id IS NOT NULL THEN
                INSERT INTO rate_group_prices (rate_id, vehicle_group_id, min_days, max_days, daily_price, km_per_day) VALUES
                (general_rate_id, eco_group_id, 1, 1, 35.00, 100),
                (general_rate_id, eco_group_id, 2, 3, 32.00, 120),
                (general_rate_id, eco_group_id, 4, 7, 28.00, 150),
                (general_rate_id, eco_group_id, 8, 14, 25.00, 180),
                (general_rate_id, eco_group_id, 15, 30, 22.00, 200),
                (general_rate_id, eco_group_id, 31, NULL, 20.00, 250)
                ON CONFLICT DO NOTHING;
            END IF;
            
            -- Precios tarifa general - Compacto
            IF com_group_id IS NOT NULL THEN
                INSERT INTO rate_group_prices (rate_id, vehicle_group_id, min_days, max_days, daily_price, km_per_day) VALUES
                (general_rate_id, com_group_id, 1, 1, 45.00, 100),
                (general_rate_id, com_group_id, 2, 3, 40.00, 120),
                (general_rate_id, com_group_id, 4, 7, 35.00, 150),
                (general_rate_id, com_group_id, 8, 14, 32.00, 180),
                (general_rate_id, com_group_id, 15, 30, 28.00, 200),
                (general_rate_id, com_group_id, 31, NULL, 25.00, 250)
                ON CONFLICT DO NOTHING;
            END IF;
            
            -- Precios tarifa general - SUV
            IF suv_group_id IS NOT NULL THEN
                INSERT INTO rate_group_prices (rate_id, vehicle_group_id, min_days, max_days, daily_price, km_per_day) VALUES
                (general_rate_id, suv_group_id, 1, 1, 65.00, 100),
                (general_rate_id, suv_group_id, 2, 3, 58.00, 120),
                (general_rate_id, suv_group_id, 4, 7, 52.00, 150),
                (general_rate_id, suv_group_id, 8, 14, 48.00, 180),
                (general_rate_id, suv_group_id, 15, 30, 42.00, 200),
                (general_rate_id, suv_group_id, 31, NULL, 38.00, 250)
                ON CONFLICT DO NOTHING;
            END IF;
        END IF;
        
        -- Extras
        INSERT INTO extras (company_id, name, description, extra_type, daily_price, is_per_rental, max_quantity, display_order) VALUES
        (demo_company_id, 'GPS Navegador', 'Navegador GPS con mapas actualizados', 'accessory', 5.00, false, 1, 1),
        (demo_company_id, 'Silla bebé (0-13kg)', 'Silla de bebé grupo 0+', 'accessory', 8.00, true, 2, 2),
        (demo_company_id, 'Elevador niño (15-36kg)', 'Elevador para niños grupo 2/3', 'accessory', 6.00, true, 2, 3),
        (demo_company_id, 'Conductor adicional', 'Añadir un conductor adicional al contrato', 'driver', 7.00, false, 3, 4),
        (demo_company_id, 'Reducción franquicia 50%', 'Reduce la franquicia a la mitad', 'insurance', 12.00, false, 1, 5),
        (demo_company_id, 'Franquicia 0€', 'Sin franquicia, cobertura total', 'insurance', 22.00, false, 1, 6),
        (demo_company_id, 'Kilómetros ilimitados', 'Sin límite de kilómetros', 'km_package', 15.00, false, 1, 7),
        (demo_company_id, 'WiFi Portátil', 'Router WiFi 4G portátil', 'accessory', 8.00, false, 1, 8),
        (demo_company_id, 'Cadenas de nieve', 'Cadenas para nieve/hielo', 'accessory', 20.00, true, 1, 9)
        ON CONFLICT DO NOTHING;
        
        -- Cupón de ejemplo
        INSERT INTO discount_codes (company_id, code, description, discount_type, discount_value, valid_until, max_uses, is_active)
        VALUES (demo_company_id, 'BIENVENIDO10', 'Descuento de bienvenida', 'percentage', 10, '2025-12-31', 100, true)
        ON CONFLICT (company_id, code) DO NOTHING;
    END IF;
END $$;

-- =====================================================
-- TABLA: CONTRACTS (Contratos de alquiler)
-- =====================================================
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    
    -- Número de contrato único
    contract_number TEXT UNIQUE NOT NULL, -- Ej: "CONT-202501-0042"
    
    -- Firma digital
    signature_data TEXT, -- Base64 de la imagen de la firma
    signed_at TIMESTAMPTZ,
    signed_by_name TEXT, -- Nombre de quien firma
    signed_by_document TEXT, -- DNI/Pasaporte de quien firma
    
    -- IP y dispositivo (para auditoría)
    signed_from_ip TEXT,
    signed_from_device TEXT,
    
    -- PDF generado
    pdf_url TEXT,
    
    -- Estado
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'signed', 'cancelled')),
    
    -- Datos del contrato en el momento de generación (snapshot)
    contract_data JSONB, -- Copia de todos los datos del contrato
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para contracts
CREATE INDEX IF NOT EXISTS idx_contracts_company_id ON contracts(company_id);
CREATE INDEX IF NOT EXISTS idx_contracts_booking_id ON contracts(booking_id);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_number ON contracts(contract_number);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;
CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE contracts IS 'Contratos de alquiler generados para cada reserva';

-- =====================================================
-- TABLA: VEHICLE_MAINTENANCE (Mantenimientos de vehículos)
-- =====================================================
CREATE TABLE IF NOT EXISTS vehicle_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    
    -- Tipo de mantenimiento
    maintenance_type TEXT NOT NULL CHECK (maintenance_type IN (
        'oil_change',      -- Cambio de aceite
        'tires',           -- Neumáticos
        'brakes',          -- Frenos
        'filters',         -- Filtros (aire, combustible, etc.)
        'battery',         -- Batería
        'timing_belt',     -- Correa de distribución
        'air_conditioning',-- Aire acondicionado
        'revision',        -- Revisión general
        'repair',          -- Reparación
        'other'            -- Otro
    )),
    
    -- Descripción
    title TEXT NOT NULL,
    description TEXT,
    
    -- Programación
    scheduled_date DATE, -- Fecha programada
    scheduled_km INTEGER, -- Km programados (lo que ocurra primero)
    
    -- Estado
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'pending', 'in_progress', 'completed', 'cancelled')),
    -- scheduled: Programado para el futuro
    -- pending: Vencido (fecha pasada o km superados)
    -- in_progress: En taller
    -- completed: Completado
    -- cancelled: Cancelado
    
    -- Datos de completado
    completed_date DATE,
    completed_mileage INTEGER,
    
    -- Taller
    workshop_name TEXT,
    workshop_phone TEXT,
    workshop_address TEXT,
    
    -- Costes
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    
    -- Documentos
    document_url TEXT, -- Factura o comprobante
    photos TEXT[] DEFAULT '{}',
    
    -- Notas
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para vehicle_maintenance
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_company_id ON vehicle_maintenance(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_vehicle_id ON vehicle_maintenance(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_status ON vehicle_maintenance(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_scheduled_date ON vehicle_maintenance(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_type ON vehicle_maintenance(maintenance_type);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_vehicle_maintenance_updated_at ON vehicle_maintenance;
CREATE TRIGGER update_vehicle_maintenance_updated_at
    BEFORE UPDATE ON vehicle_maintenance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE vehicle_maintenance IS 'Registro de mantenimientos de vehículos (programados y realizados)';

-- =====================================================
-- TABLA: VEHICLE_ITV (Inspecciones Técnicas de Vehículos)
-- =====================================================
CREATE TABLE IF NOT EXISTS vehicle_itv (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    
    -- Fecha de ITV
    scheduled_date DATE NOT NULL, -- Fecha límite para pasar la ITV
    
    -- Estado
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'pending', 'completed')),
    -- scheduled: Programada para el futuro
    -- pending: Vencida (fecha pasada sin completar)
    -- completed: Completada
    
    -- Datos de completado
    completed_date DATE,
    result TEXT CHECK (result IN ('favorable', 'unfavorable', 'negative')),
    -- favorable: Apta
    -- unfavorable: Apta con defectos leves
    -- negative: No apta
    
    -- Estación ITV
    station_name TEXT,
    station_address TEXT,
    
    -- Coste
    cost DECIMAL(10,2),
    
    -- Documentos
    document_url TEXT, -- Informe de ITV
    
    -- Próxima ITV (calculada al completar)
    next_itv_date DATE,
    
    -- Notas
    notes TEXT,
    defects_description TEXT, -- Descripción de defectos si los hay
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para vehicle_itv
CREATE INDEX IF NOT EXISTS idx_vehicle_itv_company_id ON vehicle_itv(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_itv_vehicle_id ON vehicle_itv(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_itv_status ON vehicle_itv(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_itv_scheduled_date ON vehicle_itv(scheduled_date);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_vehicle_itv_updated_at ON vehicle_itv;
CREATE TRIGGER update_vehicle_itv_updated_at
    BEFORE UPDATE ON vehicle_itv
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE vehicle_itv IS 'Registro de ITVs de vehículos';

-- =====================================================
-- TABLA: ACCOUNTING_TRANSACTIONS (Transacciones contables)
-- =====================================================
CREATE TABLE IF NOT EXISTS accounting_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Tipo de transacción
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    
    -- Categoría
    category TEXT NOT NULL,
    -- Categorías de ingreso: 'rental', 'extra', 'damage', 'fuel', 'other_income'
    -- Categorías de gasto: 'maintenance', 'fuel', 'insurance', 'taxes', 'salaries', 'rent', 'utilities', 'other_expense'
    
    -- Subcategoría (opcional)
    subcategory TEXT,
    
    -- Descripción
    description TEXT NOT NULL,
    
    -- Importes
    amount DECIMAL(10,2) NOT NULL, -- Importe total (con IVA si aplica)
    net_amount DECIMAL(10,2), -- Importe neto (sin IVA)
    vat_rate DECIMAL(5,2), -- % de IVA aplicado
    vat_amount DECIMAL(10,2), -- Importe de IVA
    
    -- Fecha
    transaction_date DATE NOT NULL,
    
    -- Referencias opcionales
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    maintenance_id UUID REFERENCES vehicle_maintenance(id) ON DELETE SET NULL,
    
    -- Proveedor/Cliente externo
    external_entity_name TEXT, -- Nombre del proveedor o cliente
    external_entity_tax_id TEXT, -- CIF/NIF del proveedor
    
    -- Estado de pago
    is_paid BOOLEAN DEFAULT false,
    payment_date DATE,
    payment_method TEXT,
    payment_reference TEXT, -- Número de transferencia, recibo, etc.
    
    -- Vencimiento (para gastos pendientes)
    due_date DATE,
    
    -- Facturación
    is_invoiced BOOLEAN DEFAULT false,
    invoice_number TEXT,
    invoice_date DATE,
    invoice_url TEXT, -- URL del PDF de la factura
    
    -- Documento adjunto
    document_url TEXT, -- Factura recibida, justificante, etc.
    
    -- Notas
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para accounting_transactions
CREATE INDEX IF NOT EXISTS idx_accounting_transactions_company_id ON accounting_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_accounting_transactions_type ON accounting_transactions(type);
CREATE INDEX IF NOT EXISTS idx_accounting_transactions_category ON accounting_transactions(category);
CREATE INDEX IF NOT EXISTS idx_accounting_transactions_date ON accounting_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_accounting_transactions_booking_id ON accounting_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_accounting_transactions_vehicle_id ON accounting_transactions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_accounting_transactions_is_paid ON accounting_transactions(is_paid);
CREATE INDEX IF NOT EXISTS idx_accounting_transactions_is_invoiced ON accounting_transactions(is_invoiced);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_accounting_transactions_updated_at ON accounting_transactions;
CREATE TRIGGER update_accounting_transactions_updated_at
    BEFORE UPDATE ON accounting_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE accounting_transactions IS 'Transacciones contables (ingresos y gastos)';

-- =====================================================
-- TABLA: USER_ROLES (Roles de usuario)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE, -- NULL para super_admin
    
    -- Rol
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'rent_admin', 'employee', 'customer')),
    -- super_admin: Administrador de la plataforma (Alkilator)
    -- rent_admin: Administrador de una empresa de alquiler
    -- employee: Empleado de una empresa
    -- customer: Cliente
    
    -- Permisos adicionales (JSON)
    permissions JSONB DEFAULT '{}'::jsonb,
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Un usuario solo puede tener un rol por empresa
    UNIQUE(user_id, company_id)
);

-- Índices para user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_company_id ON user_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE user_roles IS 'Roles de usuario en el sistema';

-- =====================================================
-- TABLA: ACTIVITY_LOG (Registro de actividad - Auditoría)
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Acción
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', etc.
    entity_type TEXT NOT NULL, -- 'booking', 'vehicle', 'customer', etc.
    entity_id UUID, -- ID del registro afectado
    
    -- Descripción
    description TEXT,
    
    -- Datos (antes y después para updates)
    old_data JSONB,
    new_data JSONB,
    
    -- Metadata
    ip_address TEXT,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para activity_log
CREATE INDEX IF NOT EXISTS idx_activity_log_company_id ON activity_log(company_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

COMMENT ON TABLE activity_log IS 'Registro de actividad para auditoría';

-- =====================================================
-- INSERTAR DATOS DE MANTENIMIENTO DE EJEMPLO
-- =====================================================
DO $$
DECLARE
    demo_company_id UUID;
    vehicle_1_id UUID;
    vehicle_2_id UUID;
BEGIN
    -- Obtener IDs
    SELECT id INTO demo_company_id FROM companies WHERE slug = 'alkilator-demo';
    SELECT id INTO vehicle_1_id FROM vehicles WHERE company_id = demo_company_id AND plate = '1234ABC';
    SELECT id INTO vehicle_2_id FROM vehicles WHERE company_id = demo_company_id AND plate = '5678DEF';
    
    IF demo_company_id IS NOT NULL AND vehicle_1_id IS NOT NULL THEN
        -- Mantenimientos programados
        INSERT INTO vehicle_maintenance (company_id, vehicle_id, maintenance_type, title, description, scheduled_date, scheduled_km, status, estimated_cost)
        VALUES 
        (demo_company_id, vehicle_1_id, 'oil_change', 'Cambio de aceite y filtros', 'Cambio de aceite motor y filtro de aceite', CURRENT_DATE + INTERVAL '30 days', 20000, 'scheduled', 150.00),
        (demo_company_id, vehicle_1_id, 'tires', 'Revisión neumáticos', 'Revisar desgaste y presión', CURRENT_DATE + INTERVAL '60 days', NULL, 'scheduled', 50.00)
        ON CONFLICT DO NOTHING;
        
        -- ITV programada
        INSERT INTO vehicle_itv (company_id, vehicle_id, scheduled_date, status)
        VALUES 
        (demo_company_id, vehicle_1_id, CURRENT_DATE + INTERVAL '6 months', 'scheduled')
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF demo_company_id IS NOT NULL AND vehicle_2_id IS NOT NULL THEN
        -- Mantenimiento para vehículo 2
        INSERT INTO vehicle_maintenance (company_id, vehicle_id, maintenance_type, title, description, scheduled_date, scheduled_km, status, estimated_cost)
        VALUES 
        (demo_company_id, vehicle_2_id, 'revision', 'Revisión general', 'Revisión de los 30.000 km', CURRENT_DATE + INTERVAL '15 days', 30000, 'scheduled', 300.00)
        ON CONFLICT DO NOTHING;
        
        -- ITV programada
        INSERT INTO vehicle_itv (company_id, vehicle_id, scheduled_date, status)
        VALUES 
        (demo_company_id, vehicle_2_id, CURRENT_DATE + INTERVAL '3 months', 'scheduled')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- =====================================================
-- FUNCIONES Y PROCEDIMIENTOS
-- =====================================================

-- =====================================================
-- FUNCIÓN: Verificar si un usuario tiene un rol específico
-- =====================================================
CREATE OR REPLACE FUNCTION has_role(check_user_id UUID, check_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = check_user_id 
        AND role = check_role
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Obtener el company_id del usuario actual
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_company_id(check_user_id UUID)
RETURNS UUID AS $$
DECLARE
    result_company_id UUID;
BEGIN
    SELECT company_id INTO result_company_id
    FROM user_roles 
    WHERE user_id = check_user_id 
    AND role IN ('rent_admin', 'employee')
    AND is_active = true
    LIMIT 1;
    
    RETURN result_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Generar número de reserva único
-- =====================================================
CREATE OR REPLACE FUNCTION generate_booking_number(p_company_id UUID)
RETURNS TEXT AS $$
DECLARE
    year_month TEXT;
    next_number INTEGER;
    result TEXT;
BEGIN
    year_month := TO_CHAR(NOW(), 'YYYYMM');
    
    -- Obtener el siguiente número para este mes
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(booking_number FROM '[0-9]+$') AS INTEGER)
    ), 0) + 1
    INTO next_number
    FROM bookings
    WHERE company_id = p_company_id
    AND booking_number LIKE 'ALK-' || year_month || '-%';
    
    result := 'ALK-' || year_month || '-' || LPAD(next_number::TEXT, 4, '0');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Generar número de contrato único
-- =====================================================
CREATE OR REPLACE FUNCTION generate_contract_number(p_company_id UUID)
RETURNS TEXT AS $$
DECLARE
    year_month TEXT;
    next_number INTEGER;
    result TEXT;
BEGIN
    year_month := TO_CHAR(NOW(), 'YYYYMM');
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(contract_number FROM '[0-9]+$') AS INTEGER)
    ), 0) + 1
    INTO next_number
    FROM contracts
    WHERE company_id = p_company_id
    AND contract_number LIKE 'CONT-' || year_month || '-%';
    
    result := 'CONT-' || year_month || '-' || LPAD(next_number::TEXT, 4, '0');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Generar número de factura único
-- =====================================================
CREATE OR REPLACE FUNCTION generate_invoice_number(p_company_id UUID)
RETURNS TEXT AS $$
DECLARE
    prefix TEXT;
    next_num INTEGER;
    result TEXT;
BEGIN
    -- Obtener prefix y siguiente número de la empresa
    SELECT invoice_prefix, invoice_next_number 
    INTO prefix, next_num
    FROM companies 
    WHERE id = p_company_id;
    
    -- Generar número
    result := COALESCE(prefix, 'INV') || '-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(next_num::TEXT, 5, '0');
    
    -- Incrementar contador
    UPDATE companies 
    SET invoice_next_number = invoice_next_number + 1
    WHERE id = p_company_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Verificar disponibilidad de vehículo
-- =====================================================
CREATE OR REPLACE FUNCTION check_vehicle_availability(
    p_vehicle_id UUID,
    p_pickup_date DATE,
    p_return_date DATE,
    p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    is_available BOOLEAN;
BEGIN
    -- Verificar si hay reservas solapadas
    SELECT NOT EXISTS (
        SELECT 1 FROM bookings
        WHERE vehicle_id = p_vehicle_id
        AND status NOT IN ('cancelled', 'completed')
        AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
        AND (
            (pickup_date <= p_return_date AND return_date >= p_pickup_date)
        )
    ) INTO is_available;
    
    -- También verificar que el vehículo esté activo y disponible
    IF is_available THEN
        SELECT EXISTS (
            SELECT 1 FROM vehicles
            WHERE id = p_vehicle_id
            AND is_active = true
            AND status IN ('available', 'rented') -- rented también porque puede tener reservas futuras
        ) INTO is_available;
    END IF;
    
    RETURN is_available;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Obtener vehículos disponibles para un rango de fechas
-- =====================================================
CREATE OR REPLACE FUNCTION get_available_vehicles(
    p_company_id UUID,
    p_pickup_date DATE,
    p_return_date DATE,
    p_pickup_location_id UUID DEFAULT NULL,
    p_vehicle_type TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    vehicle_group_id UUID,
    brand TEXT,
    model TEXT,
    year INTEGER,
    plate TEXT,
    fuel_type TEXT,
    transmission TEXT,
    seats INTEGER,
    image_url TEXT,
    features JSONB,
    group_name TEXT,
    group_code TEXT,
    deposit_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.vehicle_group_id,
        v.brand,
        v.model,
        v.year,
        v.plate,
        v.fuel_type,
        v.transmission,
        v.seats,
        v.image_url,
        v.features,
        vg.name as group_name,
        vg.code as group_code,
        vg.deposit_amount
    FROM vehicles v
    JOIN vehicle_groups vg ON v.vehicle_group_id = vg.id
    WHERE v.company_id = p_company_id
    AND v.is_active = true
    AND v.status = 'available'
    AND vg.is_active = true
    -- Filtrar por tipo de vehículo si se especifica
    AND (p_vehicle_type IS NULL OR vg.vehicle_type = p_vehicle_type)
    -- Filtrar por ubicación si se especifica
    AND (p_pickup_location_id IS NULL OR v.current_location_id = p_pickup_location_id OR EXISTS (
        SELECT 1 FROM vehicle_locations vl 
        WHERE vl.vehicle_id = v.id AND vl.location_id = p_pickup_location_id
    ))
    -- Verificar disponibilidad en fechas
    AND check_vehicle_availability(v.id, p_pickup_date, p_return_date)
    ORDER BY vg.display_order, v.brand, v.model;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Calcular precio de reserva
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_booking_price(
    p_company_id UUID,
    p_vehicle_group_id UUID,
    p_pickup_date DATE,
    p_return_date DATE,
    p_rate_id UUID DEFAULT NULL
)
RETURNS TABLE (
    total_days INTEGER,
    daily_price DECIMAL,
    base_price DECIMAL,
    km_per_day INTEGER,
    rate_id UUID,
    rate_name TEXT
) AS $$
DECLARE
    v_total_days INTEGER;
    v_rate_id UUID;
    v_rate_name TEXT;
    v_daily_price DECIMAL;
    v_km_per_day INTEGER;
BEGIN
    -- Calcular días totales
    v_total_days := p_return_date - p_pickup_date;
    IF v_total_days < 1 THEN
        v_total_days := 1;
    END IF;
    
    -- Determinar tarifa a usar
    IF p_rate_id IS NOT NULL THEN
        -- Usar la tarifa especificada
        v_rate_id := p_rate_id;
    ELSE
        -- Buscar tarifa por fechas (la más específica primero)
        SELECT r.id, r.name INTO v_rate_id, v_rate_name
        FROM rates r
        WHERE r.company_id = p_company_id
        AND r.is_active = true
        AND r.show_on_web = true
        AND (
            (r.valid_from IS NOT NULL AND r.valid_until IS NOT NULL 
             AND p_pickup_date >= r.valid_from AND p_pickup_date <= r.valid_until)
            OR (r.valid_from IS NULL AND r.valid_until IS NULL)
        )
        ORDER BY 
            CASE WHEN r.valid_from IS NOT NULL THEN 0 ELSE 1 END,
            r.created_at DESC
        LIMIT 1;
    END IF;
    
    -- Obtener nombre de tarifa si no lo tenemos
    IF v_rate_name IS NULL AND v_rate_id IS NOT NULL THEN
        SELECT name INTO v_rate_name FROM rates WHERE id = v_rate_id;
    END IF;
    
    -- Buscar precio para el grupo y rango de días
    SELECT rgp.daily_price, rgp.km_per_day 
    INTO v_daily_price, v_km_per_day
    FROM rate_group_prices rgp
    WHERE rgp.rate_id = v_rate_id
    AND rgp.vehicle_group_id = p_vehicle_group_id
    AND rgp.min_days <= v_total_days
    AND (rgp.max_days IS NULL OR rgp.max_days >= v_total_days)
    ORDER BY rgp.min_days DESC
    LIMIT 1;
    
    -- Valores por defecto si no se encuentra precio
    IF v_daily_price IS NULL THEN
        v_daily_price := 0;
        v_km_per_day := 150;
    END IF;
    
    RETURN QUERY SELECT 
        v_total_days,
        v_daily_price,
        v_daily_price * v_total_days,
        v_km_per_day,
        v_rate_id,
        v_rate_name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Validar código de descuento
-- =====================================================
CREATE OR REPLACE FUNCTION validate_discount_code(
    p_company_id UUID,
    p_code TEXT,
    p_customer_id UUID DEFAULT NULL,
    p_total_days INTEGER DEFAULT 1,
    p_amount DECIMAL DEFAULT 0,
    p_vehicle_group_id UUID DEFAULT NULL
)
RETURNS TABLE (
    is_valid BOOLEAN,
    discount_type TEXT,
    discount_value DECIMAL,
    discount_amount DECIMAL,
    error_message TEXT
) AS $$
DECLARE
    v_discount RECORD;
    v_discount_amount DECIMAL;
    v_customer_uses INTEGER;
BEGIN
    -- Buscar el código
    SELECT * INTO v_discount
    FROM discount_codes dc
    WHERE dc.company_id = p_company_id
    AND UPPER(dc.code) = UPPER(p_code)
    AND dc.is_active = true;
    
    -- Verificar si existe
    IF v_discount IS NULL THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL, 'Código no válido'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar fechas de validez
    IF v_discount.valid_from IS NOT NULL AND CURRENT_DATE < v_discount.valid_from THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL, 'El código aún no es válido'::TEXT;
        RETURN;
    END IF;
    
    IF v_discount.valid_until IS NOT NULL AND CURRENT_DATE > v_discount.valid_until THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL, 'El código ha expirado'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar límite de usos
    IF v_discount.max_uses > 0 AND v_discount.current_uses >= v_discount.max_uses THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL, 'El código ha alcanzado el límite de usos'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar uso único por cliente
    IF v_discount.single_use_per_customer AND p_customer_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_customer_uses
        FROM bookings
        WHERE customer_id = p_customer_id
        AND discount_code = p_code
        AND status != 'cancelled';
        
        IF v_customer_uses > 0 THEN
            RETURN QUERY SELECT false, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL, 'Ya has usado este código'::TEXT;
            RETURN;
        END IF;
    END IF;
    
    -- Verificar mínimo de días
    IF v_discount.min_days IS NOT NULL AND p_total_days < v_discount.min_days THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL, 
            ('Mínimo ' || v_discount.min_days || ' días de alquiler')::TEXT;
        RETURN;
    END IF;
    
    -- Verificar mínimo de importe
    IF v_discount.min_amount IS NOT NULL AND p_amount < v_discount.min_amount THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL, 
            ('Importe mínimo: ' || v_discount.min_amount || '€')::TEXT;
        RETURN;
    END IF;
    
    -- Verificar grupo de vehículo
    IF v_discount.vehicle_groups IS NOT NULL AND array_length(v_discount.vehicle_groups, 1) > 0 THEN
        IF p_vehicle_group_id IS NULL OR NOT (p_vehicle_group_id = ANY(v_discount.vehicle_groups)) THEN
            RETURN QUERY SELECT false, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL, 
                'El código no es válido para este tipo de vehículo'::TEXT;
            RETURN;
        END IF;
    END IF;
    
    -- Calcular descuento
    IF v_discount.discount_type = 'percentage' THEN
        v_discount_amount := p_amount * (v_discount.discount_value / 100);
    ELSE
        v_discount_amount := v_discount.discount_value;
    END IF;
    
    -- No puede ser mayor que el importe
    IF v_discount_amount > p_amount THEN
        v_discount_amount := p_amount;
    END IF;
    
    RETURN QUERY SELECT 
        true, 
        v_discount.discount_type,
        v_discount.discount_value,
        v_discount_amount,
        NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Actualizar estado de mantenimientos pendientes
-- =====================================================
CREATE OR REPLACE FUNCTION update_pending_maintenance()
RETURNS void AS $$
BEGIN
    -- Actualizar mantenimientos por fecha
    UPDATE vehicle_maintenance
    SET status = 'pending'
    WHERE status = 'scheduled'
    AND scheduled_date IS NOT NULL
    AND scheduled_date < CURRENT_DATE;
    
    -- Actualizar mantenimientos por km (requiere join con vehicles)
    UPDATE vehicle_maintenance vm
    SET status = 'pending'
    FROM vehicles v
    WHERE vm.vehicle_id = v.id
    AND vm.status = 'scheduled'
    AND vm.scheduled_km IS NOT NULL
    AND v.current_mileage >= vm.scheduled_km;
    
    -- Actualizar ITVs pendientes
    UPDATE vehicle_itv
    SET status = 'pending'
    WHERE status = 'scheduled'
    AND scheduled_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Actualizar estadísticas de cliente
-- =====================================================
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Actualizar estadísticas del cliente
        IF NEW.customer_id IS NOT NULL AND NEW.status = 'completed' THEN
            UPDATE customers
            SET 
                total_bookings = (
                    SELECT COUNT(*) FROM bookings 
                    WHERE customer_id = NEW.customer_id 
                    AND status = 'completed'
                ),
                total_spent = (
                    SELECT COALESCE(SUM(total_price), 0) FROM bookings 
                    WHERE customer_id = NEW.customer_id 
                    AND status = 'completed'
                )
            WHERE id = NEW.customer_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_customer_stats ON bookings;
CREATE TRIGGER trigger_update_customer_stats
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_stats();

-- =====================================================
-- TRIGGER: Actualizar kilometraje del vehículo al devolver
-- =====================================================
CREATE OR REPLACE FUNCTION update_vehicle_mileage()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar km al registrar pickup
    IF NEW.pickup_mileage IS NOT NULL AND OLD.pickup_mileage IS NULL THEN
        UPDATE vehicles 
        SET current_mileage = NEW.pickup_mileage
        WHERE id = NEW.vehicle_id;
    END IF;
    
    -- Actualizar km al registrar return
    IF NEW.return_mileage IS NOT NULL AND OLD.return_mileage IS NULL THEN
        UPDATE vehicles 
        SET current_mileage = NEW.return_mileage
        WHERE id = NEW.vehicle_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_vehicle_mileage ON bookings;
CREATE TRIGGER trigger_update_vehicle_mileage
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicle_mileage();

-- =====================================================
-- TRIGGER: Cambiar estado del vehículo según reserva
-- =====================================================
CREATE OR REPLACE FUNCTION update_vehicle_status_from_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- Al pasar a in_progress, marcar vehículo como alquilado
    IF NEW.status = 'in_progress' AND OLD.status != 'in_progress' THEN
        UPDATE vehicles 
        SET status = 'rented'
        WHERE id = NEW.vehicle_id;
    END IF;
    
    -- Al completar o cancelar, marcar vehículo como disponible
    IF (NEW.status IN ('completed', 'cancelled')) AND OLD.status NOT IN ('completed', 'cancelled') THEN
        UPDATE vehicles 
        SET 
            status = 'available',
            current_location_id = NEW.return_location_id
        WHERE id = NEW.vehicle_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_vehicle_status ON bookings;
CREATE TRIGGER trigger_update_vehicle_status
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicle_status_from_booking();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS DE SEGURIDAD
-- =====================================================

-- =====================================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_group_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_itv ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNCIÓN HELPER: Obtener company_id del usuario autenticado
-- =====================================================
CREATE OR REPLACE FUNCTION auth_user_company_id()
RETURNS UUID AS $$
BEGIN
    RETURN get_user_company_id(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- FUNCIÓN HELPER: Verificar si el usuario es admin de la empresa
-- =====================================================
CREATE OR REPLACE FUNCTION is_company_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('rent_admin', 'super_admin')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- FUNCIÓN HELPER: Verificar si el usuario es empleado o admin
-- =====================================================
CREATE OR REPLACE FUNCTION is_company_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('rent_admin', 'employee')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- POLÍTICAS: COMPANIES
-- =====================================================
-- Lectura pública de empresas activas (para landing)
DROP POLICY IF EXISTS "companies_public_read" ON companies;
CREATE POLICY "companies_public_read" ON companies
    FOR SELECT
    USING (is_active = true);

-- Admin puede gestionar su empresa
DROP POLICY IF EXISTS "companies_admin_all" ON companies;
CREATE POLICY "companies_admin_all" ON companies
    FOR ALL
    USING (id = auth_user_company_id() AND is_company_admin())
    WITH CHECK (id = auth_user_company_id() AND is_company_admin());

-- =====================================================
-- POLÍTICAS: LOCATIONS
-- =====================================================
-- Lectura pública de ubicaciones activas
DROP POLICY IF EXISTS "locations_public_read" ON locations;
CREATE POLICY "locations_public_read" ON locations
    FOR SELECT
    USING (is_active = true);

-- Staff puede gestionar ubicaciones de su empresa
DROP POLICY IF EXISTS "locations_staff_all" ON locations;
CREATE POLICY "locations_staff_all" ON locations
    FOR ALL
    USING (company_id = auth_user_company_id() AND is_company_staff())
    WITH CHECK (company_id = auth_user_company_id() AND is_company_admin());

-- =====================================================
-- POLÍTICAS: VEHICLE_GROUPS
-- =====================================================
-- Lectura pública de grupos activos
DROP POLICY IF EXISTS "vehicle_groups_public_read" ON vehicle_groups;
CREATE POLICY "vehicle_groups_public_read" ON vehicle_groups
    FOR SELECT
    USING (is_active = true);

-- Staff puede gestionar grupos de su empresa
DROP POLICY IF EXISTS "vehicle_groups_staff_all" ON vehicle_groups;
CREATE POLICY "vehicle_groups_staff_all" ON vehicle_groups
    FOR ALL
    USING (company_id = auth_user_company_id() AND is_company_staff())
    WITH CHECK (company_id = auth_user_company_id() AND is_company_admin());

-- =====================================================
-- POLÍTICAS: VEHICLES
-- =====================================================
-- Lectura pública de vehículos activos (para mostrar en web)
DROP POLICY IF EXISTS "vehicles_public_read" ON vehicles;
CREATE POLICY "vehicles_public_read" ON vehicles
    FOR SELECT
    USING (is_active = true);

-- Staff puede ver todos los vehículos de su empresa
DROP POLICY IF EXISTS "vehicles_staff_read" ON vehicles;
CREATE POLICY "vehicles_staff_read" ON vehicles
    FOR SELECT
    USING (company_id = auth_user_company_id() AND is_company_staff());

-- Admin puede gestionar vehículos
DROP POLICY IF EXISTS "vehicles_admin_write" ON vehicles;
CREATE POLICY "vehicles_admin_write" ON vehicles
    FOR INSERT
    WITH CHECK (company_id = auth_user_company_id() AND is_company_admin());

DROP POLICY IF EXISTS "vehicles_admin_update" ON vehicles;
CREATE POLICY "vehicles_admin_update" ON vehicles
    FOR UPDATE
    USING (company_id = auth_user_company_id() AND is_company_admin())
    WITH CHECK (company_id = auth_user_company_id() AND is_company_admin());

DROP POLICY IF EXISTS "vehicles_admin_delete" ON vehicles;
CREATE POLICY "vehicles_admin_delete" ON vehicles
    FOR DELETE
    USING (company_id = auth_user_company_id() AND is_company_admin());

-- =====================================================
-- POLÍTICAS: VEHICLE_LOCATIONS
-- =====================================================
-- Lectura pública
DROP POLICY IF EXISTS "vehicle_locations_public_read" ON vehicle_locations;
CREATE POLICY "vehicle_locations_public_read" ON vehicle_locations
    FOR SELECT
    USING (true);

-- Admin puede gestionar
DROP POLICY IF EXISTS "vehicle_locations_admin_all" ON vehicle_locations;
CREATE POLICY "vehicle_locations_admin_all" ON vehicle_locations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM vehicles v 
            WHERE v.id = vehicle_id 
            AND v.company_id = auth_user_company_id()
        ) AND is_company_admin()
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM vehicles v 
            WHERE v.id = vehicle_id 
            AND v.company_id = auth_user_company_id()
        ) AND is_company_admin()
    );

-- =====================================================
-- POLÍTICAS: CUSTOMERS
-- =====================================================
-- Staff puede ver clientes de su empresa
DROP POLICY IF EXISTS "customers_staff_read" ON customers;
CREATE POLICY "customers_staff_read" ON customers
    FOR SELECT
    USING (company_id = auth_user_company_id() AND is_company_staff());

-- Staff puede crear y editar clientes
DROP POLICY IF EXISTS "customers_staff_write" ON customers;
CREATE POLICY "customers_staff_write" ON customers
    FOR INSERT
    WITH CHECK (company_id = auth_user_company_id() AND is_company_staff());

DROP POLICY IF EXISTS "customers_staff_update" ON customers;
CREATE POLICY "customers_staff_update" ON customers
    FOR UPDATE
    USING (company_id = auth_user_company_id() AND is_company_staff())
    WITH CHECK (company_id = auth_user_company_id() AND is_company_staff());

-- Cliente puede ver sus propios datos
DROP POLICY IF EXISTS "customers_own_read" ON customers;
CREATE POLICY "customers_own_read" ON customers
    FOR SELECT
    USING (user_id = auth.uid());

-- Cliente puede actualizar sus propios datos
DROP POLICY IF EXISTS "customers_own_update" ON customers;
CREATE POLICY "customers_own_update" ON customers
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Permitir inserción pública (registro de clientes desde web)
DROP POLICY IF EXISTS "customers_public_insert" ON customers;
CREATE POLICY "customers_public_insert" ON customers
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- POLÍTICAS: RATES
-- =====================================================
-- Lectura pública de tarifas activas para web
DROP POLICY IF EXISTS "rates_public_read" ON rates;
CREATE POLICY "rates_public_read" ON rates
    FOR SELECT
    USING (is_active = true AND show_on_web = true);

-- Staff puede ver todas las tarifas
DROP POLICY IF EXISTS "rates_staff_read" ON rates;
CREATE POLICY "rates_staff_read" ON rates
    FOR SELECT
    USING (company_id = auth_user_company_id() AND is_company_staff());

-- Admin puede gestionar tarifas
DROP POLICY IF EXISTS "rates_admin_all" ON rates;
CREATE POLICY "rates_admin_all" ON rates
    FOR ALL
    USING (company_id = auth_user_company_id() AND is_company_admin())
    WITH CHECK (company_id = auth_user_company_id() AND is_company_admin());

-- =====================================================
-- POLÍTICAS: RATE_GROUP_PRICES
-- =====================================================
-- Lectura pública (para calcular precios en web)
DROP POLICY IF EXISTS "rate_group_prices_public_read" ON rate_group_prices;
CREATE POLICY "rate_group_prices_public_read" ON rate_group_prices
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rates r 
            WHERE r.id = rate_id 
            AND r.is_active = true 
            AND r.show_on_web = true
        )
    );

-- Staff puede ver todos los precios
DROP POLICY IF EXISTS "rate_group_prices_staff_read" ON rate_group_prices;
CREATE POLICY "rate_group_prices_staff_read" ON rate_group_prices
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rates r 
            WHERE r.id = rate_id 
            AND r.company_id = auth_user_company_id()
        ) AND is_company_staff()
    );

-- Admin puede gestionar precios
DROP POLICY IF EXISTS "rate_group_prices_admin_all" ON rate_group_prices;
CREATE POLICY "rate_group_prices_admin_all" ON rate_group_prices
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM rates r 
            WHERE r.id = rate_id 
            AND r.company_id = auth_user_company_id()
        ) AND is_company_admin()
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM rates r 
            WHERE r.id = rate_id 
            AND r.company_id = auth_user_company_id()
        ) AND is_company_admin()
    );

-- =====================================================
-- POLÍTICAS: EXTRAS
-- =====================================================
-- Lectura pública de extras activos para web
DROP POLICY IF EXISTS "extras_public_read" ON extras;
CREATE POLICY "extras_public_read" ON extras
    FOR SELECT
    USING (is_active = true AND show_on_web = true);

-- Staff puede ver todos los extras
DROP POLICY IF EXISTS "extras_staff_read" ON extras;
CREATE POLICY "extras_staff_read" ON extras
    FOR SELECT
    USING (company_id = auth_user_company_id() AND is_company_staff());

-- Admin puede gestionar extras
DROP POLICY IF EXISTS "extras_admin_all" ON extras;
CREATE POLICY "extras_admin_all" ON extras
    FOR ALL
    USING (company_id = auth_user_company_id() AND is_company_admin())
    WITH CHECK (company_id = auth_user_company_id() AND is_company_admin());

-- =====================================================
-- POLÍTICAS: DISCOUNT_CODES
-- =====================================================
-- No hay lectura pública (los códigos son secretos)
-- Staff puede ver y validar códigos
DROP POLICY IF EXISTS "discount_codes_staff_read" ON discount_codes;
CREATE POLICY "discount_codes_staff_read" ON discount_codes
    FOR SELECT
    USING (company_id = auth_user_company_id() AND is_company_staff());

-- Admin puede gestionar códigos
DROP POLICY IF EXISTS "discount_codes_admin_all" ON discount_codes;
CREATE POLICY "discount_codes_admin_all" ON discount_codes
    FOR ALL
    USING (company_id = auth_user_company_id() AND is_company_admin())
    WITH CHECK (company_id = auth_user_company_id() AND is_company_admin());

-- =====================================================
-- POLÍTICAS: BOOKINGS
-- =====================================================
-- Staff puede ver reservas de su empresa
DROP POLICY IF EXISTS "bookings_staff_read" ON bookings;
CREATE POLICY "bookings_staff_read" ON bookings
    FOR SELECT
    USING (company_id = auth_user_company_id() AND is_company_staff());

-- Staff puede gestionar reservas
DROP POLICY IF EXISTS "bookings_staff_write" ON bookings;
CREATE POLICY "bookings_staff_write" ON bookings
    FOR INSERT
    WITH CHECK (company_id = auth_user_company_id() AND is_company_staff());

DROP POLICY IF EXISTS "bookings_staff_update" ON bookings;
CREATE POLICY "bookings_staff_update" ON bookings
    FOR UPDATE
    USING (company_id = auth_user_company_id() AND is_company_staff())
    WITH CHECK (company_id = auth_user_company_id() AND is_company_staff());

-- Cliente puede ver sus propias reservas
DROP POLICY IF EXISTS "bookings_customer_read" ON bookings;
CREATE POLICY "bookings_customer_read" ON bookings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM customers c 
            WHERE c.id = customer_id 
            AND c.user_id = auth.uid()
        )
    );

-- Permitir inserción pública (reservas desde web)
DROP POLICY IF EXISTS "bookings_public_insert" ON bookings;
CREATE POLICY "bookings_public_insert" ON bookings
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- POLÍTICAS: BOOKING_EXTRAS
-- =====================================================
-- Staff puede ver extras de reservas de su empresa
DROP POLICY IF EXISTS "booking_extras_staff_read" ON booking_extras;
CREATE POLICY "booking_extras_staff_read" ON booking_extras
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.id = booking_id 
            AND b.company_id = auth_user_company_id()
        ) AND is_company_staff()
    );

-- Gestión de extras en reservas
DROP POLICY IF EXISTS "booking_extras_staff_all" ON booking_extras;
CREATE POLICY "booking_extras_staff_all" ON booking_extras
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.id = booking_id 
            AND b.company_id = auth_user_company_id()
        ) AND is_company_staff()
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.id = booking_id 
            AND b.company_id = auth_user_company_id()
        ) AND is_company_staff()
    );

-- Permitir inserción pública (al crear reserva)
DROP POLICY IF EXISTS "booking_extras_public_insert" ON booking_extras;
CREATE POLICY "booking_extras_public_insert" ON booking_extras
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- POLÍTICAS: CONTRACTS
-- =====================================================
-- Staff puede ver contratos de su empresa
DROP POLICY IF EXISTS "contracts_staff_read" ON contracts;
CREATE POLICY "contracts_staff_read" ON contracts
    FOR SELECT
    USING (company_id = auth_user_company_id() AND is_company_staff());

-- Staff puede gestionar contratos
DROP POLICY IF EXISTS "contracts_staff_all" ON contracts;
CREATE POLICY "contracts_staff_all" ON contracts
    FOR ALL
    USING (company_id = auth_user_company_id() AND is_company_staff())
    WITH CHECK (company_id = auth_user_company_id() AND is_company_staff());

-- Cliente puede ver sus propios contratos
DROP POLICY IF EXISTS "contracts_customer_read" ON contracts;
CREATE POLICY "contracts_customer_read" ON contracts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings b
            JOIN customers c ON b.customer_id = c.id
            WHERE b.id = booking_id 
            AND c.user_id = auth.uid()
        )
    );

-- =====================================================
-- POLÍTICAS: VEHICLE_MAINTENANCE
-- =====================================================
-- Staff puede ver mantenimientos de su empresa
DROP POLICY IF EXISTS "vehicle_maintenance_staff_read" ON vehicle_maintenance;
CREATE POLICY "vehicle_maintenance_staff_read" ON vehicle_maintenance
    FOR SELECT
    USING (company_id = auth_user_company_id() AND is_company_staff());

-- Admin puede gestionar mantenimientos
DROP POLICY IF EXISTS "vehicle_maintenance_admin_all" ON vehicle_maintenance;
CREATE POLICY "vehicle_maintenance_admin_all" ON vehicle_maintenance
    FOR ALL
    USING (company_id = auth_user_company_id() AND is_company_admin())
    WITH CHECK (company_id = auth_user_company_id() AND is_company_admin());

-- =====================================================
-- POLÍTICAS: VEHICLE_ITV
-- =====================================================
-- Staff puede ver ITVs de su empresa
DROP POLICY IF EXISTS "vehicle_itv_staff_read" ON vehicle_itv;
CREATE POLICY "vehicle_itv_staff_read" ON vehicle_itv
    FOR SELECT
    USING (company_id = auth_user_company_id() AND is_company_staff());

-- Admin puede gestionar ITVs
DROP POLICY IF EXISTS "vehicle_itv_admin_all" ON vehicle_itv;
CREATE POLICY "vehicle_itv_admin_all" ON vehicle_itv
    FOR ALL
    USING (company_id = auth_user_company_id() AND is_company_admin())
    WITH CHECK (company_id = auth_user_company_id() AND is_company_admin());

-- =====================================================
-- POLÍTICAS: ACCOUNTING_TRANSACTIONS
-- =====================================================
-- Solo admin puede ver y gestionar contabilidad
DROP POLICY IF EXISTS "accounting_admin_all" ON accounting_transactions;
CREATE POLICY "accounting_admin_all" ON accounting_transactions
    FOR ALL
    USING (company_id = auth_user_company_id() AND is_company_admin())
    WITH CHECK (company_id = auth_user_company_id() AND is_company_admin());

-- =====================================================
-- POLÍTICAS: USER_ROLES
-- =====================================================
-- Usuario puede ver sus propios roles
DROP POLICY IF EXISTS "user_roles_own_read" ON user_roles;
CREATE POLICY "user_roles_own_read" ON user_roles
    FOR SELECT
    USING (user_id = auth.uid());

-- Admin puede ver roles de su empresa
DROP POLICY IF EXISTS "user_roles_admin_read" ON user_roles;
CREATE POLICY "user_roles_admin_read" ON user_roles
    FOR SELECT
    USING (company_id = auth_user_company_id() AND is_company_admin());

-- Admin puede gestionar roles de su empresa
DROP POLICY IF EXISTS "user_roles_admin_all" ON user_roles;
CREATE POLICY "user_roles_admin_all" ON user_roles
    FOR ALL
    USING (company_id = auth_user_company_id() AND is_company_admin())
    WITH CHECK (company_id = auth_user_company_id() AND is_company_admin());

-- =====================================================
-- POLÍTICAS: ACTIVITY_LOG
-- =====================================================
-- Admin puede ver logs de su empresa
DROP POLICY IF EXISTS "activity_log_admin_read" ON activity_log;
CREATE POLICY "activity_log_admin_read" ON activity_log
    FOR SELECT
    USING (company_id = auth_user_company_id() AND is_company_admin());

-- Permitir inserción desde cualquier contexto autenticado
DROP POLICY IF EXISTS "activity_log_insert" ON activity_log;
CREATE POLICY "activity_log_insert" ON activity_log
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
