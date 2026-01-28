import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Car, 
  Truck, 
  MapPin, 
  Calendar, 
  Clock,
  Search,
  Plus,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocations } from '@/hooks/useLocations';
import { AVAILABLE_HOURS } from '@/lib/constants';

const bookingSchema = z.object({
  vehicleType: z.enum(['car', 'van']),
  pickupLocationId: z.string().min(1, 'Selecciona una ubicación'),
  returnLocationId: z.string().min(1, 'Selecciona una ubicación'),
  pickupDate: z.date({ required_error: 'Selecciona fecha de recogida' }),
  pickupTime: z.string().min(1, 'Selecciona hora'),
  returnDate: z.date({ required_error: 'Selecciona fecha de devolución' }),
  returnTime: z.string().min(1, 'Selecciona hora'),
}).refine((data) => data.returnDate >= data.pickupDate, {
  message: 'La fecha de devolución debe ser igual o posterior a la de recogida',
  path: ['returnDate'],
});

type BookingForm = z.infer<typeof bookingSchema>;

export function BookingSearchForm() {
  const navigate = useNavigate();
  const [showDifferentReturn, setShowDifferentReturn] = useState(false);
  const { data: locations, isLoading: locationsLoading } = useLocations();
  
  const today = new Date();
  const defaultPickupDate = addDays(today, 1);
  const defaultReturnDate = addDays(today, 4);
  
  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      vehicleType: 'car',
      pickupLocationId: '',
      returnLocationId: '',
      pickupDate: defaultPickupDate,
      pickupTime: '10:00',
      returnDate: defaultReturnDate,
      returnTime: '10:00',
    },
  });
  
  const vehicleType = watch('vehicleType');
  const pickupLocationId = watch('pickupLocationId');
  const pickupDate = watch('pickupDate');
  const returnDate = watch('returnDate');
  const pickupTime = watch('pickupTime');
  const returnTime = watch('returnTime');
  
  // Sincronizar ubicación de devolución si no es diferente
  const handlePickupLocationChange = (value: string) => {
    setValue('pickupLocationId', value);
    if (!showDifferentReturn) {
      setValue('returnLocationId', value);
    }
  };
  
  const onSubmit = (data: BookingForm) => {
    const params = new URLSearchParams({
      tipo: data.vehicleType,
      recogida: data.pickupLocationId,
      devolucion: data.returnLocationId,
      fecha_recogida: format(data.pickupDate, 'yyyy-MM-dd'),
      hora_recogida: data.pickupTime,
      fecha_devolucion: format(data.returnDate, 'yyyy-MM-dd'),
      hora_devolucion: data.returnTime,
    });
    
    navigate(`/vehiculos?${params.toString()}`);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-2xl p-4 lg:p-6">
      {/* Vehicle Type Tabs */}
      <Tabs 
        value={vehicleType} 
        onValueChange={(v) => setValue('vehicleType', v as 'car' | 'van')}
        className="mb-6"
      >
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="car" className="gap-2">
            <Car className="h-4 w-4" />
            Coches
          </TabsTrigger>
          <TabsTrigger value="van" className="gap-2">
            <Truck className="h-4 w-4" />
            Furgonetas
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Pickup Location */}
          <div className="lg:col-span-3">
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Recogida
            </Label>
            <Select
              value={pickupLocationId}
              onValueChange={handlePickupLocationChange}
              disabled={locationsLoading}
            >
              <SelectTrigger className="h-12">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <SelectValue placeholder="Selecciona ubicación" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {locations?.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.pickupLocationId && (
              <p className="text-xs text-destructive mt-1">{errors.pickupLocationId.message}</p>
            )}
          </div>
          
          {/* Different Return Toggle / Return Location */}
          <div className="lg:col-span-2">
            {!showDifferentReturn ? (
              <div className="h-full flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDifferentReturn(true)}
                  className="text-primary hover:text-primary/90 h-12 w-full justify-start"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span className="text-sm">Otro lugar de devolución</span>
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs text-muted-foreground">Devolución</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDifferentReturn(false);
                      setValue('returnLocationId', pickupLocationId);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <Select
                  value={watch('returnLocationId')}
                  onValueChange={(v) => setValue('returnLocationId', v)}
                  disabled={locationsLoading}
                >
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-secondary shrink-0" />
                      <SelectValue placeholder="Ubicación" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {locations?.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          {/* Pickup Date */}
          <div className="lg:col-span-2">
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Fecha recogida
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'h-12 w-full justify-start text-left font-normal',
                    !pickupDate && 'text-muted-foreground'
                  )}
                >
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  {pickupDate ? (
                    format(pickupDate, 'dd MMM', { locale: es })
                  ) : (
                    'Seleccionar'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={pickupDate}
                  onSelect={(date) => {
                    if (date) {
                      setValue('pickupDate', date);
                      if (returnDate && date > returnDate) {
                        setValue('returnDate', addDays(date, 1));
                      }
                    }
                  }}
                  disabled={(date) => date < today}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Pickup Time */}
          <div className="lg:col-span-1">
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Hora
            </Label>
            <Select
              value={pickupTime}
              onValueChange={(v) => setValue('pickupTime', v)}
            >
              <SelectTrigger className="h-12">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_HOURS.map((hour) => (
                  <SelectItem key={hour} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Return Date */}
          <div className="lg:col-span-2">
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Fecha devolución
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'h-12 w-full justify-start text-left font-normal',
                    !returnDate && 'text-muted-foreground'
                  )}
                >
                  <Calendar className="h-4 w-4 mr-2 text-secondary" />
                  {returnDate ? (
                    format(returnDate, 'dd MMM', { locale: es })
                  ) : (
                    'Seleccionar'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={returnDate}
                  onSelect={(date) => date && setValue('returnDate', date)}
                  disabled={(date) => date < (pickupDate || today)}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            {errors.returnDate && (
              <p className="text-xs text-destructive mt-1">{errors.returnDate.message}</p>
            )}
          </div>
          
          {/* Return Time */}
          <div className="lg:col-span-1">
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Hora
            </Label>
            <Select
              value={returnTime}
              onValueChange={(v) => setValue('returnTime', v)}
            >
              <SelectTrigger className="h-12">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_HOURS.map((hour) => (
                  <SelectItem key={hour} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Search Button */}
          <div className="lg:col-span-1 flex items-end">
            <Button 
              type="submit" 
              className="h-12 w-full bg-secondary hover:bg-secondary/90 text-white font-semibold"
            >
              <Search className="h-5 w-5 lg:mr-2" />
              <span className="hidden lg:inline">Buscar</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
