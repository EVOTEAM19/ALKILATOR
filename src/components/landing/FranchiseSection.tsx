import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Car,
  TrendingUp,
  Users,
  Award,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FranchiseSection() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-primary via-primary/95 to-primary/90 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contenido izquierdo */}
          <div className="text-white">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 text-secondary" />
              Oportunidad de negocio
            </div>

            <h2 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
              Monta tu propia empresa de 
              <span className="text-secondary"> rent a car</span>
            </h2>

            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Con más de <span className="font-semibold text-white">20 años de experiencia</span> en el sector, 
              te ofrecemos todo lo que necesitas para emprender en el mundo del alquiler de vehículos 
              con el respaldo de un equipo experto.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div>
                <p className="text-3xl lg:text-4xl font-bold text-secondary">20+</p>
                <p className="text-sm text-white/70">Años de experiencia</p>
              </div>
              <div>
                <p className="text-3xl lg:text-4xl font-bold text-secondary">50+</p>
                <p className="text-sm text-white/70">Empresas creadas</p>
              </div>
              <div>
                <p className="text-3xl lg:text-4xl font-bold text-secondary">98%</p>
                <p className="text-sm text-white/70">Tasa de éxito</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/franquicias">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white w-full sm:w-auto">
                  Descubre cómo empezar
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contacto?asunto=franquicia">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                  Solicitar información
                </Button>
              </Link>
            </div>
          </div>

          {/* Contenido derecho - Cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Car, title: 'Gestión de flota', desc: 'Sistema completo para gestionar tu flota' },
              { icon: Users, title: 'Formación', desc: 'Capacitación completa para ti y tu equipo' },
              { icon: TrendingUp, title: 'Asesoramiento', desc: 'Apoyo comercial y estratégico continuo' },
              { icon: Award, title: 'Tecnología', desc: 'Web de reservas y herramientas digitales' },
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-secondary/20 flex items-center justify-center mb-3">
                  <item.icon className="h-5 w-5 text-secondary" />
                </div>
                <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                <p className="text-sm text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
