import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageLoader } from '@/components/shared/PageLoader';
import { registerServiceWorker } from '@/lib/serviceWorker';
import { measureWebVitals } from '@/lib/performance';

// =====================================================
// LAZY LOAD - PÁGINAS PÚBLICAS
// =====================================================
const LandingPage = lazy(() => import('@/pages/public/LandingPage'));
const VehicleResultsPage = lazy(() => import('@/pages/public/VehicleResultsPage'));
const ExtrasPage = lazy(() => import('@/pages/public/ExtrasPage'));
const CustomerDataPage = lazy(() => import('@/pages/public/CustomerDataPage'));
const CheckoutPage = lazy(() => import('@/pages/public/CheckoutPage'));
const ConfirmationPage = lazy(() => import('@/pages/public/ConfirmationPage'));
const CrearEmpresaAlquilerPage = lazy(() => import('@/pages/public/CrearEmpresaAlquilerPage'));
const PresentacionPage = lazy(() => import('@/pages/public/PresentacionPage'));

// =====================================================
// LAZY LOAD - PÁGINAS DE AUTENTICACIÓN
// =====================================================
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

// =====================================================
// LAZY LOAD - PÁGINAS ADMIN
// =====================================================
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'));
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const BookingsPage = lazy(() => import('@/pages/admin/BookingsPage'));
const BookingDetailPage = lazy(() => import('@/pages/admin/BookingDetailPage'));
const VehiclesPage = lazy(() => import('@/pages/admin/VehiclesPage'));
const VehicleFormPage = lazy(() => import('@/pages/admin/VehicleFormPage'));
const VehicleDetailPage = lazy(() => import('@/pages/admin/VehicleDetailPage'));
const VehicleGroupsPage = lazy(() => import('@/pages/admin/VehicleGroupsPage'));
const CustomersPage = lazy(() => import('@/pages/admin/CustomersPage'));
const CustomerDetailPage = lazy(() => import('@/pages/admin/CustomerDetailPage'));
const CustomerFormPage = lazy(() => import('@/pages/admin/CustomerFormPage'));
const RatesPage = lazy(() => import('@/pages/admin/RatesPage'));
const AdminExtrasPage = lazy(() => import('@/pages/admin/ExtrasPage'));
const DiscountsPage = lazy(() => import('@/pages/admin/DiscountsPage'));
const LocationsPage = lazy(() => import('@/pages/admin/LocationsPage'));
const MaintenancesPage = lazy(() => import('@/pages/admin/MaintenancesPage'));
const AccountingPage = lazy(() => import('@/pages/admin/AccountingPage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));
const ReportsPage = lazy(() => import('@/pages/admin/ReportsPage'));

// =====================================================
// PÁGINA 404
// =====================================================
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Página no encontrada</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a 
            href="/" 
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Volver al inicio
          </a>
          <a 
            href="/contacto" 
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            Contactar soporte
          </a>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// APP COMPONENT
// =====================================================
function App() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    measureWebVitals((metric) => {
      if (import.meta.env.DEV) {
        console.log('[Web Vital]', metric.name, metric.value);
      }
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', metric.name, {
          event_category: 'Web Vitals',
          value: Math.round(
            metric.name === 'CLS' ? metric.value * 1000 : metric.value
          ),
          non_interaction: true,
        });
      }
    });
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ============================================= */}
        {/* RUTAS PÚBLICAS CON LAYOUT */}
        {/* ============================================= */}
        <Route element={<PublicLayout />}>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Motor de Reservas */}
          <Route path="/vehiculos" element={<VehicleResultsPage />} />
          <Route path="/extras" element={<ExtrasPage />} />
          <Route path="/datos-cliente" element={<CustomerDataPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmacion/:bookingId" element={<ConfirmationPage />} />
          
          {/* Páginas informativas / Franquicias (estilo Fastia) */}
          <Route path="/franquicias" element={<CrearEmpresaAlquilerPage />} />
          <Route path="/crear-empresa-alquiler" element={<CrearEmpresaAlquilerPage />} />
          <Route path="/montar-rent-a-car" element={<CrearEmpresaAlquilerPage />} />
          <Route path="/franquicia-alquiler-coches" element={<CrearEmpresaAlquilerPage />} />
          <Route path="/franquicia-alquiler-furgonetas" element={<CrearEmpresaAlquilerPage />} />
          <Route path="/presentacion" element={<PresentacionPage />} />
          <Route path="/presentacion-franquicias" element={<PresentacionPage />} />
          <Route path="/ubicaciones" element={<PlaceholderPage title="Ubicaciones" />} />
          <Route path="/ofertas" element={<PlaceholderPage title="Ofertas" />} />
          <Route path="/tarifas" element={<PlaceholderPage title="Tarifas" />} />
          <Route path="/faq" element={<PlaceholderPage title="Preguntas Frecuentes" />} />
          <Route path="/contacto" element={<PlaceholderPage title="Contacto" />} />
          <Route path="/sobre-nosotros" element={<PlaceholderPage title="Sobre Nosotros" />} />
          
          {/* Páginas legales */}
          <Route path="/terminos" element={<PlaceholderPage title="Términos y Condiciones" />} />
          <Route path="/privacidad" element={<PlaceholderPage title="Política de Privacidad" />} />
          <Route path="/cookies" element={<PlaceholderPage title="Política de Cookies" />} />
          <Route path="/aviso-legal" element={<PlaceholderPage title="Aviso Legal" />} />
          
          {/* Gestionar reserva existente */}
          <Route path="/gestionar-reserva" element={<PlaceholderPage title="Gestionar Reserva" />} />
        </Route>
        
        {/* ============================================= */}
        {/* RUTAS DE AUTENTICACIÓN (sin layout público) */}
        {/* ============================================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/recuperar-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* ============================================= */}
        {/* RUTAS DE CLIENTE AUTENTICADO */}
        {/* ============================================= */}
        {/* 
        <Route path="/mi-cuenta" element={<AuthGuard requiredRole="customer"><CustomerLayout /></AuthGuard>}>
          <Route index element={<CustomerDashboard />} />
          <Route path="reservas" element={<CustomerBookings />} />
          <Route path="reservas/:id" element={<CustomerBookingDetail />} />
          <Route path="perfil" element={<CustomerProfile />} />
        </Route>
        */}
        
        {/* ============================================= */}
        {/* RUTAS DE ADMINISTRACIÓN */}
        {/* ============================================= */}
        <Route path="/admin" element={<AuthGuard requiredRole="staff"><AdminLayout /></AuthGuard>}>
          <Route index element={<DashboardPage />} />
          <Route path="reservas" element={<BookingsPage />} />
          <Route path="reservas/nueva" element={<PlaceholderPage title="Nueva Reserva" />} />
          <Route path="reservas/:id" element={<BookingDetailPage />} />
          <Route path="flota/vehiculos" element={<VehiclesPage />} />
          <Route path="flota/vehiculos/nuevo" element={<VehicleFormPage />} />
          <Route path="flota/vehiculos/:id" element={<VehicleDetailPage />} />
          <Route path="flota/vehiculos/:id/editar" element={<VehicleFormPage />} />
          <Route path="flota/grupos" element={<VehicleGroupsPage />} />
          <Route path="ubicaciones" element={<LocationsPage />} />
          <Route path="clientes" element={<CustomersPage />} />
          <Route path="clientes/nuevo" element={<CustomerFormPage />} />
          <Route path="clientes/:id" element={<CustomerDetailPage />} />
          <Route path="clientes/:id/editar" element={<CustomerFormPage />} />
          <Route path="tarifas" element={<RatesPage />} />
          <Route path="extras" element={<AdminExtrasPage />} />
          <Route path="descuentos" element={<DiscountsPage />} />
          <Route path="mantenimientos" element={<MaintenancesPage />} />
          <Route path="contabilidad" element={<AccountingPage />} />
          <Route path="configuracion" element={<SettingsPage />} />
          <Route path="informes" element={<ReportsPage />} />
        </Route>
        
        {/* ============================================= */}
        {/* RUTA 404 - DEBE IR AL FINAL */}
        {/* ============================================= */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

// =====================================================
// PLACEHOLDER PAGE (temporal mientras se crean las páginas)
// =====================================================
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground mb-8">
          Esta página está en construcción y estará disponible próximamente.
        </p>
        <a 
          href="/" 
          className="text-primary hover:underline"
        >
          ← Volver al inicio
        </a>
      </div>
    </div>
  );
}

export default App;
