import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, subYears, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ArrowLeft, 
  ArrowRight, 
  User,
  Car,
  CreditCard,
  FileText,
  AlertCircle,
  Check,
  UserPlus,
  X,
  MapPin,
  Calendar as CalendarIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBookingStore } from '@/stores/bookingStore';
import { useAuth } from '@/hooks/useAuth';
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants';

// Schema de validación para el conductor principal
const customerSchema = z.object({
  // Datos personales
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(9, 'Teléfono inválido').regex(/^[+]?[\d\s-]+$/, 'Formato de teléfono inválido'),
  
  // Documento
  documentType: z.enum(['dni', 'passport', 'nie']),
  documentNumber: z.string().min(5, 'Número de documento inválido'),
  
  // Fecha de nacimiento
  birthDate: z.date({
    required_error: 'La fecha de nacimiento es obligatoria',
  }).refine(
    (date) => isBefore(date, subYears(new Date(), 21)),
    'Debes tener al menos 21 años para alquilar un vehículo'
  ),
  
  // Dirección
  address: z.string().min(5, 'Dirección demasiado corta'),
  city: z.string().min(2, 'Ciudad inválida'),
  postalCode: z.string().min(4, 'Código postal inválido'),
  country: z.string().min(2, 'País inválido'),
  
  // Carnet de conducir
  licenseNumber: z.string().min(5, 'Número de carnet inválido'),
  licenseIssueDate: z.date({
    required_error: 'La fecha de expedición es obligatoria',
  }).refine(
    (date) => isBefore(date, subYears(new Date(), 1)),
    'El carnet debe tener al menos 1 año de antigüedad'
  ),
  licenseCountry: z.string().min(2, 'País de expedición inválido'),
  
  // Notas
  notes: z.string().optional(),
  
  // Términos
  acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos y condiciones'),
  acceptPrivacy: z.boolean().refine(val => val === true, 'Debes aceptar la política de privacidad'),
  acceptMarketing: z.boolean().optional(),
  createAccount: z.boolean().optional(),
});

// Schema para conductor adicional
const additionalDriverSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres'),
  documentType: z.enum(['dni', 'passport', 'nie']),
  documentNumber: z.string().min(5, 'Número de documento inválido'),
  birthDate: z.date({
    required_error: 'La fecha de nacimiento es obligatoria',
  }),
  licenseNumber: z.string().min(5, 'Número de carnet inválido'),
  licenseIssueDate: z.date({
    required_error: 'La fecha de expedición es obligatoria',
  }),
  licenseCountry: z.string().min(2, 'País de expedición inválido'),
});

type CustomerForm = z.infer<typeof customerSchema>;
type AdditionalDriverForm = z.infer<typeof additionalDriverSchema>;

