import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService, type SignInData, type SignUpData } from '@/services/authService';
import { toast } from 'sonner';

export function useAuth() {
  const navigate = useNavigate();
  const {
    user,
    session,
    role,
    companyId,
    company,
    isLoading,
    isInitialized,
    setUser,
    setSession,
    setRole,
    setCompanyId,
    setCompany,
    setIsLoading,
    setIsInitialized,
    reset,
    isAuthenticated,
    isAdmin,
    isStaff,
    isCustomer,
  } = useAuthStore();
  
  // Inicializar autenticación
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const session = await authService.getSession();
      
      if (session?.user) {
        setUser(session.user);
        setSession(session);
        
        // Obtener rol
        const userRole = await authService.getUserRole(session.user.id);
        if (userRole) {
          setRole(userRole.role);
          setCompanyId(userRole.company_id || null);
          
          // Obtener empresa si tiene
          if (userRole.company_id) {
            const company = await authService.getUserCompany(userRole.company_id);
            setCompany(company);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      reset();
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [setUser, setSession, setRole, setCompanyId, setCompany, setIsLoading, setIsInitialized, reset]);
  
  // Escuchar cambios de auth
  useEffect(() => {
    initialize();
    
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setSession(session);
          
          const userRole = await authService.getUserRole(session.user.id);
          if (userRole) {
            setRole(userRole.role);
            setCompanyId(userRole.company_id || null);
            
            if (userRole.company_id) {
              const company = await authService.getUserCompany(userRole.company_id);
              setCompany(company);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          reset();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setSession(session);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [initialize, setUser, setSession, setRole, setCompanyId, setCompany, reset]);
  
  // Iniciar sesión
  const signIn = useCallback(async (data: SignInData) => {
    try {
      setIsLoading(true);
      await authService.signIn(data);
      toast.success('Sesión iniciada correctamente');
      
      // La redirección se manejará en el onAuthStateChange
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);
  
  // Registrarse
  const signUp = useCallback(async (data: SignUpData) => {
    try {
      setIsLoading(true);
      await authService.signUp(data);
      toast.success('Cuenta creada correctamente. Revisa tu email para verificar.');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Error al crear cuenta');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);
  
  // Cerrar sesión
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
      reset();
      navigate('/login');
      toast.success('Sesión cerrada');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Error al cerrar sesión');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, reset, setIsLoading]);
  
  // Recuperar contraseña
  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      await authService.resetPassword(email);
      toast.success('Email de recuperación enviado');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Error al enviar email');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);
  
  // Actualizar contraseña
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      setIsLoading(true);
      await authService.updatePassword(newPassword);
      toast.success('Contraseña actualizada');
    } catch (error: any) {
      console.error('Update password error:', error);
      toast.error(error.message || 'Error al actualizar contraseña');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);
  
  return {
    // State
    user,
    session,
    role,
    companyId,
    company,
    isLoading,
    isInitialized,
    
    // Computed
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    isStaff: isStaff(),
    isCustomer: isCustomer(),
    
    // Actions
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };
}
