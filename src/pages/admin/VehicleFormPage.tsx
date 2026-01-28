import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Save,
  Car,
  Fuel,
  Settings2,
  MapPin,
  Gauge,
  Calendar,
  FileText,
  ImagePlus,
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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useVehicle, useCreateVehicle, useUpdateVehicle } from '@/hooks/useVehicles';
import { useVehicleGroupsAdmin } from '@/hooks/useVehicleGroups';
import { useLocations } from '@/hooks/useLocations';
import { 
  FUEL_TYPE_LABELS, 
  TRANSMISSION_LABELS,
  VEHICLE_STATUS_LABELS,
  OWNERSHIP_TYPE_LABELS
} from '@/lib/constants';

// Schema de validación
const vehicleSchema = z.object({
  brand: z.string().min(1, 'La marca es obligatoria'),
  model: z.string().min(1, 'El modelo es obligatorio'),
  year: z.number().min(1990).max(new Date().getFullYear() + 1),
  plate: z.string().min(4, 'Matrícula inválida').regex(/^[A-Z0-9\s-]+$/i, 'Formato de matrícula inválido'),
  vin: z.string().optional(),
  color: z.string().optional(),
  vehicle_group_id: z.string().min(1, 'Selecciona un grupo'),
  current_location_id: z.string().min(1, 'Selecciona una ubicación'),
  fuel_type: z.enum(['gasoline', 'diesel', 'hybrid', 'electric', 'lpg']),
  transmission: z.enum(['manual', 'automatic']),
  seats: z.number().min(1).max(15),
  doors: z.number().min(2).max(6),
  current_mileage: z.number().min(0),
  ownership_type: z.enum(['owned', 'renting', 'leasing']),
  status: z.enum(['available', 'rented', 'maintenance', 'reserved', 'unavailable']),
  is_active: z.boolean(),
  features: z.array(z.string()).optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
});

type VehicleForm = z.infer<typeof vehicleSchema>;

// Lista de características disponibles
const availableFeatures = [
  { id: 'air_conditioning', label: 'Aire acondicionado' },
  { id: 'bluetooth', label: 'Bluetooth' },
  { id: 'gps', label: 'GPS integrado' },
  { id: 'usb', label: 'Puerto USB' },
  { id: 'cruise_control', label: 'Control de crucero' },
  { id: 'parking_sensors', label: 'Sensores de aparcamiento' },
  { id: 'backup_camera', label: 'Cámara trasera' },
  { id: 'heated_seats', label: 'Asientos calefactados' },
  { id: 'leather_seats', label: 'Asientos de cuero' },
  { id: 'sunroof', label: 'Techo solar' },
  { id: 'android_auto', label: 'Android Auto' },
  { id: 'apple_carplay', label: 'Apple CarPlay' },
  { id: 'keyless_entry', label: 'Entrada sin llave' },
  { id: 'child_seat_anchor', label: 'Anclaje Isofix' },
];

