import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  User,
  Users,
  Mail,
  Settings,
  Save,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Check,
  X,
  Loader2,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  useCompany, 
  useCompanySettings,
  useUpdateCompany, 
  useUpdateCompanySettings,
  useCompanyUsers,
  useUpdateUser,
  useDeleteUser,
  useEmailTemplates,
  useUpdateEmailTemplate
} from '@/hooks/useCompany';
import { useAuthStore } from '@/stores/authStore';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { toast } from 'sonner';

// Schemas
const companySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
  tax_id: z.string().optional(),
});

type CompanyForm = z.infer<typeof companySchema>;

// Sección: Datos de empresa
function CompanySection() {
  const { data: company, isLoading } = useCompany();
  const updateMutation = useUpdateCompany();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
  });
  
  useEffect(() => {
    if (company) {
      reset({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        city: company.city || '',
        postal_code: company.postal_code || '',
        country: company.country || 'España',
        website: '',
        logo_url: company.logo_url || '',
        tax_id: company.tax_id || '',
      });
    }
  }, [company, reset]);
  
  const onSubmit = async (data: CompanyForm) => {
    await updateMutation.mutateAsync(data);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre comercial *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Mi Empresa de Alquiler"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tax_id">CIF/NIF</Label>
          <Input
            id="tax_id"
            {...register('tax_id')}
            placeholder="B12345678"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email de contacto</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="info@empresa.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="+34 900 000 000"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="website">Sitio web</Label>
          <Input
            id="website"
            {...register('website')}
            placeholder="https://www.empresa.com"
          />
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h4 className="font-medium">Dirección fiscal</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Calle, número, piso..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              {...register('city')}
              placeholder="Madrid"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postal_code">C.P.</Label>
              <Input
                id="postal_code"
                {...register('postal_code')}
                placeholder="28001"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                {...register('country')}
                placeholder="España"
              />
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h4 className="font-medium">Logo de la empresa</h4>
        <div className="space-y-2">
          <Label htmlFor="logo_url">URL del logo</Label>
          <Input
            id="logo_url"
            {...register('logo_url')}
            placeholder="https://www.empresa.com/logo.png"
          />
          <p className="text-xs text-muted-foreground">
            Recomendado: imagen PNG o SVG con fondo transparente
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={!isDirty || updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// Sección: Usuarios
function UsersSection() {
  const { data: users, isLoading } = useCompanyUsers();
  const { user: currentUser } = useAuthStore();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  
  const [userToDelete, setUserToDelete] = useState<any>(null);
  
  const handleDelete = async () => {
    if (userToDelete) {
      await deleteMutation.mutateAsync(userToDelete.id);
      setUserToDelete(null);
    }
  };
  
  const handleToggleActive = async (user: any) => {
    await updateMutation.mutateAsync({
      userId: user.id,
      updates: { is_active: !user.is_active },
    });
  };
  
  const handleChangeRole = async (user: any, newRole: string) => {
    await updateMutation.mutateAsync({
      userId: user.id,
      updates: { role: newRole },
    });
  };
  
  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    rent_admin: 'Administrador',
    employee: 'Empleado',
    customer: 'Cliente',
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          La gestión de usuarios requiere integración con Supabase Auth Admin API. 
          Por ahora, puedes ver y gestionar los roles de usuarios existentes.
        </AlertDescription>
      </Alert>
      
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Usuarios del sistema</h4>
          <p className="text-sm text-muted-foreground">
            Gestiona quién tiene acceso al panel de administración
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            toast.info('La invitación de usuarios requiere integración con Supabase Auth Admin API. Crea usuarios desde Supabase Dashboard.');
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Invitar usuario
        </Button>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {user.first_name?.charAt(0) || 'U'}{user.last_name?.charAt(0) || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user.first_name || 'Usuario'} {user.last_name || ''}
                        {user.user_id === currentUser?.id && (
                          <Badge variant="outline" className="ml-2 text-xs">Tú</Badge>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email || `ID: ${user.user_id.substring(0, 8)}...`}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleChangeRole(user, value)}
                    disabled={user.user_id === currentUser?.id}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent_admin">Administrador</SelectItem>
                      <SelectItem value="employee">Empleado</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={user.is_active ? 'default' : 'secondary'}
                    className={user.is_active ? 'bg-green-500' : ''}
                  >
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.user_id !== currentUser?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                          {user.is_active ? (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setUserToDelete(user)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        title="Eliminar usuario"
        description={`¿Estás seguro de que quieres eliminar este usuario?`}
        confirmText="Eliminar"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

// Sección: Configuración del sistema
function SystemSettingsSection() {
  const { data: settings, isLoading } = useCompanySettings();
  const updateMutation = useUpdateCompanySettings();
  
  const [formData, setFormData] = useState({
    default_currency: 'EUR',
    default_language: 'es',
    timezone: 'Europe/Madrid',
    tax_rate: 21,
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
  });
  
  useEffect(() => {
    if (settings) {
      setFormData({
        default_currency: settings.default_currency || 'EUR',
        default_language: settings.default_language || 'es',
        timezone: settings.timezone || 'Europe/Madrid',
        tax_rate: settings.tax_rate || 21,
        min_rental_days: settings.min_rental_days || 1,
        max_rental_days: settings.max_rental_days || 30,
        advance_booking_days: settings.advance_booking_days || 365,
        cancellation_hours: settings.cancellation_hours || 24,
        deposit_percentage: settings.deposit_percentage || 100,
        auto_confirm_bookings: settings.auto_confirm_bookings || false,
        require_payment_upfront: settings.require_payment_upfront || false,
        send_confirmation_email: settings.send_confirmation_email ?? true,
        send_reminder_email: settings.send_reminder_email ?? true,
        reminder_hours_before: settings.reminder_hours_before || 24,
      });
    }
  }, [settings]);
  
  const handleSave = async () => {
    await updateMutation.mutateAsync(formData);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Regional */}
      <div>
        <h4 className="font-medium mb-4">Configuración regional</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Moneda</Label>
            <Select
              value={formData.default_currency}
              onValueChange={(v) => setFormData({ ...formData, default_currency: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="USD">USD - Dólar</SelectItem>
                <SelectItem value="GBP">GBP - Libra</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Idioma</Label>
            <Select
              value={formData.default_language}
              onValueChange={(v) => setFormData({ ...formData, default_language: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Zona horaria</Label>
            <Select
              value={formData.timezone}
              onValueChange={(v) => setFormData({ ...formData, timezone: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/Madrid">Europa/Madrid</SelectItem>
                <SelectItem value="Europe/London">Europa/Londres</SelectItem>
                <SelectItem value="America/New_York">América/Nueva York</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Reservas */}
      <div>
        <h4 className="font-medium mb-4">Configuración de reservas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tax_rate">IVA (%)</Label>
            <Input
              id="tax_rate"
              type="number"
              value={formData.tax_rate}
              onChange={(e) => setFormData({ ...formData, tax_rate: parseInt(e.target.value) || 0 })}
              min={0}
              max={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="min_days">Días mínimos de alquiler</Label>
            <Input
              id="min_days"
              type="number"
              value={formData.min_rental_days}
              onChange={(e) => setFormData({ ...formData, min_rental_days: parseInt(e.target.value) || 1 })}
              min={1}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max_days">Días máximos de alquiler</Label>
            <Input
              id="max_days"
              type="number"
              value={formData.max_rental_days}
              onChange={(e) => setFormData({ ...formData, max_rental_days: parseInt(e.target.value) || 30 })}
              min={1}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="advance">Días de antelación máxima</Label>
            <Input
              id="advance"
              type="number"
              value={formData.advance_booking_days}
              onChange={(e) => setFormData({ ...formData, advance_booking_days: parseInt(e.target.value) || 365 })}
              min={1}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cancel">Horas para cancelación gratuita</Label>
            <Input
              id="cancel"
              type="number"
              value={formData.cancellation_hours}
              onChange={(e) => setFormData({ ...formData, cancellation_hours: parseInt(e.target.value) || 24 })}
              min={0}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deposit">Fianza a cobrar (%)</Label>
            <Input
              id="deposit"
              type="number"
              value={formData.deposit_percentage}
              onChange={(e) => setFormData({ ...formData, deposit_percentage: parseInt(e.target.value) || 100 })}
              min={0}
              max={100}
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Automatización */}
      <div>
        <h4 className="font-medium mb-4">Automatización</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Confirmar reservas automáticamente</Label>
              <p className="text-sm text-muted-foreground">
                Las reservas se confirman sin revisión manual
              </p>
            </div>
            <Switch
              checked={formData.auto_confirm_bookings}
              onCheckedChange={(checked) => setFormData({ ...formData, auto_confirm_bookings: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Requerir pago por adelantado</Label>
              <p className="text-sm text-muted-foreground">
                El cliente debe pagar antes de confirmar la reserva
              </p>
            </div>
            <Switch
              checked={formData.require_payment_upfront}
              onCheckedChange={(checked) => setFormData({ ...formData, require_payment_upfront: checked })}
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Notificaciones */}
      <div>
        <h4 className="font-medium mb-4">Notificaciones por email</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enviar email de confirmación</Label>
              <p className="text-sm text-muted-foreground">
                El cliente recibe un email al confirmar su reserva
              </p>
            </div>
            <Switch
              checked={formData.send_confirmation_email}
              onCheckedChange={(checked) => setFormData({ ...formData, send_confirmation_email: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Enviar recordatorio de reserva</Label>
              <p className="text-sm text-muted-foreground">
                Recordatorio antes de la fecha de recogida
              </p>
            </div>
            <Switch
              checked={formData.send_reminder_email}
              onCheckedChange={(checked) => setFormData({ ...formData, send_reminder_email: checked })}
            />
          </div>
          
          {formData.send_reminder_email && (
            <div className="space-y-2 ml-8">
              <Label htmlFor="reminder_hours">Horas antes del recordatorio</Label>
              <Input
                id="reminder_hours"
                type="number"
                value={formData.reminder_hours_before}
                onChange={(e) => setFormData({ ...formData, reminder_hours_before: parseInt(e.target.value) || 24 })}
                min={1}
                className="w-32"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar configuración
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Sección: Plantillas de email
function EmailTemplatesSection() {
  const { data: templates, isLoading } = useEmailTemplates();
  const updateMutation = useUpdateEmailTemplate();
  
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editForm, setEditForm] = useState({ subject: '', body: '' });
  
  const openEdit = (template: any) => {
    setEditingTemplate(template);
    setEditForm({
      subject: template.subject,
      body: template.body,
    });
  };
  
  const handleSave = async () => {
    if (editingTemplate) {
      await updateMutation.mutateAsync({
        templateId: editingTemplate.id,
        updates: editForm,
      });
      setEditingTemplate(null);
    }
  };
  
  const handleToggleActive = async (template: any) => {
    await updateMutation.mutateAsync({
      templateId: template.id,
      updates: { is_active: !template.is_active },
    });
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }
  
  const templateTypeLabels: Record<string, string> = {
    booking_confirmation: 'Confirmación de reserva',
    booking_reminder: 'Recordatorio de reserva',
    booking_completed: 'Reserva completada',
    booking_cancelled: 'Reserva cancelada',
  };
  
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Usa variables como {'{{customer_name}}'}, {'{{booking_number}}'}, {'{{pickup_date}}'} que se reemplazarán automáticamente.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        {templates?.map((template: any) => (
          <Card key={template.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">
                      {templateTypeLabels[template.template_type] || template.name}
                    </h4>
                    <Badge variant={template.is_active ? 'default' : 'secondary'} className={template.is_active ? 'bg-green-500' : ''}>
                      {template.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Asunto: {template.subject}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={template.is_active}
                    onCheckedChange={() => handleToggleActive(template)}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEdit(template)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar plantilla</DialogTitle>
            <DialogDescription>
              {templateTypeLabels[editingTemplate?.template_type] || editingTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                value={editForm.subject}
                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="body">Contenido</Label>
              <Textarea
                id="body"
                value={editForm.body}
                onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                rows={12}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Variables disponibles:</p>
              <p>{'{{customer_name}}'}, {'{{booking_number}}'}, {'{{vehicle_group}}'}, {'{{pickup_date}}'}, {'{{pickup_time}}'}, {'{{pickup_location}}'}, {'{{return_date}}'}, {'{{return_time}}'}, {'{{return_location}}'}, {'{{total_price}}'}</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Guardando...' : 'Guardar plantilla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Página principal de configuración
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona la configuración de tu empresa y el sistema
        </p>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Empresa</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Sistema</span>
          </TabsTrigger>
          <TabsTrigger value="emails" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Emails</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Datos de la empresa</CardTitle>
              <CardDescription>
                Información básica y datos fiscales de tu empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanySection />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de usuarios</CardTitle>
              <CardDescription>
                Administra los usuarios que tienen acceso al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersSection />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del sistema</CardTitle>
              <CardDescription>
                Ajustes generales, reservas y automatizaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemSettingsSection />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de email</CardTitle>
              <CardDescription>
                Personaliza los emails que se envían a tus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailTemplatesSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
