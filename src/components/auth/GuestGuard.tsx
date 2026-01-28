import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, isAdmin, isStaff, isCustomer, isLoading, isInitialized } = useAuth();
  const location = useLocation();
  
  // Mostrar loading mientras se inicializa
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Si está autenticado, redirigir según rol
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname;
    
    if (from) {
      return <Navigate to={from} replace />;
    }
    
    if (isAdmin || isStaff) {
      return <Navigate to="/admin" replace />;
    } else if (isCustomer) {
      return <Navigate to="/mi-cuenta" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }
  
  return <>{children}</>;
}
