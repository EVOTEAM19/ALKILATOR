import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff' | 'customer';
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requiredRole,
  redirectTo = '/login' 
}: AuthGuardProps) {
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
  
  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  // Verificar rol si se requiere
  if (requiredRole) {
    let hasRequiredRole = false;
    
    switch (requiredRole) {
      case 'admin':
        hasRequiredRole = isAdmin;
        break;
      case 'staff':
        hasRequiredRole = isStaff;
        break;
      case 'customer':
        hasRequiredRole = isCustomer;
        break;
    }
    
    if (!hasRequiredRole) {
      // Redirigir según el rol del usuario
      if (isAdmin || isStaff) {
        return <Navigate to="/admin" replace />;
      } else if (isCustomer) {
        return <Navigate to="/mi-cuenta" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }
  
  return <>{children}</>;
}