export default function VehicleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const { data: vehicle, isLoading: vehicleLoading } = useVehicle(id || '');
  const { data: groups } = useVehicleGroupsAdmin();
  const { data: locations } = useLocations();
  
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<VehicleForm>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      plate: '',
      vin: '',
      color: '',
      vehicle_group_id: '',
      current_location_id: '',
      fuel_type: 'gasoline',
      transmission: 'manual',
      seats: 5,
      doors: 4,
      current_mileage: 0,
      ownership_type: 'owned',
      status: 'available',
      is_active: true,
      features: [],
      image_url: '',
      notes: '',
    },
  });
  
  // Cargar datos del vehículo si estamos editando
  useEffect(() => {
    if (vehicle && isEditing) {
      reset({
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        plate: vehicle.plate,
        vin: vehicle.vin || '',
        color: vehicle.color || '',
        vehicle_group_id: vehicle.vehicle_group_id || '',
        current_location_id: vehicle.current_location_id || '',
        fuel_type: vehicle.fuel_type,
        transmission: vehicle.transmission,
        seats: vehicle.seats,
        doors: vehicle.doors || 4,
        current_mileage: vehicle.current_mileage || 0,
        ownership_type: vehicle.ownership_type || 'owned',
        status: vehicle.status,
        is_active: vehicle.is_active,
        features: (vehicle.features as string[]) || [],
        image_url: vehicle.image_url || '',
        notes: vehicle.notes || '',
      });
    }
  }, [vehicle, isEditing, reset]);
  
  const watchedFeatures = watch('features') || [];
  const watchedStatus = watch('status');
  const watchedIsActive = watch('is_active');
  
  const toggleFeature = (featureId: string) => {
    const current = watchedFeatures;
    const updated = current.includes(featureId)
      ? current.filter(f => f !== featureId)
      : [...current, featureId];
    setValue('features', updated, { shouldDirty: true });
  };
  
  const onSubmit = async (data: VehicleForm) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: id!, updates: data });
      } else {
        await createMutation.mutateAsync(data);
      }
      navigate('/admin/flota/vehiculos');
    } catch (error) {
      // Error ya manejado en mutation
    }
  };
  
  const isLoading = vehicleLoading && isEditing;
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
              {isEditing ? 'Editar vehículo' : 'Nuevo vehículo'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? `Editando ${vehicle?.plate}` : 'Añade un nuevo vehículo a tu flota'}
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
                {isEditing ? 'Guardar cambios' : 'Crear vehículo'}
              </>
            )}
          </Button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  Información del vehículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Marca *</Label>
                    <Input
                      id="brand"
                      {...register('brand')}
                      placeholder="Ej: Seat"
                      className={errors.brand ? 'border-destructive' : ''}
                    />
                    {errors.brand && (
                      <p className="text-xs text-destructive">{errors.brand.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="model">Modelo *</Label>
                    <Input
                      id="model"
                      {...register('model')}
                      placeholder="Ej: Ibiza"
                      className={errors.model ? 'border-destructive' : ''}
                    />
                    {errors.model && (
                      <p className="text-xs text-destructive">{errors.model.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="year">Año *</Label>
                    <Input
                      id="year"
                      type="number"
                      {...register('year', { valueAsNumber: true })}
                      min={1990}
                      max={new Date().getFullYear() + 1}
                      className={errors.year ? 'border-destructive' : ''}
                    />
                    {errors.year && (
                      <p className="text-xs text-destructive">{errors.year.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plate">Matrícula *</Label>
                    <Input
                      id="plate"
                      {...register('plate')}
                      placeholder="Ej: 1234 ABC"
                      className={cn('uppercase', errors.plate ? 'border-destructive' : '')}
                    />
                    {errors.plate && (
                      <p className="text-xs text-destructive">{errors.plate.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vin">Número de bastidor (VIN)</Label>
                    <Input
                      id="vin"
                      {...register('vin')}
                      placeholder="Opcional"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      {...register('color')}
                      placeholder="Ej: Blanco"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Características técnicas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  Características técnicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Combustible *</Label>
                    <Select
                      value={watch('fuel_type')}
                      onValueChange={(v) => setValue('fuel_type', v as any, { shouldDirty: true })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(FUEL_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Transmisión *</Label>
                    <Select
                      value={watch('transmission')}
                      onValueChange={(v) => setValue('transmission', v as any, { shouldDirty: true })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TRANSMISSION_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="seats">Plazas *</Label>
                    <Input
                      id="seats"
                      type="number"
                      {...register('seats', { valueAsNumber: true })}
                      min={1}
                      max={15}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doors">Puertas *</Label>
                    <Input
                      id="doors"
                      type="number"
                      {...register('doors', { valueAsNumber: true })}
                      min={2}
                      max={6}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="mb-3 block">Equipamiento</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableFeatures.map((feature) => (
                      <div key={feature.id} className="flex items-center gap-2">
                        <Checkbox
                          id={feature.id}
                          checked={watchedFeatures.includes(feature.id)}
                          onCheckedChange={() => toggleFeature(feature.id)}
                        />
                        <Label 
                          htmlFor={feature.id} 
                          className="text-sm font-normal cursor-pointer"
                        >
                          {feature.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Kilometraje y propiedad */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  Kilometraje y propiedad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_mileage">Kilometraje actual *</Label>
                    <div className="relative">
                      <Input
                        id="current_mileage"
                        type="number"
                        {...register('current_mileage', { valueAsNumber: true })}
                        min={0}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        km
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tipo de propiedad *</Label>
                    <Select
                      value={watch('ownership_type')}
                      onValueChange={(v) => setValue('ownership_type', v as any, { shouldDirty: true })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(OWNERSHIP_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Imagen y notas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ImagePlus className="h-5 w-5 text-primary" />
                  Imagen y notas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image_url">URL de imagen</Label>
                  <Input
                    id="image_url"
                    {...register('image_url')}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    type="url"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL de una imagen del vehículo (opcional)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas internas</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Notas internas sobre el vehículo..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Grupo y ubicación */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Asignación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Grupo de vehículos *</Label>
                  <Select
                    value={watch('vehicle_group_id')}
                    onValueChange={(v) => setValue('vehicle_group_id', v, { shouldDirty: true })}
                  >
                    <SelectTrigger className={errors.vehicle_group_id ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecciona un grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups?.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} ({group.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vehicle_group_id && (
                    <p className="text-xs text-destructive">{errors.vehicle_group_id.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Ubicación actual *</Label>
                  <Select
                    value={watch('current_location_id')}
                    onValueChange={(v) => setValue('current_location_id', v, { shouldDirty: true })}
                  >
                    <SelectTrigger className={errors.current_location_id ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecciona ubicación" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations?.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.current_location_id && (
                    <p className="text-xs text-destructive">{errors.current_location_id.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Estado */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Estado del vehículo</Label>
                  <Select
                    value={watchedStatus}
                    onValueChange={(v) => setValue('status', v as any, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(VEHICLE_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_active">Vehículo activo</Label>
                    <p className="text-xs text-muted-foreground">
                      Los vehículos inactivos no aparecen en reservas
                    </p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={watchedIsActive}
                    onCheckedChange={(checked) => setValue('is_active', checked, { shouldDirty: true })}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Info */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Los campos marcados con * son obligatorios. 
                El vehículo debe estar asignado a un grupo para poder ser reservado.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </form>
    </div>
  );
}
