# Scripts de Base de Datos - Alkilator

Este directorio contiene los scripts SQL para configurar la base de datos de Alkilator en Supabase.

## Archivos

- `schema.sql` - Script principal con todas las tablas del sistema

## Instrucciones de Ejecución

1. Accede al **SQL Editor** en tu proyecto de Supabase
2. Copia y pega el contenido completo de `schema.sql`
3. Ejecuta el script
4. Verifica que las tablas se hayan creado correctamente en el **Table Editor**

## Tablas Creadas

### Core
- **Companies** - Empresas de alquiler con toda su configuración
- **Locations** - Ubicaciones o sucursales donde se pueden recoger/devolver vehículos
- **Vehicle Groups** - Grupos o categorías de vehículos (Económico, Compacto, SUV, etc.)

### Vehículos
- **Vehicles** - Vehículos individuales de la flota con todas sus especificaciones
- **Vehicle Locations** - Relación muchos a muchos entre vehículos y ubicaciones disponibles

### Clientes
- **Customers** - Clientes que han realizado reservas con sus datos personales y documentación

### Tarifas y Precios
- **Rates** - Tarifas de precios (general y por temporadas)
- **Rate Group Prices** - Precios por grupo de vehículo y rango de días dentro de cada tarifa

### Extras y Descuentos
- **Extras** - Complementos opcionales que se pueden añadir a las reservas (GPS, sillas, seguros, etc.)
- **Discount Codes** - Cupones y códigos de descuento

### Reservas
- **Bookings** - Reservas de vehículos con todos los datos económicos, de recogida y devolución
- **Booking Extras** - Extras seleccionados en cada reserva

### Contratos
- **Contracts** - Contratos de alquiler generados para cada reserva con firma digital

### Mantenimientos
- **Vehicle Maintenance** - Registro de mantenimientos de vehículos (programados y realizados)
- **Vehicle ITV** - Registro de Inspecciones Técnicas de Vehículos

### Contabilidad
- **Accounting Transactions** - Transacciones contables (ingresos y gastos)

### Sistema
- **User Roles** - Roles de usuario en el sistema (super_admin, rent_admin, employee, customer)
- **Activity Log** - Registro de actividad para auditoría

## Datos de Ejemplo

El script incluye datos de ejemplo:
- 1 empresa demo: "Alkilator Demo"
- 3 ubicaciones de ejemplo (Madrid Aeropuerto, Madrid Centro, Barcelona Aeropuerto)
- 6 grupos de vehículos (Económico, Compacto, SUV, Premium, Furgoneta Pequeña, Furgoneta Grande)
- 4 vehículos de ejemplo (SEAT Ibiza, Renault Clio, Volkswagen Golf, Audi Q3)
- 1 tarifa general con precios para todos los grupos según rango de días
- 9 extras de ejemplo (GPS, sillas, seguros, WiFi, etc.)
- 1 cupón de descuento de ejemplo ("BIENVENIDO10")
- 3 mantenimientos programados de ejemplo
- 2 ITVs programadas de ejemplo

## Funciones y Procedimientos

El script incluye funciones SQL para la lógica de negocio:

### Funciones de Usuario y Roles
- `has_role(user_id, role)` - Verificar si un usuario tiene un rol específico
- `get_user_company_id(user_id)` - Obtener el company_id del usuario

### Funciones de Generación de Números
- `generate_booking_number(company_id)` - Generar número único de reserva (ALK-YYYYMM-XXXX)
- `generate_contract_number(company_id)` - Generar número único de contrato (CONT-YYYYMM-XXXX)
- `generate_invoice_number(company_id)` - Generar número único de factura

### Funciones de Disponibilidad y Precios
- `check_vehicle_availability(vehicle_id, pickup_date, return_date, exclude_booking_id)` - Verificar disponibilidad de vehículo
- `get_available_vehicles(company_id, pickup_date, return_date, pickup_location_id, vehicle_type)` - Obtener vehículos disponibles
- `calculate_booking_price(company_id, vehicle_group_id, pickup_date, return_date, rate_id)` - Calcular precio de reserva
- `validate_discount_code(company_id, code, customer_id, total_days, amount, vehicle_group_id)` - Validar código de descuento

### Funciones de Mantenimiento
- `update_pending_maintenance()` - Actualizar estado de mantenimientos pendientes

### Triggers Automáticos
- `update_customer_stats` - Actualiza estadísticas del cliente al completar reservas
- `update_vehicle_mileage` - Actualiza kilometraje del vehículo al recoger/devolver
- `update_vehicle_status_from_booking` - Cambia estado del vehículo según estado de reserva

### Funciones Helper para RLS
- `auth_user_company_id()` - Obtiene el company_id del usuario autenticado
- `is_company_admin()` - Verifica si el usuario es admin de la empresa
- `is_company_staff()` - Verifica si el usuario es empleado o admin

## Seguridad (Row Level Security)

Todas las tablas tienen RLS habilitado con políticas específicas:

### Acceso Público (Web)
- **Lectura**: Empresas activas, ubicaciones activas, grupos de vehículos activos, vehículos activos, tarifas activas, extras activos
- **Inserción**: Clientes (registro), Reservas (crear desde web), Booking Extras

### Acceso Staff (Empleados y Admins)
- **Lectura**: Todos los datos de su empresa
- **Escritura**: Reservas, clientes, contratos, booking extras

### Acceso Admin (Solo Administradores)
- **Gestión completa**: Vehículos, tarifas, extras, códigos de descuento, mantenimientos, ITVs, contabilidad, roles

### Acceso Cliente
- **Lectura**: Sus propios datos de cliente, sus reservas, sus contratos
- **Actualización**: Sus propios datos de cliente

## Notas

- El script usa `CREATE TABLE IF NOT EXISTS` para evitar errores si las tablas ya existen
- Los triggers se crean automáticamente para actualizar `updated_at`
- Los índices mejoran el rendimiento de las consultas
- Las funciones usan `CREATE OR REPLACE` para poder actualizarlas sin errores
