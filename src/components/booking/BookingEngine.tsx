import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  MapPin,
  Calendar as CalendarIcon,
  Search,
  Car,
  Truck,
  ArrowRight,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocations } from '@/hooks/useLocations';
import { useBookingStore } from '@/stores/bookingStore';

interface BookingEngineProps {
  variant?: 'light' | 'dark' | 'transparent';
  className?: string;
  showVehicleType?: boolean;
  compact?: boolean;
}

const TIMES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00',
];

export function BookingEngine({
  variant = 'light',
  className,
  showVehicleType = true,
  compact = false,
}: BookingEngineProps) {
  const navigate = useNavigate();
  const { data: locations } = useLocations();
  const { setSearchParams } = useBookingStore();

  const [vehicleType, setVehicleType] = useState<'car' | 'van'>('car');
  const [pickupLocation, setPickupLocation] = useState('');
  const [returnLocation, setReturnLocation] = useState('');
  const [sameReturn, setSameReturn] = useState(true);
  const [pickupDate, setPickupDate] = useState<Date>(() => addDays(new Date(), 1));
  const [returnDate, setReturnDate] = useState<Date>(() => addDays(new Date(), 4));
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnTime, setReturnTime] = useState('10:00');

  const isDark = variant === 'dark' || variant === 'transparent';

  const handleSearch = () => {
    if (!pickupLocation) return;

    setSearchParams({
      vehicleType,
      pickupLocationId: pickupLocation,
      returnLocationId: sameReturn ? pickupLocation : returnLocation,
      pickupDate: format(pickupDate, 'yyyy-MM-dd'),
      returnDate: format(returnDate, 'yyyy-MM-dd'),
      pickupTime,
      returnTime,
    });

    navigate('/vehiculos');
  };

  const cardBg = isDark ? 'bg-gray-900/95 backdrop-blur-md' : 'bg-white';
  const cardBorder = isDark ? 'border border-white/10' : 'border border-gray-200 shadow-lg';
  const labelClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const inputClass = isDark ? 'text-white' : 'text-foreground';
  const fieldBg = isDark ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200';
  const fieldBorder = isDark ? 'border-white/20' : 'border-gray-200';

  return (
    <div className={cn('w-full max-w-xl', className)}>
      <div
        className={cn(
          'rounded-xl overflow-hidden',
          cardBg,
          cardBorder
        )}
      >
        {/* Cabecera azul: "Elegir coche o furgoneta" + selector Coches/Furgonetas centrado */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3.5 bg-primary">
          <div className="flex items-center gap-3 min-w-0">
            <Car className="h-5 w-5 text-white shrink-0" />
            <span className="text-base font-bold text-white truncate">
              Elegir coche o furgoneta
            </span>
          </div>
          {showVehicleType && (
            <div className="flex justify-center">
              <div className="flex rounded-lg p-1 bg-white/25 gap-0.5 border border-white/30">
              <button
                type="button"
                onClick={() => setVehicleType('car')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                  vehicleType === 'car'
                    ? 'bg-[#00CC66] text-white shadow-md ring-2 ring-white/50'
                    : 'bg-white/40 text-[#002952] hover:bg-white/50'
                )}
              >
                <Car className="h-3.5 w-3.5" />
                Coches
              </button>
              <button
                type="button"
                onClick={() => setVehicleType('van')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                  vehicleType === 'van'
                    ? 'bg-[#00CC66] text-white shadow-md ring-2 ring-white/50'
                    : 'bg-white/40 text-[#002952] hover:bg-white/50'
                )}
              >
                <Truck className="h-3.5 w-3.5" />
                Furgonetas
              </button>
              </div>
            </div>
          )}
        </div>

        {/* Cuerpo blanco */}
        <div className="p-4 space-y-4">
          {/* LUGAR DE RECOGIDA */}
          <div>
            <label className={cn('text-[10px] font-semibold uppercase tracking-wider block mb-1.5', labelClass)}>
              Lugar de recogida
            </label>
            <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-2.5', fieldBg, fieldBorder)}>
              <MapPin className="h-4 w-4 shrink-0 text-secondary" />
              <Select value={pickupLocation} onValueChange={setPickupLocation}>
                <SelectTrigger
                  className={cn(
                    'border-0 p-0 h-auto min-h-0 shadow-none focus:ring-0 bg-transparent flex-1 text-sm',
                    inputClass
                  )}
                >
                  <SelectValue placeholder="Seleccionar recogida" />
                </SelectTrigger>
                <SelectContent>
                  {locations?.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-secondary" />
                        {loc.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Checkbox Devolver en otra ubicación: marcado = tic verde, desmarcado = blanco */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <button
              type="button"
              role="checkbox"
              aria-checked={!sameReturn}
              onClick={(e) => {
                e.preventDefault();
                setSameReturn((prev) => !prev);
              }}
              className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0',
                sameReturn
                  ? 'border-gray-400 bg-white'
                  : 'border-secondary bg-white ring-2 ring-secondary/30'
              )}
              aria-label={sameReturn ? 'Devolver en la misma ubicación' : 'Devolver en otra ubicación'}
            >
              {!sameReturn && <Check className="h-3.5 w-3.5 text-secondary stroke-[3]" />}
            </button>
            <span className={cn('text-xs', labelClass)}>
              Devolver en otra ubicación
            </span>
          </label>

          {/* Lugar de devolución: se muestra justo debajo del checkbox cuando está marcado */}
          {!sameReturn && (
            <div>
              <label className={cn('text-[10px] font-semibold uppercase tracking-wider block mb-1.5', labelClass)}>
                Lugar de devolución
              </label>
              <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-2.5', fieldBg, fieldBorder)}>
                <MapPin className="h-4 w-4 shrink-0 text-secondary" />
                <Select value={returnLocation} onValueChange={setReturnLocation}>
                  <SelectTrigger
                    className={cn(
                      'border-0 p-0 h-auto min-h-0 shadow-none focus:ring-0 bg-transparent flex-1 text-sm',
                      inputClass
                    )}
                  >
                    <SelectValue placeholder="Seleccionar ubicación de devolución" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations?.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* FECHA DE RECOGIDA: fecha + hora */}
          <div>
            <label className={cn('text-[10px] font-semibold uppercase tracking-wider block mb-1.5', labelClass)}>
              Fecha de recogida
            </label>
            <div className="flex gap-3">
              <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-2.5 flex-1', fieldBg, fieldBorder)}>
                <CalendarIcon className="h-4 w-4 shrink-0 text-secondary" />
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn('text-left text-sm min-w-0', inputClass)}
                    >
                      {format(pickupDate, 'd MMM', { locale: es })}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={pickupDate}
                      onSelect={(date) => date && setPickupDate(date)}
                      disabled={(date) => date < new Date()}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-2.5 w-24', fieldBg, fieldBorder)}>
                <Select value={pickupTime} onValueChange={setPickupTime}>
                  <SelectTrigger
                    className={cn(
                      'border-0 p-0 h-auto min-h-0 w-full shadow-none focus:ring-0 bg-transparent text-sm font-medium',
                      inputClass
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMES.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* FECHA DE DEVOLUCIÓN: fecha + hora */}
          <div>
            <label className={cn('text-[10px] font-semibold uppercase tracking-wider block mb-1.5', labelClass)}>
              Fecha de devolución
            </label>
              <div className="flex gap-3">
                <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-2.5 flex-1', fieldBg, fieldBorder)}>
                  <CalendarIcon className="h-4 w-4 shrink-0 text-secondary" />
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn('text-left text-sm min-w-0', inputClass)}
                      >
                        {format(returnDate, 'd MMM', { locale: es })}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={(date) => date && setReturnDate(date)}
                        disabled={(date) => date < pickupDate}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-2.5 w-24', fieldBg, fieldBorder)}>
                  <Select value={returnTime} onValueChange={setReturnTime}>
                    <SelectTrigger
                      className={cn(
                        'border-0 p-0 h-auto min-h-0 w-full shadow-none focus:ring-0 bg-transparent text-sm font-medium',
                        inputClass
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMES.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
          </div>

          {/* Botón Buscar (verde sólido, siempre visible) */}
          <Button
            type="button"
            onClick={handleSearch}
            className={cn(
              'w-full h-11 text-sm font-bold rounded-lg transition-all',
              '!bg-[#00CC66] hover:!bg-[#00A352] text-white',
              'flex items-center justify-center gap-2'
            )}
            style={{ backgroundColor: '#00CC66' }}
          >
            Buscar
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className={cn('flex items-center justify-center gap-1.5 text-[10px]', labelClass)}>
            <ShieldCheck className="h-3 w-3 text-secondary" />
            Pago seguro
          </p>
        </div>
      </div>
    </div>
  );
}
