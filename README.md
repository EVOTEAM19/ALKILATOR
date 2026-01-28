# Alkilator - Sistema de Alquiler de Coches y Furgonetas

Sistema completo de gestión de alquiler de vehículos desarrollado con React, TypeScript, Vite y Supabase.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ y npm
- Cuenta en [Supabase](https://supabase.com)

### Instalación

1. **Clonar el repositorio** (si aplica)
   ```bash
   git clone <url-del-repositorio>
   cd ALKILATOR
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anon-aqui
   
   # Stripe Configuration (opcional, para pagos)
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   ```

   **Cómo obtener las credenciales de Supabase:**
   - Ve a [Supabase Dashboard](https://supabase.com/dashboard)
   - Selecciona tu proyecto (o crea uno nuevo)
   - Ve a **Settings** > **API**
   - Copia:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

4. **Configurar la base de datos**

   Ejecuta el script SQL en tu proyecto de Supabase:
   - Ve a **SQL Editor** en el dashboard de Supabase
   - Abre el archivo `supabase/schema.sql`
   - Copia y ejecuta todo el contenido en el editor SQL

5. **Configurar Stripe (opcional, para pagos)**

   Si quieres habilitar pagos con tarjeta:
   - Crea una cuenta en [Stripe](https://stripe.com)
   - Obtén tu clave pública (publishable key) desde el dashboard
   - Añádela a tu archivo `.env` como `VITE_STRIPE_PUBLISHABLE_KEY`
   - Para las Edge Functions, configura `STRIPE_SECRET_KEY` en Supabase Dashboard > Settings > Edge Functions > Secrets

6. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
ALKILATOR/
├── src/
│   ├── components/      # Componentes React reutilizables
│   ├── pages/           # Páginas de la aplicación
│   ├── services/        # Servicios para interactuar con Supabase
│   ├── hooks/           # Custom hooks de React
│   ├── stores/          # Zustand stores (estado global)
│   ├── lib/             # Utilidades y configuraciones
│   └── types/           # Definiciones de tipos TypeScript
├── supabase/
│   └── schema.sql       # Esquema completo de la base de datos
└── public/              # Archivos estáticos
```

## 💳 Integración de Pagos (Stripe)

El sistema incluye integración completa con Stripe para procesar pagos:

- **Pagos con tarjeta** mediante Stripe Elements
- **Pago manual** (efectivo, transferencia) para registrar pagos fuera de la plataforma
- **Reembolsos** totales o parciales
- **Historial de pagos** por reserva
- **Edge Functions** de Supabase para comunicación segura con Stripe

### Configuración de Stripe

1. Crea una cuenta en [Stripe](https://stripe.com)
2. Obtén tus claves desde el Dashboard:
   - **Publishable Key** (pk_test_xxx) → `VITE_STRIPE_PUBLISHABLE_KEY` en `.env`
   - **Secret Key** (sk_test_xxx) → Configurar como secret en Supabase Edge Functions
3. Despliega las Edge Functions (ver `supabase/functions/README.md`)

## 🛠️ Tecnologías

- **Frontend:**
  - React 18.2+
  - TypeScript 5+
  - Vite 5+
  - Tailwind CSS 4.x
  - Stripe.js (@stripe/stripe-js, @stripe/react-stripe-js)
  
- **Testing:**
  - Vitest (unit tests)
  - React Testing Library (component tests)
  - Playwright (E2E tests)
  - MSW (API mocking)
  - shadcn/ui (componentes UI)
  - React Router DOM v6.20+
  - Zustand v4 (gestión de estado)
  - React Hook Form + Zod (validación de formularios)
  - TanStack Query v5 (React Query)
  - date-fns v3 (manejo de fechas)
  - Lucide React (iconos)
  - Sonner (notificaciones toast)
  - Recharts (gráficos)

- **Backend:**
  - Supabase (PostgreSQL + Auth + Storage)
  - Row Level Security (RLS)

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

### Testing

- `npm test` - Ejecuta tests unitarios con Vitest (modo watch)
- `npm run test:ui` - Abre la UI de Vitest
- `npm run test:run` - Ejecuta tests una vez
- `npm run test:coverage` - Genera reporte de cobertura
- `npm run test:e2e` - Ejecuta tests E2E con Playwright
- `npm run test:e2e:ui` - Abre la UI de Playwright
- `npm run test:e2e:debug` - Ejecuta tests E2E en modo debug

## 🔐 Configuración de Supabase

### Variables de Entorno Requeridas

El archivo `.env` debe contener:

```env
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

### Base de Datos

El proyecto incluye un esquema completo de base de datos en `supabase/schema.sql` que incluye:

- Tablas principales (companies, locations, vehicles, bookings, customers, etc.)
- Funciones PL/pgSQL para lógica de negocio
- Triggers automáticos
- Políticas RLS (Row Level Security)
- Índices para optimización

## 🎨 Características Principales

### Área Pública
- Landing page con motor de búsqueda
- Búsqueda y filtrado de vehículos disponibles
- Proceso de reserva completo (4 pasos)
- Selección de extras y protección
- Checkout y confirmación

### Panel de Administración
- Dashboard con métricas y gráficos
- Gestión completa de reservas
- Gestión de flota de vehículos
- Gestión de clientes
- Tarifas y extras
- Mantenimientos
- Contabilidad
- Reportes y exportación de datos
- Configuración de empresa y sistema
- Generación de contratos PDF
- Integración de pagos con Stripe

## 🧪 Testing

El proyecto incluye una suite completa de testing:

### Tests Unitarios (Vitest)
- Tests de utilidades (`src/lib/__tests__/`)
- Tests de servicios (`src/services/__tests__/`)
- Tests de componentes (`src/components/__tests__/`)
- Tests de hooks (`src/hooks/__tests__/`)
- Tests de páginas (`src/pages/__tests__/`)

### Tests E2E (Playwright)
- Flujo completo de reserva pública
- Gestión de reservas en admin
- Tests multi-navegador (Chrome, Firefox, Safari)
- Tests móviles (Android, iOS)

### Ejecutar Tests

```bash
# Tests unitarios (modo watch)
npm test

# Tests unitarios con UI
npm run test:ui

# Tests unitarios una vez
npm run test:run

# Cobertura de código
npm run test:coverage

# Tests E2E
npm run test:e2e

# Tests E2E con UI
npm run test:e2e:ui

# Tests E2E en modo debug
npm run test:e2e:debug
```

## 🐛 Solución de Problemas

### Error: "Missing Supabase environment variables"

**Solución:** Asegúrate de que el archivo `.env` existe en la raíz del proyecto y contiene las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con valores válidos.

### La página aparece en blanco

1. Verifica que las variables de entorno están correctamente configuradas
2. Revisa la consola del navegador para errores
3. Asegúrate de que el servidor de desarrollo está corriendo (`npm run dev`)

### Errores de base de datos

1. Verifica que has ejecutado el script `schema.sql` en Supabase
2. Comprueba que las políticas RLS están activas
3. Revisa los logs en el dashboard de Supabase

## 📄 Licencia

Este proyecto es privado y de uso interno.
