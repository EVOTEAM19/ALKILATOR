import { supabase } from '@/lib/supabase';
import type { Company } from '@/types';

// Tipo simplificado para configuración (usando campos de companies)
export interface CompanySettings {
  default_currency: string;
  default_language: string;
  timezone: string;
  tax_rate: number;
  min_rental_days: number;
  max_rental_days: number;
  advance_booking_days: number;
  cancellation_hours: number;
  deposit_percentage: number;
  auto_confirm_bookings: boolean;
  require_payment_upfront: boolean;
  send_confirmation_email: boolean;
  send_reminder_email: boolean;
  reminder_hours_before: number;
}

// Tipo para usuario con rol
export interface CompanyUser {
  id: string;
  user_id: string;
  company_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Datos del usuario de auth.users (se obtendrán por separado)
  email?: string;
  first_name?: string;
  last_name?: string;
}

export const companyService = {
  // Obtener datos de la empresa
  async getCompany(companyId: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();
    
    if (error) throw error;
    return data as Company;
  },

  // Actualizar datos de la empresa
  async updateCompany(companyId: string, updates: Partial<Company>): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', companyId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Company;
  },

  // Obtener configuración (desde campos de companies)
  async getSettings(companyId: string): Promise<CompanySettings | null> {
    const { data: company, error } = await supabase
      .from('companies')
      .select('tax_rate, currency, timezone')
      .eq('id', companyId)
      .single();
    
    if (error) throw error;
    
    // Valores por defecto (en el futuro se podría crear una tabla company_settings)
    return {
      default_currency: company.currency || 'EUR',
      default_language: 'es',
      timezone: company.timezone || 'Europe/Madrid',
      tax_rate: company.tax_rate || 21,
      min_rental_days: 1,
      max_rental_days: 30,
      advance_booking_days: 365,
      cancellation_hours: 24,
      deposit_percentage: 100,
      auto_confirm_bookings: false,
      require_payment_upfront: false,
      send_confirmation_email: true,
      send_reminder_email: true,
      reminder_hours_before: 24,
    };
  },

  // Actualizar configuración (actualiza campos en companies)
  async updateSettings(companyId: string, settings: Partial<CompanySettings>): Promise<CompanySettings> {
    const updates: Partial<Company> = {};
    
    if (settings.default_currency) updates.currency = settings.default_currency;
    if (settings.timezone) updates.timezone = settings.timezone;
    if (settings.tax_rate !== undefined) updates.tax_rate = settings.tax_rate;
    
    if (Object.keys(updates).length > 0) {
      await supabase
        .from('companies')
        .update(updates)
        .eq('id', companyId);
    }
    
    // Retornar configuración actualizada
    return this.getSettings(companyId) as Promise<CompanySettings>;
  },

  // Obtener usuarios de la empresa (desde user_roles)
  async getCompanyUsers(companyId: string) {
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Obtener datos de usuarios de auth.users (limitado - solo email disponible)
    // En producción, esto requeriría una función RPC o vista
    const users = await Promise.all(
      (userRoles || []).map(async (role) => {
        // Intentar obtener email desde auth.users (requiere permisos especiales)
        // Por ahora, retornamos solo los datos de user_roles
        return {
          id: role.id,
          user_id: role.user_id,
          company_id: role.company_id,
          role: role.role,
          is_active: role.is_active,
          created_at: role.created_at,
          updated_at: role.updated_at,
          email: '', // Se obtendría de auth.users
          first_name: '',
          last_name: '',
        };
      })
    );
    
    return users;
  },

  // Actualizar usuario (user_roles)
  async updateUser(userRoleId: string, updates: {
    role?: string;
    is_active?: boolean;
  }) {
    const { data, error } = await supabase
      .from('user_roles')
      .update(updates)
      .eq('id', userRoleId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Invitar usuario (crear entrada en user_roles pendiente)
  async inviteUser(companyId: string, email: string, role: string, firstName?: string, lastName?: string) {
    // Nota: En producción, esto requeriría:
    // 1. Crear usuario en auth.users (requiere permisos de admin)
    // 2. Crear entrada en user_roles
    // Por ahora, solo mostramos un mensaje informativo
    
    // En una implementación real, esto requeriría:
    // - Supabase Auth Admin API para crear usuarios
    // - O un endpoint backend que maneje la creación
    
    throw new Error('La invitación de usuarios requiere integración con Supabase Auth Admin API. Por favor, crea el usuario manualmente desde Supabase Dashboard.');
  },

  // Eliminar usuario (eliminar user_roles)
  async deleteUser(userRoleId: string) {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', userRoleId);
    
    if (error) throw error;
  },

  // Obtener plantillas de email (simplificado - retornar plantillas por defecto)
  async getEmailTemplates(companyId: string) {
    // En el futuro, esto podría usar una tabla email_templates
    // Por ahora, retornamos plantillas por defecto
    return [
      {
        id: 'booking_confirmation',
        company_id: companyId,
        template_type: 'booking_confirmation',
        name: 'Confirmación de reserva',
        subject: 'Tu reserva {{booking_number}} ha sido confirmada',
        body: `Hola {{customer_name}},

Tu reserva ha sido confirmada con los siguientes detalles:

Número de reserva: {{booking_number}}
Vehículo: {{vehicle_group}}
Fecha de recogida: {{pickup_date}} a las {{pickup_time}}
Lugar de recogida: {{pickup_location}}
Fecha de devolución: {{return_date}} a las {{return_time}}
Lugar de devolución: {{return_location}}

Total: {{total_price}}

Gracias por confiar en nosotros.`,
        is_active: true,
      },
      {
        id: 'booking_reminder',
        company_id: companyId,
        template_type: 'booking_reminder',
        name: 'Recordatorio de reserva',
        subject: 'Recordatorio: Tu alquiler comienza mañana',
        body: `Hola {{customer_name}},

Te recordamos que tu reserva {{booking_number}} comienza mañana.

Recuerda traer:
- DNI/Pasaporte
- Carnet de conducir
- Tarjeta de crédito para la fianza

Te esperamos en {{pickup_location}} a las {{pickup_time}}.

¡Buen viaje!`,
        is_active: true,
      },
      {
        id: 'booking_completed',
        company_id: companyId,
        template_type: 'booking_completed',
        name: 'Reserva completada',
        subject: 'Gracias por tu alquiler - Reserva {{booking_number}}',
        body: `Hola {{customer_name}},

Tu alquiler ha sido completado satisfactoriamente.

Esperamos que hayas disfrutado de tu experiencia con nosotros.

¿Podrías dejarnos una valoración? Tu opinión nos ayuda a mejorar.

¡Hasta pronto!`,
        is_active: true,
      },
    ];
  },

  // Actualizar plantilla de email (simplificado - solo retorna)
  async updateEmailTemplate(templateId: string, updates: {
    subject?: string;
    body?: string;
    is_active?: boolean;
  }) {
    // En el futuro, esto actualizaría una tabla email_templates
    // Por ahora, solo retornamos los datos actualizados
    return {
      id: templateId,
      ...updates,
    };
  },
};