// Componente de progreso
function BookingProgress({ currentStep }: { currentStep: number }) {
  const steps = [
    { number: 1, label: 'Vehículo' },
    { number: 2, label: 'Extras' },
    { number: 3, label: 'Datos' },
    { number: 4, label: 'Pago' },
  ];
  
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className={cn(
            'flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium transition-colors',
            step.number < currentStep
              ? 'bg-secondary text-white'
              : step.number === currentStep
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground'
          )}>
            {step.number < currentStep ? (
              <Check className="h-4 w-4" />
            ) : (
              step.number
            )}
          </div>
          <span className={cn(
            'ml-2 text-sm hidden sm:block',
            step.number === currentStep ? 'font-medium' : 'text-muted-foreground'
          )}>
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <div className={cn(
              'w-8 sm:w-12 h-0.5 mx-2',
              step.number < currentStep ? 'bg-secondary' : 'bg-muted'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

// Componente de resumen lateral
function BookingSummary() {
  const { 
    searchParams, 
    selectedVehicle, 
    selectedExtras,
    pickupLocation,
    returnLocation,
    getTotalDays,
    getExtrasTotal,
    getSubtotal,
    getTaxAmount,
    getTotal,
  } = useBookingStore();
  
  const totalDays = getTotalDays();
  const extrasTotal = getExtrasTotal();
  const subtotal = getSubtotal();
  const tax = getTaxAmount();
  const total = getTotal();
  
  const locationSurcharge = pickupLocation && returnLocation && pickupLocation.id !== returnLocation.id
    ? returnLocation.different_return_fee || 0
    : 0;
  
  if (!selectedVehicle || !searchParams) return null;
  
  return (
    <Card className="sticky top-36">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Tu reserva</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vehículo */}
        <div className="flex items-center gap-3 pb-3 border-b">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Car className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">{selectedVehicle.vehicleGroup.name}</p>
            <p className="text-sm text-muted-foreground">o similar</p>
          </div>
        </div>
        
        {/* Ubicaciones y fechas */}
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Recogida</p>
              <p className="text-muted-foreground">{pickupLocation?.name}</p>
              <p className="text-muted-foreground">{searchParams.pickupDate} {searchParams.pickupTime}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Devolución</p>
              <p className="text-muted-foreground">{returnLocation?.name}</p>
              <p className="text-muted-foreground">{searchParams.returnDate} {searchParams.returnTime}</p>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Desglose de precios */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Alquiler ({totalDays} días)</span>
            <span>{formatPrice(selectedVehicle.totalPrice)}</span>
          </div>
          
          {selectedExtras.length > 0 && (
            <div className="flex justify-between">
              <span>Extras ({selectedExtras.length})</span>
              <span>{formatPrice(extrasTotal)}</span>
            </div>
          )}
          
          {locationSurcharge > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Devolución diferente</span>
              <span>{formatPrice(locationSurcharge)}</span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>IVA (21%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
        </div>
        
        <Separator />
        
        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="font-semibold text-lg">Total</span>
          <span className="font-bold text-2xl text-primary">{formatPrice(total)}</span>
        </div>
        
        {/* Fianza */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Fianza requerida: <strong>{formatPrice(selectedVehicle.vehicleGroup.deposit_amount)}</strong>
            <br />
            Se bloqueará en tu tarjeta al recoger el vehículo.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// Formulario de conductor adicional
function AdditionalDriverForm({
  form,
  onRemove,
}: {
  form: ReturnType<typeof useForm<AdditionalDriverForm>>;
  onRemove: () => void;
}) {
  const { register, watch, setValue, formState: { errors } } = form;
  const birthDate = watch('birthDate');
  const licenseIssueDate = watch('licenseIssueDate');
  const documentType = watch('documentType');
  
  return (
    <Card className="border-secondary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-secondary" />
            Conductor adicional
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Quitar
          </Button>
        </div>
        <CardDescription>
          Datos del segundo conductor que aparecerá en el contrato
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="add-firstName">Nombre *</Label>
            <Input
              id="add-firstName"
              {...register('firstName')}
              placeholder="María"
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="add-lastName">Apellidos *</Label>
            <Input
              id="add-lastName"
              {...register('lastName')}
              placeholder="García López"
            />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Tipo documento *</Label>
            <Select
              value={documentType}
              onValueChange={(v) => setValue('documentType', v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="add-documentNumber">Número documento *</Label>
            <Input
              id="add-documentNumber"
              {...register('documentNumber')}
              placeholder="12345678A"
            />
            {errors.documentNumber && (
              <p className="text-xs text-destructive">{errors.documentNumber.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Fecha nacimiento *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !birthDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthDate ? format(birthDate, 'dd/MM/yyyy') : 'Seleccionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={birthDate}
                  onSelect={(date) => setValue('birthDate', date as Date)}
                  defaultMonth={subYears(new Date(), 30)}
                  disabled={(date) => 
                    isAfter(date, subYears(new Date(), 18)) || 
                    isBefore(date, subYears(new Date(), 100))
                  }
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            {errors.birthDate && (
              <p className="text-xs text-destructive">{errors.birthDate.message}</p>
            )}
          </div>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="add-licenseNumber">Nº carnet conducir *</Label>
            <Input
              id="add-licenseNumber"
              {...register('licenseNumber')}
              placeholder="12345678"
            />
            {errors.licenseNumber && (
              <p className="text-xs text-destructive">{errors.licenseNumber.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Fecha expedición *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !licenseIssueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {licenseIssueDate ? format(licenseIssueDate, 'dd/MM/yyyy') : 'Seleccionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={licenseIssueDate}
                  onSelect={(date) => setValue('licenseIssueDate', date as Date)}
                  disabled={(date) => isAfter(date, new Date())}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            {errors.licenseIssueDate && (
              <p className="text-xs text-destructive">{errors.licenseIssueDate.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="add-licenseCountry">País expedición *</Label>
            <Input
              id="add-licenseCountry"
              {...register('licenseCountry')}
              defaultValue="España"
            />
            {errors.licenseCountry && (
              <p className="text-xs text-destructive">{errors.licenseCountry.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Página principal
export default function CustomerDataPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { 
    selectedVehicle, 
    selectedExtras,
    customerData,
    additionalDriver,
    setCustomerData,
    setAdditionalDriver,
    setCurrentStep,
  } = useBookingStore();
  
  const [showAdditionalDriver, setShowAdditionalDriver] = useState(!!additionalDriver);
  
  // Verificar si hay conductor adicional en los extras
  const hasAdditionalDriverExtra = selectedExtras.some(
    e => e.extra_name.toLowerCase().includes('conductor')
  );
  
  // Form principal
  const mainForm = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: customerData?.firstName || '',
      lastName: customerData?.lastName || '',
      email: customerData?.email || user?.email || '',
      phone: customerData?.phone || '',
      documentType: customerData?.documentType || 'dni',
      documentNumber: customerData?.documentNumber || '',
      birthDate: customerData?.birthDate ? new Date(customerData.birthDate) : undefined,
      address: customerData?.address || '',
      city: customerData?.city || '',
      postalCode: customerData?.postalCode || '',
      country: customerData?.country || 'España',
      licenseNumber: customerData?.licenseNumber || '',
      licenseIssueDate: customerData?.licenseIssueDate ? new Date(customerData.licenseIssueDate) : undefined,
      licenseCountry: customerData?.licenseCountry || 'España',
      notes: customerData?.notes || '',
      acceptTerms: false,
      acceptPrivacy: false,
      acceptMarketing: false,
      createAccount: !isAuthenticated,
    },
    mode: 'onChange',
  });
  
  // Form conductor adicional
  const additionalDriverFormHook = useForm<AdditionalDriverForm>({
    resolver: zodResolver(additionalDriverSchema),
    defaultValues: {
      firstName: additionalDriver?.firstName || '',
      lastName: additionalDriver?.lastName || '',
      documentType: additionalDriver?.documentType || 'dni',
      documentNumber: additionalDriver?.documentNumber || '',
      birthDate: additionalDriver?.birthDate ? new Date(additionalDriver.birthDate) : undefined,
      licenseNumber: additionalDriver?.licenseNumber || '',
      licenseIssueDate: additionalDriver?.licenseIssueDate ? new Date(additionalDriver.licenseIssueDate) : undefined,
      licenseCountry: additionalDriver?.licenseCountry || 'España',
    },
  });
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = mainForm;
  
  // Watch para fechas y campos
  const birthDate = watch('birthDate');
  const licenseIssueDate = watch('licenseIssueDate');
  const documentType = watch('documentType');
  const acceptTerms = watch('acceptTerms');
  const acceptPrivacy = watch('acceptPrivacy');
  
  // Redirigir si no hay vehículo seleccionado
  useEffect(() => {
    if (!selectedVehicle) {
      navigate('/vehiculos');
    } else {
      setCurrentStep(3);
    }
  }, [selectedVehicle, navigate, setCurrentStep]);
  
  // Mostrar automáticamente el formulario de conductor adicional si está en los extras
  useEffect(() => {
    if (hasAdditionalDriverExtra && !showAdditionalDriver) {
      setShowAdditionalDriver(true);
    }
  }, [hasAdditionalDriverExtra]);
  
  // Submit
  const onSubmit = async (data: CustomerForm) => {
    // Validar conductor adicional si está visible
    if (showAdditionalDriver && hasAdditionalDriverExtra) {
      const isAdditionalValid = await additionalDriverFormHook.trigger();
      if (!isAdditionalValid) {
        return;
      }
    }
    
    // Guardar datos del cliente
    setCustomerData({
      ...data,
      birthDate: data.birthDate.toISOString(),
      licenseIssueDate: data.licenseIssueDate.toISOString(),
    });
    
    // Guardar conductor adicional si aplica
    if (showAdditionalDriver && hasAdditionalDriverExtra) {
      const additionalData = additionalDriverFormHook.getValues();
      setAdditionalDriver({
        ...additionalData,
        birthDate: additionalData.birthDate?.toISOString(),
        licenseIssueDate: additionalData.licenseIssueDate?.toISOString(),
      });
    } else {
      setAdditionalDriver(null);
    }
    
    navigate('/checkout');
  };
  
  if (!selectedVehicle) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        {/* Progreso */}
        <BookingProgress currentStep={3} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario principal */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <Link to="/extras">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a extras
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Datos del conductor principal</h1>
              <p className="text-muted-foreground mt-1">
                Introduce los datos del conductor principal. Estos datos aparecerán en el contrato de alquiler.
              </p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Alerta si está autenticado */}
              {isAuthenticated && (
                <Alert className="bg-primary/5 border-primary/20">
                  <User className="h-4 w-4 text-primary" />
                  <AlertDescription>
                    Estás conectado como <strong>{user?.email}</strong>. 
                    Los datos de la reserva se guardarán en tu cuenta.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Datos personales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Datos personales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre *</Label>
                      <Input
                        id="firstName"
                        {...register('firstName')}
                        placeholder="Juan"
                        className={errors.firstName ? 'border-destructive' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-xs text-destructive">{errors.firstName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellidos *</Label>
                      <Input
                        id="lastName"
                        {...register('lastName')}
                        placeholder="García López"
                        className={errors.lastName ? 'border-destructive' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-xs text-destructive">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="tu@email.com"
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...register('phone')}
                        placeholder="+34 600 000 000"
                        className={errors.phone ? 'border-destructive' : ''}
                      />
                      {errors.phone && (
                        <p className="text-xs text-destructive">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo documento *</Label>
                      <Select
                        value={documentType}
                        onValueChange={(v) => setValue('documentType', v as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="documentNumber">Número documento *</Label>
                      <Input
                        id="documentNumber"
                        {...register('documentNumber')}
                        placeholder="12345678A"
                        className={errors.documentNumber ? 'border-destructive' : ''}
                      />
                      {errors.documentNumber && (
                        <p className="text-xs text-destructive">{errors.documentNumber.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Fecha nacimiento *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !birthDate && 'text-muted-foreground',
                              errors.birthDate && 'border-destructive'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {birthDate ? format(birthDate, 'dd/MM/yyyy') : 'Seleccionar'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={birthDate}
                            onSelect={(date) => setValue('birthDate', date as Date)}
                            defaultMonth={subYears(new Date(), 30)}
                            disabled={(date) => 
                              isAfter(date, subYears(new Date(), 18)) || 
                              isBefore(date, subYears(new Date(), 100))
                            }
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.birthDate && (
                        <p className="text-xs text-destructive">{errors.birthDate.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Dirección */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Dirección
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección completa *</Label>
                    <Input
                      id="address"
                      {...register('address')}
                      placeholder="Calle Principal 123, 2ºA"
                      className={errors.address ? 'border-destructive' : ''}
                    />
                    {errors.address && (
                      <p className="text-xs text-destructive">{errors.address.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad *</Label>
                      <Input
                        id="city"
                        {...register('city')}
                        placeholder="Madrid"
                        className={errors.city ? 'border-destructive' : ''}
                      />
                      {errors.city && (
                        <p className="text-xs text-destructive">{errors.city.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Código postal *</Label>
                      <Input
                        id="postalCode"
                        {...register('postalCode')}
                        placeholder="28001"
                        className={errors.postalCode ? 'border-destructive' : ''}
                      />
                      {errors.postalCode && (
                        <p className="text-xs text-destructive">{errors.postalCode.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="country">País *</Label>
                      <Input
                        id="country"
                        {...register('country')}
                        placeholder="España"
                        className={errors.country ? 'border-destructive' : ''}
                      />
                      {errors.country && (
                        <p className="text-xs text-destructive">{errors.country.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Carnet de conducir */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Carnet de conducir
                  </CardTitle>
                  <CardDescription>
                    El conductor debe presentar el carnet original al recoger el vehículo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">Número de carnet *</Label>
                      <Input
                        id="licenseNumber"
                        {...register('licenseNumber')}
                        placeholder="12345678"
                        className={errors.licenseNumber ? 'border-destructive' : ''}
                      />
                      {errors.licenseNumber && (
                        <p className="text-xs text-destructive">{errors.licenseNumber.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Fecha de expedición *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !licenseIssueDate && 'text-muted-foreground',
                              errors.licenseIssueDate && 'border-destructive'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {licenseIssueDate ? format(licenseIssueDate, 'dd/MM/yyyy') : 'Seleccionar'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={licenseIssueDate}
                            onSelect={(date) => setValue('licenseIssueDate', date as Date)}
                            disabled={(date) => isAfter(date, new Date())}
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.licenseIssueDate && (
                        <p className="text-xs text-destructive">{errors.licenseIssueDate.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="licenseCountry">País de expedición *</Label>
                      <Input
                        id="licenseCountry"
                        {...register('licenseCountry')}
                        placeholder="España"
                        className={errors.licenseCountry ? 'border-destructive' : ''}
                      />
                      {errors.licenseCountry && (
                        <p className="text-xs text-destructive">{errors.licenseCountry.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      El carnet debe tener al menos <strong>1 año de antigüedad</strong> y el conductor debe tener al menos <strong>21 años</strong>.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
              
              {/* Conductor adicional */}
              {hasAdditionalDriverExtra && (
                <div className="space-y-4">
                  {showAdditionalDriver ? (
                    <AdditionalDriverForm
                      form={additionalDriverFormHook}
                      onRemove={() => {
                        setShowAdditionalDriver(false);
                        additionalDriverFormHook.reset();
                      }}
                    />
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="py-6 text-center">
                        <UserPlus className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <h3 className="font-medium mb-1">Has seleccionado conductor adicional</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Añade los datos del segundo conductor
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAdditionalDriver(true)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Añadir datos del conductor
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
              
              {/* Notas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Notas adicionales
                  </CardTitle>
                  <CardDescription>
                    Opcional - Añade cualquier información adicional relevante
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    {...register('notes')}
                    placeholder="Ej: Llegada en vuelo IB1234, necesito silla para niño de 2 años..."
                    rows={3}
                  />
                </CardContent>
              </Card>
              
              {/* Términos y condiciones */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Términos y condiciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="acceptTerms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setValue('acceptTerms', checked as boolean)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="acceptTerms" className="cursor-pointer font-normal">
                        Acepto los{' '}
                        <Link to="/terminos" className="text-primary hover:underline" target="_blank">
                          términos y condiciones
                        </Link>{' '}
                        del alquiler *
                      </Label>
                      {errors.acceptTerms && (
                        <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="acceptPrivacy"
                      checked={acceptPrivacy}
                      onCheckedChange={(checked) => setValue('acceptPrivacy', checked as boolean)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="acceptPrivacy" className="cursor-pointer font-normal">
                        He leído y acepto la{' '}
                        <Link to="/privacidad" className="text-primary hover:underline" target="_blank">
                          política de privacidad
                        </Link>{' '}
                        *
                      </Label>
                      {errors.acceptPrivacy && (
                        <p className="text-xs text-destructive">{errors.acceptPrivacy.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="acceptMarketing"
                      {...register('acceptMarketing')}
                    />
                    <Label htmlFor="acceptMarketing" className="cursor-pointer font-normal">
                      Acepto recibir ofertas y promociones por email
                    </Label>
                  </div>
                  
                  {!isAuthenticated && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="createAccount"
                          {...register('createAccount')}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="createAccount" className="cursor-pointer font-normal">
                            Crear una cuenta para futuras reservas
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Podrás gestionar tus reservas y acceder a ofertas exclusivas
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              {/* Botones de navegación */}
              <div className="flex justify-between pt-4">
                <Link to="/extras">
                  <Button type="button" variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                  </Button>
                </Link>
                <Button 
                  type="submit"
                  size="lg" 
                  className="bg-secondary hover:bg-secondary/90"
                  disabled={!acceptTerms || !acceptPrivacy}
                >
                  Continuar al pago
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </form>
          </div>
          
          {/* Sidebar - Resumen */}
          <div className="hidden lg:block">
            <BookingSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
