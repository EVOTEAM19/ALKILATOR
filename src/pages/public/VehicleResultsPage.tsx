import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Car, 
  Truck,
  Filter, 
  ArrowLeft, 
  Edit, 
  Users, 
  Fuel, 
  Settings2,
  Briefcase,
  Check,
  X,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAvailableVehicles } from '@/hooks/useAvailableVehicles';
import { useLocations, useLocation } from '@/hooks/useLocations';
import { useBookingStore } from '@/stores/bookingStore';
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS } from '@/lib/constants';
import type { AvailableVehicle } from '@/types';

// Componente de filtros
function VehicleFilters({
  filters,
  onFilterChange,
  maxPrice,
}: {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  maxPrice: number;
}) {
  return (
    <div className="space-y-6">
      {/* Transmisión */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
          Transmisión
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {['manual', 'automatic'].map((trans) => (
            <div key={trans} className="flex items-center gap-2">
              <Checkbox
                id={`trans-${trans}`}
                checked={filters.transmission.includes(trans)}
                onCheckedChange={(checked) => {
                  onFilterChange({
                    ...filters,
                    transmission: checked
                      ? [...filters.transmission, trans]
                      : filters.transmission.filter((t) => t !== trans),
                  });
                }}
              />
              <Label htmlFor={`trans-${trans}`} className="text-sm font-normal cursor-pointer">
                {TRANSMISSION_LABELS[trans]}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
      
      {/* Combustible */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
          Combustible
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {['gasoline', 'diesel', 'hybrid', 'electric'].map((fuel) => (
            <div key={fuel} className="flex items-center gap-2">
              <Checkbox
                id={`fuel-${fuel}`}
                checked={filters.fuelType.includes(fuel)}
                onCheckedChange={(checked) => {
                  onFilterChange({
                    ...filters,
                    fuelType: checked
                      ? [...filters.fuelType, fuel]
                      : filters.fuelType.filter((f) => f !== fuel),
                  });
                }}
              />
              <Label htmlFor={`fuel-${fuel}`} className="text-sm font-normal cursor-pointer">
                {FUEL_TYPE_LABELS[fuel]}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
      
      {/* Plazas */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
          Plazas mínimas
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {[2, 4, 5, 7].map((seats) => (
            <div key={seats} className="flex items-center gap-2">
              <Checkbox
                id={`seats-${seats}`}
                checked={filters.minSeats === seats}
                onCheckedChange={(checked) => {
                  onFilterChange({
                    ...filters,
                    minSeats: checked ? seats : 0,
                  });
                }}
              />
              <Label htmlFor={`seats-${seats}`} className="text-sm font-normal cursor-pointer">
                {seats}+ plazas
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
      
      {/* Precio máximo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium">Precio máximo</span>
          <span className="text-sm text-muted-foreground">
            {filters.maxPrice >= maxPrice ? 'Sin límite' : formatPrice(filters.maxPrice)}
          </span>
        </div>
        <Slider
          value={[filters.maxPrice]}
          min={0}
          max={maxPrice}
          step={10}
          onValueChange={([value]) => {
            onFilterChange({ ...filters, maxPrice: value });
          }}
        />
      </div>
      
      {/* Limpiar filtros */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => {
          onFilterChange({
            transmission: [],
            fuelType: [],
            minSeats: 0,
            maxPrice: maxPrice,
          });
        }}
      >
        <X className="h-4 w-4 mr-2" />
        Limpiar filtros
      </Button>
    </div>
  );
}

// Componente de tarjeta de vehículo
function VehicleResultCard({
  vehicle,
  totalDays,
  onSelect,
}: {
  vehicle: AvailableVehicle;
  totalDays: number;
  onSelect: () => void;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Imagen */}
        <div className="md:w-64 h-48 md:h-auto bg-muted shrink-0">
          {vehicle.image_url ? (
            <img
              src={vehicle.image_url}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
              <Car className="h-16 w-16 text-primary/20" />
            </div>
          )}
        </div>
        
        {/* Contenido */}
        <CardContent className="flex-1 p-4 md:p-6">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {vehicle.group_name}
                </Badge>
                <h3 className="text-xl font-semibold">
                  {vehicle.brand} {vehicle.model}
                  <span className="text-muted-foreground font-normal ml-2">o similar</span>
                </h3>
              </div>
            </div>
            
            {/* Características */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {vehicle.seats} plazas
              </span>
              <span className="flex items-center gap-1.5">
                <Settings2 className="h-4 w-4" />
                {TRANSMISSION_LABELS[vehicle.transmission]}
              </span>
              <span className="flex items-center gap-1.5">
                <Fuel className="h-4 w-4" />
                {FUEL_TYPE_LABELS[vehicle.fuel_type]}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                2 maletas
              </span>
            </div>
            
            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {vehicle.features.slice(0, 4).map((feature, i) => (
                  <span key={i} className="inline-flex items-center text-xs text-muted-foreground">
                    <Check className="h-3 w-3 mr-1 text-secondary" />
                    {feature.replace('_', ' ')}
                  </span>
                ))}
              </div>
            )}
            
            {/* Km incluidos */}
            <p className="text-sm text-muted-foreground mb-4">
              {vehicle.km_per_day} km/día incluidos ({vehicle.km_per_day * totalDays} km total)
            </p>
            
            {/* Precio y CTA */}
            <div className="mt-auto flex items-end justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Total {totalDays} días</p>
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(vehicle.total_price)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(vehicle.daily_price)}/día
                </p>
              </div>
              <Button 
                size="lg" 
                className="bg-secondary hover:bg-secondary/90"
                onClick={onSelect}
              >
                Seleccionar
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

// Estado de filtros
interface FilterState {
  transmission: string[];
  fuelType: string[];
  minSeats: number;
  maxPrice: number;
}

// Página principal
export default function VehicleResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSearchParams, setSelectedVehicle, setPickupLocation, setReturnLocation } = useBookingStore();
  
  // Leer parámetros de URL
  const tipo = (searchParams.get('tipo') as 'car' | 'van') || 'car';
  const recogidaId = searchParams.get('recogida') || '';
  const devolucionId = searchParams.get('devolucion') || recogidaId;
  const fechaRecogida = searchParams.get('fecha_recogida') || '';
  const horaRecogida = searchParams.get('hora_recogida') || '10:00';
  const fechaDevolucion = searchParams.get('fecha_devolucion') || '';
  const horaDevolucion = searchParams.get('hora_devolucion') || '10:00';
  
  // Calcular días
  const totalDays = useMemo(() => {
    if (!fechaRecogida || !fechaDevolucion) return 1;
    const days = differenceInDays(parseISO(fechaDevolucion), parseISO(fechaRecogida));
    return Math.max(days, 1);
  }, [fechaRecogida, fechaDevolucion]);
  
  // Obtener ubicaciones
  const { data: pickupLocation } = useLocation(recogidaId);
  const { data: returnLocation } = useLocation(devolucionId);
  
  // Guardar en store
  useEffect(() => {
    if (fechaRecogida && fechaDevolucion) {
      setSearchParams({
        vehicleType: tipo,
        pickupLocationId: recogidaId,
        returnLocationId: devolucionId,
        pickupDate: fechaRecogida,
        pickupTime: horaRecogida,
        returnDate: fechaDevolucion,
        returnTime: horaDevolucion,
      });
    }
  }, [tipo, recogidaId, devolucionId, fechaRecogida, horaRecogida, fechaDevolucion, horaDevolucion, setSearchParams]);
  
  useEffect(() => {
    if (pickupLocation) setPickupLocation(pickupLocation);
  }, [pickupLocation, setPickupLocation]);
  
  useEffect(() => {
    if (returnLocation) setReturnLocation(returnLocation);
  }, [returnLocation, setReturnLocation]);
  
  // Obtener vehículos disponibles
  const { vehicles, isLoading, error } = useAvailableVehicles({
    pickupDate: fechaRecogida,
    returnDate: fechaDevolucion,
    pickupLocationId: recogidaId,
    vehicleType: tipo,
  });
  
  // Estado de filtros
  const maxPossiblePrice = useMemo(() => {
    if (!vehicles.length) return 500;
    return Math.ceil(Math.max(...vehicles.map(v => v.total_price)) / 50) * 50 + 50;
  }, [vehicles]);
  
  const [filters, setFilters] = useState<FilterState>({
    transmission: [],
    fuelType: [],
    minSeats: 0,
    maxPrice: maxPossiblePrice,
  });
  
  // Actualizar maxPrice cuando cambie maxPossiblePrice
  useEffect(() => {
    setFilters(f => ({ ...f, maxPrice: maxPossiblePrice }));
  }, [maxPossiblePrice]);
  
  // Estado de ordenación
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc'>('price_asc');
  
  // Filtrar y ordenar vehículos
  const filteredVehicles = useMemo(() => {
    let result = [...vehicles];
    
    // Aplicar filtros
    if (filters.transmission.length > 0) {
      result = result.filter(v => filters.transmission.includes(v.transmission));
    }
    if (filters.fuelType.length > 0) {
      result = result.filter(v => filters.fuelType.includes(v.fuel_type));
    }
    if (filters.minSeats > 0) {
      result = result.filter(v => v.seats >= filters.minSeats);
    }
    if (filters.maxPrice < maxPossiblePrice) {
      result = result.filter(v => v.total_price <= filters.maxPrice);
    }
    
    // Ordenar
    result.sort((a, b) => {
      if (sortBy === 'price_asc') return a.total_price - b.total_price;
      if (sortBy === 'price_desc') return b.total_price - a.total_price;
      return 0;
    });
    
    return result;
  }, [vehicles, filters, sortBy, maxPossiblePrice]);
  
  // Seleccionar vehículo
  const handleSelectVehicle = (vehicle: AvailableVehicle) => {
    setSelectedVehicle({
      vehicleGroup: {
        id: vehicle.vehicle_group_id,
        name: vehicle.group_name,
        code: vehicle.group_code,
        deposit_amount: vehicle.deposit_amount,
      } as any,
      dailyPrice: vehicle.daily_price,
      totalPrice: vehicle.total_price,
      kmPerDay: vehicle.km_per_day,
    });
    
    navigate('/extras');
  };
  
  // Formatear fechas para mostrar
  const formatDisplayDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "EEE, dd MMM", { locale: es });
    } catch {
      return dateStr;
    }
  };
  
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header con resumen de búsqueda */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="shrink-0">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Volver</span>
                </Button>
              </Link>
              
              <div className="flex items-center gap-2 text-sm">
                {tipo === 'car' ? <Car className="h-4 w-4 text-primary" /> : <Truck className="h-4 w-4 text-primary" />}
                <span className="font-medium">
                  {pickupLocation?.name || 'Cargando...'}
                </span>
                {pickupLocation?.id !== returnLocation?.id && (
                  <>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium">{returnLocation?.name}</span>
                  </>
                )}
              </div>
              
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground border-l pl-3">
                <span>{formatDisplayDate(fechaRecogida)} {horaRecogida}</span>
                <span>→</span>
                <span>{formatDisplayDate(fechaDevolucion)} {horaDevolucion}</span>
                <Badge variant="outline" className="ml-1">{totalDays} días</Badge>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <Edit className="h-4 w-4 mr-2" />
              Modificar
            </Button>
          </div>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar de filtros (desktop) */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-lg border p-4 sticky top-36">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4" />
                Filtros
              </h3>
              <VehicleFilters
                filters={filters}
                onFilterChange={setFilters}
                maxPrice={maxPossiblePrice}
              />
            </div>
          </aside>
          
          {/* Lista de resultados */}
          <main className="flex-1">
            {/* Header de resultados */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">
                  {tipo === 'car' ? 'Coches' : 'Furgonetas'} disponibles
                </h1>
                <p className="text-muted-foreground">
                  {isLoading ? 'Buscando...' : `${filteredVehicles.length} vehículos encontrados`}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Filtros mobile */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <VehicleFilters
                        filters={filters}
                        onFilterChange={setFilters}
                        maxPrice={maxPossiblePrice}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
                
                {/* Ordenar */}
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
                    <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Lista de vehículos */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <Skeleton className="md:w-64 h-48" />
                      <div className="flex-1 p-6">
                        <Skeleton className="h-6 w-24 mb-2" />
                        <Skeleton className="h-8 w-48 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredVehicles.length === 0 ? (
              <Card className="p-12 text-center">
                <Car className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay vehículos disponibles</h3>
                <p className="text-muted-foreground mb-6">
                  {vehicles.length === 0
                    ? 'No encontramos vehículos para las fechas seleccionadas.'
                    : 'Prueba a ajustar los filtros para ver más opciones.'}
                </p>
                <div className="flex justify-center gap-3">
                  {vehicles.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setFilters({
                        transmission: [],
                        fuelType: [],
                        minSeats: 0,
                        maxPrice: maxPossiblePrice,
                      })}
                    >
                      Limpiar filtros
                    </Button>
                  )}
                  <Button onClick={() => navigate('/')}>
                    Cambiar fechas
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredVehicles.map((vehicle) => (
                  <VehicleResultCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    totalDays={totalDays}
                    onSelect={() => handleSelectVehicle(vehicle)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
