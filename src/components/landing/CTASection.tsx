import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-16 lg:py-24 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Oferta limitada
          </div>
          
          {/* Title */}
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            ¿Listo para tu próximo viaje?
          </h2>
          
          {/* Subtitle */}
          <p className="text-lg lg:text-xl text-white/90 mb-8 max-w-xl mx-auto">
            Reserva ahora y obtén un <span className="font-bold">10% de descuento</span> en tu primer alquiler con el código <span className="font-mono bg-white/20 px-2 py-0.5 rounded">BIENVENIDO10</span>
          </p>
          
          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/#booking">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 font-semibold px-8"
                onClick={() => {
                  document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Reservar ahora
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/vehiculos">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
              >
                Ver vehículos
              </Button>
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-8 mt-10 text-white/70 text-sm">
            <span>✓ Cancelación gratuita</span>
            <span className="hidden sm:inline">✓ Sin costes ocultos</span>
            <span>✓ Atención 24/7</span>
          </div>
        </div>
      </div>
    </section>
  );
}
