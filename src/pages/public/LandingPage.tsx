import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Truck,
  MapPin,
  Shield,
  Clock,
  CreditCard,
  Star,
  ChevronRight,
  Check,
  Phone,
  Award,
  Building2,
  Sparkles,
  ArrowRight,
  Play,
  Headphones,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BookingEngine } from '@/components/booking/BookingEngine';
import { AnimatedWaves, FloatingParticles } from '@/components/shared/AnimatedWaves';
import { SEOHead } from '@/components/shared/SEOHead';

function AnimatedCounter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={countRef} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const FEATURES = [
  { icon: Shield, title: 'Seguro incluido', description: 'Todos nuestros vehículos incluyen seguro a todo riesgo.', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { icon: Clock, title: 'Recogida en 10 min', description: 'Servicio express sin esperas innecesarias.', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { icon: CreditCard, title: 'Sin cargos ocultos', description: 'Precio final transparente. Lo que ves es lo que pagas.', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  { icon: Headphones, title: 'Asistencia 24 horas', description: 'Asistencia y soporte disponibles las 24 horas del día, los 7 días de la semana.', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
];

const STATS = [
  { value: 20, suffix: '+', label: 'Años de experiencia' },
  { value: 50, suffix: '+', label: 'Ubicaciones' },
  { value: 2000, suffix: '+', label: 'Vehículos' },
  { value: 98, suffix: '%', label: 'Clientes satisfechos' },
];

const VEHICLE_TYPES = [
  { name: 'Coches', icon: Car, image: '/images/cars/compacto.png', description: 'Desde utilitarios hasta premium', price: 'Desde 19€/día', link: '/vehiculos?tipo=car' },
  { name: 'Furgonetas', icon: Truck, image: '/images/cars/furgoneta.png', description: 'Para mudanzas y transporte', price: 'Desde 39€/día', link: '/vehiculos?tipo=van' },
];

export default function LandingPage() {
  return (
    <>
      <SEOHead
        title="Alquiler de Coches y Furgonetas"
        description="Alquila coches y furgonetas en más de 50 ubicaciones. Mejor precio garantizado, recogida express y sin cargos ocultos. Reserva online ahora."
        keywords={['alquiler coches', 'alquiler furgonetas', 'rent a car', 'alquiler vehículos madrid']}
      />

      {/* ========== HERO SECTION ========== */}
      <section className="relative min-h-screen flex items-center hero-gradient-animated overflow-hidden">
        <AnimatedWaves variant="hero" />
        <FloatingParticles />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-white order-2 lg:order-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 animate-slideUp text-white">
                Alquila tu
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">vehículo ideal</span>
              </h1>

              <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-lg animate-slideUp delay-100">
                Coches y furgonetas de alquiler en más de 50 ubicaciones. Reserva online en minutos y recoge tu vehículo sin esperas.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8 animate-slideUp delay-200">
                {STATS.map((stat) => (
                  <div key={stat.label} className="text-center sm:text-left">
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-xs sm:text-sm text-white/60">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 animate-slideUp delay-300">
                <Link to="/ubicaciones" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white">
                  <MapPin className="h-4 w-4" />
                  Ver ubicaciones
                </Link>
                <Link to="/franquicias" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors text-green-300">
                  <Building2 className="h-4 w-4" />
                  Franquicias
                </Link>
              </div>
            </div>

            <div id="reservar" className="animate-slideUp delay-200 lg:pl-8 scroll-mt-24 order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border-b border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-gray-600">Reserva instantánea</span>
                </div>
                <BookingEngine variant="light" showVehicleType={true} />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-white/60 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ========== CARACTERÍSTICAS ========== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir <span className="text-gradient">Alkilator</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Más de 20 años de experiencia nos avalan. Ofrecemos el mejor servicio al mejor precio.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={feature.title} className="card-hover-lift bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center mb-4', feature.bgColor)}>
                  <feature.icon className={cn('h-7 w-7', feature.color)} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TIPOS DE VEHÍCULOS ========== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Encuentra el vehículo perfecto</h2>
            <p className="text-lg text-gray-600">Amplia flota para todas tus necesidades</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {VEHICLE_TYPES.map((type) => (
              <Link key={type.name} to={type.link} className="group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
                <div className="aspect-[4/3] min-h-[220px] overflow-hidden bg-gray-100 relative">
                  <img
                    src={type.image}
                    alt={type.name}
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{type.name}</h3>
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary font-bold text-lg">{type.price}</span>
                    <span className="inline-flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                      Ver flota
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA FRANQUICIA ========== */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-primary/90 relative overflow-hidden">
        <AnimatedWaves variant="section" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-secondary/20 rounded-full px-4 py-2 mb-6">
                <Award className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">Oportunidad de negocio</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-primary-200">Crea tu propia empresa</span>
                <span className="block text-secondary">de alquiler de vehículos</span>
              </h2>
              <p className="text-lg text-primary-100 mb-8">
                Te proporcionamos todo lo necesario: tecnología, formación, acuerdos de flota y soporte continuo. Más de 50 empresas creadas con una tasa de éxito del 98%.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {['Software de gestión incluido', 'Formación completa', 'Llave en Mano', 'Soporte 24/7', 'Acuerdos de flota', 'Marketing digital'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-secondary/30 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm text-secondary-100">{item}</span>
                  </div>
                ))}
              </div>

              <Link to="/franquicias">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-bold btn-glow">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Más información
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '20+', label: 'Años de experiencia', icon: Award, color: 'text-primary' },
                { value: '50+', label: 'Empresas creadas', icon: Building2, color: 'text-secondary' },
                { value: '2.000+', label: 'Vehículos gestionados', icon: Car, color: 'text-primary' },
                { value: '98%', label: 'Tasa de éxito', icon: Star, color: 'text-secondary' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
                  <stat.icon className={cn('h-8 w-8 mx-auto mb-3', stat.color)} />
                  <div className={cn('text-3xl font-bold mb-1', stat.color)}>{stat.value}</div>
                  <div className="text-sm text-primary-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== UBICACIONES ========== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">+50 ubicaciones en toda España</h2>
            <p className="text-lg text-gray-600">Recoge y devuelve tu vehículo donde más te convenga</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {['Madrid Centro', 'Aeropuerto Barajas', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga', 'Bilbao', 'Alicante', 'Palma'].map((city) => (
              <Link
                key={city}
                to="/ubicaciones"
                className="px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md hover:bg-primary hover:text-white transition-all font-medium text-gray-700"
              >
                {city}
              </Link>
            ))}
            <Link to="/ubicaciones" className="px-4 py-2 bg-[#00CC66] text-white rounded-full shadow-sm hover:bg-[#00A352] transition-all font-medium">
              Ver todas →
            </Link>
          </div>
        </div>
      </section>

      {/* ========== CTA FINAL ========== */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">¿Listo para tu próximo viaje?</h2>
          <p className="text-lg text-gray-400 mb-8">
            Reserva ahora y disfruta del mejor servicio de alquiler de vehículos
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-white font-bold text-lg px-8 btn-glow"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Reservar ahora
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Link to="/contacto">
              <Button size="lg" variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                <Phone className="h-5 w-5 mr-2" />
                Contactar
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
