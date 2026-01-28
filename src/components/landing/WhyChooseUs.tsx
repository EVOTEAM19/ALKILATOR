import { 
  BadgeCheck, 
  Clock, 
  Shield, 
  HeadphonesIcon,
  Banknote,
  MapPin
} from 'lucide-react';

const features = [
  {
    icon: BadgeCheck,
    title: 'Mejores precios garantizados',
    description: 'Si encuentras un precio mejor, te igualamos la oferta.',
    color: 'text-primary bg-primary/10 border border-primary/20',
  },
  {
    icon: Shield,
    title: 'Sin costes ocultos',
    description: 'Precio final desde el principio. Sin sorpresas al recoger.',
    color: 'text-accent bg-accent/10 border border-accent/20',
  },
  {
    icon: Clock,
    title: 'Cancelación gratuita',
    description: 'Cancela hasta 48 horas antes sin ningún cargo.',
    color: 'text-primary bg-primary/10 border border-primary/20',
  },
  {
    icon: HeadphonesIcon,
    title: 'Atención 24/7',
    description: 'Estamos disponibles las 24 horas, los 7 días de la semana.',
    color: 'text-accent bg-accent/10 border border-accent/20',
  },
  {
    icon: Banknote,
    title: 'Pago flexible',
    description: 'Paga online con descuento o al recoger el vehículo.',
    color: 'text-primary bg-primary/10 border border-primary/20',
  },
  {
    icon: MapPin,
    title: 'Múltiples ubicaciones',
    description: 'Recoge y devuelve en diferentes puntos de la ciudad.',
    color: 'text-accent bg-accent/10 border border-accent/20',
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 lg:py-24 bg-primary/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-primary">
            ¿Por qué elegir <span className="text-accent">Alkilator</span>?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Miles de clientes confían en nosotros cada año. Descubre por qué somos 
            la mejor opción para alquilar tu coche.
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="flex gap-4 p-6 rounded-xl border-2 border-primary/15 bg-white hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all"
              >
                <div className={`shrink-0 h-12 w-12 rounded-lg ${feature.color} flex items-center justify-center`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
