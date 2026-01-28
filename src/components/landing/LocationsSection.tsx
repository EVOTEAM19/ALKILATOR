import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocations } from '@/hooks/useLocations';

export function LocationsSection() {
  const { data: locations, isLoading } = useLocations();
  
  // Mostrar solo las primeras 3 ubicaciones
  const featuredLocations = locations?.slice(0, 3);
  
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Nuestras <span className="text-primary">ubicaciones</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encuentra la oficina más cercana a ti. Estamos presentes en las principales 
            ciudades y aeropuertos de España.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Placeholder */}
          <div className="lg:col-span-2 rounded-xl overflow-hidden border bg-card min-h-[400px]">
            <div className="w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Mapa interactivo próximamente
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Mientras tanto, consulta nuestras ubicaciones en la lista
                </p>
              </div>
            </div>
          </div>
          
          {/* Locations List */}
          <div className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : (
              featuredLocations?.map((location) => (
                <Card key={location.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{location.name}</h3>
                      {location.is_main && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Principal
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      {location.address && (
                        <p className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                          {location.address}, {location.city}
                        </p>
                      )}
                      {location.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {location.phone}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Lun-Vie: 09:00 - 20:00
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            
            <Link to="/ubicaciones">
              <Button variant="outline" className="w-full">
                Ver todas las ubicaciones
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
