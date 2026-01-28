import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Minus,
  Shield,
  Navigation,
  Baby,
  User,
  Gauge,
  Wifi,
  Snowflake,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useExtras } from '@/hooks/useExtras';
import { useBookingStore } from '@/stores/bookingStore';
import type { Extra } from '@/types';

// Mapeo de iconos por tipo de extra
const extraIcons: Record<string, any> = {
  gps: Navigation,
  baby_seat: Baby,
  driver: User,
  insurance: Shield,
  km_unlimited: Gauge,
  wifi: Wifi,
  chains: Snowflake,
  default: Plus,
};

// Componente de tarjeta de extra
function ExtraCard({
  extra,
  totalDays,
  selectedQuantity,
  onSelect,
  onQuantityChange,
}: {
  extra: Extra;
  totalDays: number;
  selectedQuantity: number;
  onSelect: (selected: boolean) => void;
  onQuantityChange: (quantity: number) => void;
}) {
  const isSelected = selectedQuantity > 0;
  const totalPrice = extra.is_per_rental
    ? extra.daily_price * selectedQuantity
    : extra.daily_price * selectedQuantity * totalDays;

  // Determinar icono
  const iconKey = extra.name.toLowerCase().includes('gps') ? 'gps'
    : extra.name.toLowerCase().includes('silla') || extra.name.toLowerCase().includes('bebé') ? 'baby_seat'
    : extra.name.toLowerCase().includes('conductor') ? 'driver'
    : extra.name.toLowerCase().includes('franquicia') || extra.name.toLowerCase().includes('seguro') ? 'insurance'
    : extra.name.toLowerCase().includes('km') || extra.name.toLowerCase().includes('ilimitado') ? 'km_unlimited'
    : extra.name.toLowerCase().includes('wifi') ? 'wifi'
    : extra.name.toLowerCase().includes('cadena') ? 'chains'
    : 'default';

  const Icon = extraIcons[iconKey];

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all',
        isSelected
          ? 'ring-2 ring-secondary border-secondary'
          : 'hover:border-primary/50'
      )}
      onClick={() => {
        if (!isSelected) {
          onSelect(true);
        }
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icono */}
          <div className={cn(
            'shrink-0 h-12 w-12 rounded-lg flex items-center justify-center',
            isSelected ? 'bg-secondary/20 text-secondary' : 'bg-muted text-muted-foreground'
          )}>
            <Icon className="h-6 w-6" />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium">{extra.name}</h4>
                {extra.description && (
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {extra.description}
                  </p>
                )}
              </div>

              {/* Precio */}
              <div className="text-right shrink-0">
                <p className="font-semibold text-primary">
                  {formatPrice(extra.daily_price)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {extra.is_per_rental ? 'por alquiler' : 'por día'}
                </p>
              </div>
            </div>

            {/* Selector de cantidad o botón */}
            <div className="mt-3 flex items-center justify-between">
              {isSelected ? (
                <div className="flex items-center gap-2">
                  {extra.max_quantity > 1 ? (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedQuantity <= 1) {
                            onSelect(false);
                          } else {
                            onQuantityChange(selectedQuantity - 1);
                          }
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{selectedQuantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedQuantity < extra.max_quantity) {
                            onQuantityChange(selectedQuantity + 1);
                          }
                        }}
                        disabled={selectedQuantity >= extra.max_quantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(false);
                      }}
                    >
                      Quitar
                    </Button>
                  )}

                  <span className="text-sm font-medium ml-2">
                    Total: {formatPrice(totalPrice)}
                  </span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-secondary border-secondary hover:bg-secondary hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir
                </Button>
              )}

              {isSelected && (
                <Badge variant="secondary" className="ml-auto">
                  <Check className="h-3 w-3 mr-1" />
                  Añadido
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de protección/franquicia
function ProtectionSelector({
  depositAmount,
  selectedOption,
  onSelect,
  totalDays,
}: {
  depositAmount: number;
  selectedOption: string;
  onSelect: (option: string) => void;
  totalDays: number;
}) {
  const options = [
    {
      id: 'basic',
      name: 'Protección Básica',
      description: 'Incluida en el precio',
      franchise: depositAmount,
      pricePerDay: 0,
      included: true,
    },
    {
      id: 'medium',
      name: 'Protección Media',
      description: 'Reduce tu franquicia a la mitad',
      franchise: depositAmount / 2,
      pricePerDay: 8,
      included: false,
    },
    {
      id: 'premium',
      name: 'Protección Premium',
      description: 'Sin preocupaciones, franquicia 0€',
      franchise: 0,
      pricePerDay: 15,
      included: false,
      recommended: true,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Protección del vehículo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedOption} onValueChange={onSelect} className="space-y-3">
          {options.map((option) => (
            <div key={option.id}>
              <Label
                htmlFor={option.id}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all',
                  selectedOption === option.id
                    ? 'border-secondary bg-secondary/5 ring-1 ring-secondary'
                    : 'hover:border-primary/50'
                )}
              >
                <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{option.name}</span>
                    {option.recommended && (
                      <Badge className="bg-secondary">Recomendado</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                  <p className="text-sm mt-1">
                    Franquicia: <span className="font-semibold">{formatPrice(option.franchise)}</span>
                  </p>
                </div>
                <div className="text-right">
                  {option.included ? (
                    <span className="text-sm font-medium text-secondary">Incluido</span>
                  ) : (
                    <>
                      <p className="font-semibold text-primary">
                        +{formatPrice(option.pricePerDay * totalDays)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(option.pricePerDay)}/día
                      </p>
                    </>
                  )}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

// Componente de resumen
function BookingSummary() {
  const {
    selectedVehicle,
    selectedExtras,
    pickupLocation,
    returnLocation,
    searchParams,
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

  if (!selectedVehicle) return null;

  return (
    <Card className="sticky top-36">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Tu reserva</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vehículo */}
        <div className="flex items-center gap-3 pb-3 border-b">
          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
            🚗
          </div>
          <div>
            <p className="font-medium">{selectedVehicle.vehicleGroup.name}</p>
            <p className="text-sm text-muted-foreground">o similar</p>
          </div>
        </div>

        {/* Fechas */}
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Recogida</span>
            <span>{searchParams?.pickupDate} {searchParams?.pickupTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Devolución</span>
            <span>{searchParams?.returnDate} {searchParams?.returnTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duración</span>
            <span>{totalDays} días</span>
          </div>
        </div>

        <Separator />

        {/* Desglose de precios */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Alquiler ({totalDays} días × {formatPrice(selectedVehicle.dailyPrice)})</span>
            <span>{formatPrice(selectedVehicle.totalPrice)}</span>
          </div>

          {selectedExtras.length > 0 && (
            <div className="flex justify-between">
              <span>Extras</span>
              <span>{formatPrice(extrasTotal)}</span>
            </div>
          )}

          {locationSurcharge > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Devolución diferente ubicación</span>
              <span>{formatPrice(locationSurcharge)}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Totales */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>IVA (21%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>Total</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Fianza */}
        <div className="bg-muted/50 rounded-lg p-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Fianza requerida: {formatPrice(selectedVehicle.vehicleGroup.deposit_amount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
            'flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium',
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

// Página principal
export default function ExtrasPage() {
  const navigate = useNavigate();
  const {
    selectedVehicle,
    searchParams,
    selectedExtras,
    addExtra,
    removeExtra,
    updateExtraQuantity,
    getTotalDays,
    setCurrentStep,
  } = useBookingStore();

  const { extras, isLoading } = useExtras();

  const [protectionOption, setProtectionOption] = useState('basic');

  const totalDays = getTotalDays();

  // Redirigir si no hay vehículo seleccionado
  useEffect(() => {
    if (!selectedVehicle) {
      navigate('/vehiculos');
    } else {
      setCurrentStep(2);
    }
  }, [selectedVehicle, navigate, setCurrentStep]);

  // Agrupar extras por tipo
  const groupedExtras = useMemo(() => {
    const groups: Record<string, Extra[]> = {
      accessory: [],
      service: [],
      km_package: [],
      driver: [],
    };

    extras.forEach(extra => {
      // Excluir seguros (se manejan en protección)
      if (extra.extra_type !== 'insurance') {
        const group = groups[extra.extra_type] || groups.accessory;
        group.push(extra);
      }
    });

    return groups;
  }, [extras]);

  // Obtener cantidad seleccionada de un extra
  const getSelectedQuantity = (extraId: string) => {
    const selected = selectedExtras.find(e => e.extra_id === extraId);
    return selected?.quantity || 0;
  };

  // Manejar selección de extra
  const handleSelectExtra = (extra: Extra, selected: boolean) => {
    if (selected) {
      addExtra({
        id: crypto.randomUUID(),
        booking_id: '',
        extra_id: extra.id,
        extra_name: extra.name,
        quantity: 1,
        unit_price: extra.daily_price,
        total_price: extra.is_per_rental ? extra.daily_price : extra.daily_price * totalDays,
        is_per_rental: extra.is_per_rental,
        created_at: new Date().toISOString(),
      });
    } else {
      removeExtra(extra.id);
    }
  };

  // Manejar cambio de cantidad
  const handleQuantityChange = (extraId: string, quantity: number) => {
    updateExtraQuantity(extraId, quantity);
  };

  // Continuar al siguiente paso
  const handleContinue = () => {
    // Añadir protección si no es básica
    if (protectionOption !== 'basic') {
      const protectionPrices: Record<string, number> = {
        medium: 8,
        premium: 15,
      };

      // Verificar si ya existe protección añadida
      const existingProtection = selectedExtras.find(e => 
        e.extra_name.includes('Protección')
      );

      if (!existingProtection) {
        const protectionNames: Record<string, string> = {
          medium: 'Protección Media',
          premium: 'Protección Premium',
        };

        addExtra({
          id: crypto.randomUUID(),
          booking_id: '',
          extra_id: `protection-${protectionOption}`,
          extra_name: protectionNames[protectionOption],
          quantity: 1,
          unit_price: protectionPrices[protectionOption],
          total_price: protectionPrices[protectionOption] * totalDays,
          is_per_rental: false,
          created_at: new Date().toISOString(),
        });
      }
    }

    navigate('/datos-cliente');
  };

  if (!selectedVehicle) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        {/* Progreso */}
        <BookingProgress currentStep={2} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <Link to="/vehiculos">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a vehículos
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Personaliza tu alquiler</h1>
              <p className="text-muted-foreground mt-1">
                Añade extras y protección para disfrutar de tu viaje sin preocupaciones
              </p>
            </div>

            {/* Protección */}
            <ProtectionSelector
              depositAmount={selectedVehicle.vehicleGroup.deposit_amount}
              selectedOption={protectionOption}
              onSelect={setProtectionOption}
              totalDays={totalDays}
            />

            {/* Extras por categoría */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : (
              <>
                {/* Accesorios */}
                {groupedExtras.accessory.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Accesorios</h2>
                    <div className="grid gap-4">
                      {groupedExtras.accessory.map(extra => (
                        <ExtraCard
                          key={extra.id}
                          extra={extra}
                          totalDays={totalDays}
                          selectedQuantity={getSelectedQuantity(extra.id)}
                          onSelect={(selected) => handleSelectExtra(extra, selected)}
                          onQuantityChange={(qty) => handleQuantityChange(extra.id, qty)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Conductor adicional */}
                {groupedExtras.driver.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Conductores</h2>
                    <div className="grid gap-4">
                      {groupedExtras.driver.map(extra => (
                        <ExtraCard
                          key={extra.id}
                          extra={extra}
                          totalDays={totalDays}
                          selectedQuantity={getSelectedQuantity(extra.id)}
                          onSelect={(selected) => handleSelectExtra(extra, selected)}
                          onQuantityChange={(qty) => handleQuantityChange(extra.id, qty)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Kilómetros */}
                {groupedExtras.km_package.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Kilómetros</h2>
                    <Card className="p-4 bg-muted/50">
                      <div className="flex items-center gap-3 mb-4">
                        <Gauge className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">
                            {selectedVehicle.kmPerDay} km/día incluidos
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total incluido: {selectedVehicle.kmPerDay * totalDays} km
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-4">
                        {groupedExtras.km_package.map(extra => (
                          <ExtraCard
                            key={extra.id}
                            extra={extra}
                            totalDays={totalDays}
                            selectedQuantity={getSelectedQuantity(extra.id)}
                            onSelect={(selected) => handleSelectExtra(extra, selected)}
                            onQuantityChange={(qty) => handleQuantityChange(extra.id, qty)}
                          />
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
              </>
            )}

            {/* Botones de navegación */}
            <div className="flex justify-between pt-6">
              <Link to="/vehiculos">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <Button 
                size="lg" 
                className="bg-secondary hover:bg-secondary/90"
                onClick={handleContinue}
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
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
