import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Search,
  FileText,
  GraduationCap,
  Rocket,
  TrendingUp,
} from 'lucide-react';

interface ProcessStep {
  phase: string;
  title: string;
  duration: string;
  description: string;
  features: string[];
  icon: React.ElementType;
}

const PROCESS_STEPS: ProcessStep[] = [
  {
    phase: 'Fase 01',
    title: 'Contacto + Análisis inicial',
    duration: '1 semana',
    description: 'Nos ponemos en contacto para conocer tus objetivos, experiencia y capital disponible. Evaluamos la viabilidad del proyecto en tu zona.',
    features: ['Llamada inicial', 'Cuestionario', 'Evaluación zona', 'Viabilidad'],
    icon: MessageSquare,
  },
  {
    phase: 'Fase 02',
    title: 'Estudio de mercado',
    duration: '2 semanas',
    description: 'Analizamos tu zona geográfica, competencia directa, demanda potencial y oportunidades de negocio específicas para tu ubicación.',
    features: ['Análisis competencia', 'Demanda local', 'Oportunidades', 'Informe detallado'],
    icon: Search,
  },
  {
    phase: 'Fase 03',
    title: 'Plan de negocio',
    duration: '1-2 semanas',
    description: 'Desarrollamos juntos un plan de negocio realista con proyecciones financieras, inversión necesaria y retorno esperado.',
    features: ['Proyecciones', 'Inversión', 'ROI estimado', 'Plan financiero'],
    icon: FileText,
  },
  {
    phase: 'Fase 04',
    title: 'Formación completa',
    duration: '2 semanas',
    description: 'Te formamos en todos los aspectos del negocio: operativa diaria, uso del software, atención al cliente y gestión de flota.',
    features: ['Formación presencial', 'Software', 'Operativa', 'Certificación'],
    icon: GraduationCap,
  },
  {
    phase: 'Fase 05',
    title: 'Puesta en marcha',
    duration: '1-2 semanas',
    description: 'Te acompañamos en el lanzamiento: configuración del sistema, primeros vehículos, web de reservas y primeras operaciones.',
    features: ['Setup sistema', 'Web personalizada', 'Primeros coches', 'Soporte intensivo'],
    icon: Rocket,
  },
  {
    phase: 'Fase 06',
    title: 'Crecimiento continuo',
    duration: 'Ongoing',
    description: 'Seguimiento mensual, soporte continuo, actualizaciones del software y apoyo para escalar tu negocio cuando estés listo.',
    features: ['Seguimiento', 'Actualizaciones', 'Soporte 24/7', 'Escalado'],
    icon: TrendingUp,
  },
];

export function ProcessTimeline() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #001429 0%, #002952 50%, #001429 100%)',
      }}
    >
      {/* Fondo azul sólido + detalle verde — forzado con estilos en línea */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: '#002952' }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 61, 122, 0.4) 0%, rgba(0, 41, 82, 0.3) 50%, #001429 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top left, transparent 0%, transparent 50%, rgba(0, 41, 20, 0.25) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0, 102, 204, 0.6) 1px, transparent 0), radial-gradient(circle at 21px 21px, rgba(0, 204, 102, 0.35) 1px, transparent 0)',
          backgroundSize: '40px 40px',
          opacity: 0.5,
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
            <span className="text-sm font-medium text-white">Cómo funciona</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Nuestro <span className="text-white">proceso</span>
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Metodología probada en +50 empresas creadas. Estructurado, transparente y orientado a resultados.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Línea vertical central - solo visible en desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-secondary/60 via-primary/70 to-secondary/60" />

          {/* Steps */}
          <div className="space-y-12 lg:space-y-0">
            {PROCESS_STEPS.map((step, index) => {
              const isLeft = index % 2 === 0;
              const Icon = step.icon;

              return (
                <div key={step.phase} className="relative lg:mb-16 last:lg:mb-0">
                  {/* Punto en la línea - desktop */}
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-8 z-10">
                    <div className="w-4 h-4 rounded-full bg-secondary ring-4 ring-secondary-600 shadow-lg shadow-secondary/50" />
                  </div>

                  {/* Línea conectora horizontal - desktop */}
                  <div
                    className={cn(
                      'hidden lg:block absolute top-10 h-px bg-gradient-to-r w-[calc(50%-2rem)]',
                      isLeft
                        ? 'right-1/2 mr-2 from-transparent to-secondary/50'
                        : 'left-1/2 ml-2 from-secondary/50 to-transparent'
                    )}
                  />

                  {/* Card */}
                  <div
                    className={cn(
                      'relative lg:w-[calc(50%-3rem)]',
                      isLeft ? 'lg:mr-auto' : 'lg:ml-auto'
                    )}
                  >
                    <div
                      className="rounded-2xl p-6 transition-all duration-300 group shadow-lg"
                      style={{ backgroundColor: '#00CC66', borderWidth: '2px', borderColor: '#00A352' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#00A352'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#00CC66'; }}
                    >
                      {/* Header de la card */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                              {step.phase}
                            </span>
                            <h3 className="text-lg font-bold text-white">
                              {step.title}
                            </h3>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-white bg-white/20 px-2 py-1 rounded-full">
                          {step.duration}
                        </span>
                      </div>

                      {/* Descripción */}
                      <p className="text-white/90 text-sm mb-4 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Features/Tags */}
                      <div className="flex flex-wrap gap-2">
                        {step.features.map((feature) => (
                          <span
                            key={feature}
                            className="text-xs font-medium text-white bg-white/20 px-3 py-1 rounded-full border border-white/30 hover:bg-white/30 transition-colors"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
