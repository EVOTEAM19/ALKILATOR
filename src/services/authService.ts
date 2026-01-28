import { supabase } from '@/lib/supabase';
import type { UserRole, Company, UserRoleRecord } from '@/types';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string; // Si es rent_admin, crear empresa
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  // Iniciar sesión
  async signIn({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }
  
  // Registrar nuevo usuario
  async signUp({ email, password, firstName, lastName, companyName, phone }: SignUpData) {
    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    
    if (authError) throw authError;
    if (!authData.user) throw new Error('Error al crear usuario');
    
    // 2. Si se proporciona nombre de empresa, crear empresa y asignar rol rent_admin
    if (companyName) {
      const slug = companyName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      
      // Crear empresa
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          slug: slug + '-' + Date.now().toString(36), // Asegurar unicidad
          email: email,
          phone: phone,
        })
        .select()
        .single();
      
      if (companyError) throw companyError;
      
      // Asignar rol rent_admin
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          company_id: company.id,
          role: 'rent_admin',
        });
      
      if (roleError) throw roleError;
    }
    
    return authData;
  }
  
  // Cerrar sesión
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
  
  // Obtener sesión actual
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }
  
  // Obtener usuario actual
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }
  
  // Recuperar contraseña
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }
  
  // Actualizar contraseña
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  }
  
  // Obtener rol del usuario
  async getUserRole(userId: string): Promise<UserRoleRecord | null> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  }
  
  // Obtener empresa del usuario
  async getUserCompany(companyId: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // Escuchar cambios de autenticación
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();
