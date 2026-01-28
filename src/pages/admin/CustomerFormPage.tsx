import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Save,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useCustomer, useCreateCustomer, useUpdateCustomer } from '@/hooks/useCustomers';
import { DOCUMENT_TYPE_LABELS, COUNTRIES } from '@/lib/constants';

// Schema de validación
const customerSchema = z.object({
  first_name: z.string().min(1, 'El nombre es obligatorio'),
  last_name: z.string().min(1, 'El apellido es obligatorio'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  document_type: z.enum(['dni', 'passport', 'nie']).optional(),
  document_number: z.string().optional(),
  birth_date: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  license_number: z.string().optional(),
  license_issue_date: z.string().optional(),
  license_country: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerForm = z.infer<typeof customerSchema>;

export default function CustomerFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const { data: customer, isLoading: customerLoading } = useCustomer(id || '');
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      document_type: 'dni',
      document_number: '',
      birth_date: '',
      address: '',
      city: '',
      postal_code: '',
      country: 'España',
      license_number: '',
      license_issue_date: '',
      license_country: 'España',
      notes: '',
    },
  });
  
  // Cargar datos del cliente si estamos editando
  useEffect(() => {
    if (customer && isEditing) {
      reset({
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone || '',
        document_type: customer.document_type as any || 'dni',
        document_number: customer.document_number || '',
        birth_date: customer.birth_date || '',
        address: customer.address || '',
        city: customer.city || '',
        postal_code: customer.postal_code || '',
        country: customer.country || 'España',
        license_number: customer.license_number || '',
        license_issue_date: customer.license_issue_date || '',
        license_country: customer.license_country || 'España',
        notes: customer.notes || '',
      });
    }
  }, [customer, isEditing, reset]);
  
  const watchedBirthDate = watch('birth_date');
  const watchedLicenseDate = watch('license_issue_date');
  
  const onSubmit = async (data: CustomerForm) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ 
          id: id!, 
          updates: data 
        });
      } else {
        await createMutation.mutateAsync({
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          documentType: data.document_type,
          documentNumber: data.document_number,
          birthDate: data.birth_date,
          address: data.address,
          city: data.city,
          postalCode: data.postal_code,
          country: data.country,
          licenseNumber: data.license_number,
          licenseIssueDate: data.license_issue_date,
          licenseCountry: data.license_country,
          notes: data.notes,
        });
      }
      navigate('/admin/clientes');
    } catch (error) {
      // Error ya manejado en mutation
    }
  };
  
  const isLoading = customerLoading && isEditing;
  const isSaving = createMutation.isPending || updateMutation.isPending;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Editar cliente' : 'Nuevo cliente'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? `Editando ${customer?.first_name} ${customer?.last_name}` : 'Añade un nuevo cliente'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving || (!isDirty && isEditing)}
            className="bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Guardar cambios' : 'Crear cliente'}
              </>
            )}
          </Button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos personales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Datos personales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nombre *</Label>
                    <Input
                      id="first_name"
                      {...register('first_name')}
                      placeholder="Nombre"
                      className={errors.first_name ? 'border-destructive' : ''}
                    />
                    {errors.first_name && (
                      <p className="text-xs text-destructive">{errors.first_name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Apellidos *</Label>
                    <Input
                      id="last_name"
                      {...register('last_name')}
                      placeholder="Apellidos"
                      className={errors.last_name ? 'border-destructive' : ''}
                    />
                    {errors.last_name && (
                      <p className="text-xs text-destructive">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de documento</Label>
                    <Select
                      value={watch('document_type')}
                      onValueChange={(v) => setValue('document_type', v as any, { shouldDirty: true })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="document_number">Número de documento</Label>
                    <Input
                      id="document_number"
                      {...register('document_number')}
                      placeholder="12345678A"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Fecha de nacimiento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="h-4 w-4 mr-2" />
                          {watchedBirthDate 
                            ? format(new Date(watchedBirthDate), 'dd/MM/yyyy')
                            : 'Seleccionar'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={watchedBirthDate ? new Date(watchedBirthDate) : undefined}
                          onSelect={(date) => setValue('birth_date', date ? format(date, 'yyyy-MM-dd') : '', { shouldDirty: true })}
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Datos de contacto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Datos de contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="email@ejemplo.com"
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    {...register('address')}
                    placeholder="Calle, número, piso..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      {...register('city')}
                      placeholder="Madrid"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Código postal</Label>
                    <Input
                      id="postal_code"
                      {...register('postal_code')}
                      placeholder="28001"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>País</Label>
                    <Select
                      value={watch('country')}
                      onValueChange={(v) => setValue('country', v, { shouldDirty: true })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Carnet de conducir */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Carnet de conducir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="license_number">Número de carnet</Label>
                    <Input
                      id="license_number"
                      {...register('license_number')}
                      placeholder="12345678"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Fecha de expedición</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="h-4 w-4 mr-2" />
                          {watchedLicenseDate 
                            ? format(new Date(watchedLicenseDate), 'dd/MM/yyyy')
                            : 'Seleccionar'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={watchedLicenseDate ? new Date(watchedLicenseDate) : undefined}
                          onSelect={(date) => setValue('license_issue_date', date ? format(date, 'yyyy-MM-dd') : '', { shouldDirty: true })}
                          locale={es}
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>País de expedición</Label>
                    <Select
                      value={watch('license_country')}
                      onValueChange={(v) => setValue('license_country', v, { shouldDirty: true })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Notas internas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...register('notes')}
                  placeholder="Notas sobre el cliente..."
                  rows={5}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
