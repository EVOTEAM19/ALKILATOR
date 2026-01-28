import { Link } from 'react-router-dom';
import { ArrowRight, Users, Fuel, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useVehicleGroups } from '@/hooks/useVehicleGroups';
import { formatPrice } from '@/lib/utils';
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS } from '@/lib/constants';

export function FeaturedVehicles() {
  const { vehicleGroups, isLoading } = useVehicleGroups();
  
  // Mostrar solo los primeros 4 grupos de coches
  const featuredGroups = vehicleGroups
    ?.filter(g => g.vehicle_type === 'car')
    .slice(0, 4);
  
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Nuestra <span className="text-primary">flota</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubre nuestra amplia selección de vehículos para cada necesidad. 
            Desde económicos hasta premium, tenemos el coche perfecto para ti.
          </p>
        </div>
        
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Skeletons
            [...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-8 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : (
            featuredGroups?.map((group) => (
              <Card 
                key={group.id} 
                className="overflow-hidden group hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 bg-muted overflow-hidden">
                  {group.image_url ? (
                    <img
                      src={group.image_url}
                      alt={group.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                      <span className="text-4xl font-bold text-primary/20">
                        {group.code}
                      </span>
                    </div>
                  )}
                  {/* Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                    {group.name}
                  </div>
                </div>
                
                {/* Content */}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{group.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {group.description || 'Vehículos de calidad para tu viaje'}
                  </p>
                  
                  {/* Features */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      5 plazas
                    </span>
                    <span className="flex items-center gap-1">
                      <Fuel className="h-3 w-3" />
                      Gasolina
                    </span>
                    <span className="flex items-center gap-1">
                      <Settings2 className="h-3 w-3" />
                      Manual
                    </span>
                  </div>
                  
                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground">Desde</span>
                      <p className="text-xl font-bold text-primary">
                        {formatPrice(25)}<span className="text-sm font-normal">/día</span>
                      </p>
                    </div>
                    <Link to={`/vehiculos?grupo=${group.id}`}>
                      <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-white transition-colors">
                        Ver más
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {/* View All */}
        <div className="text-center mt-10">
          <Link to="/vehiculos">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Ver todos los vehículos
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
