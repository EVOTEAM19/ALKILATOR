import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Car,
  TrendingUp,
  Shield,
  GraduationCap,
  Globe,
  FileText,
  Key,
  Navigation,
  Handshake,
  CheckCircle2,
  Phone,
  Mail,
  Award,
  Sparkles,
  Play,
  Quote,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

// Servicios que ofrece Alkilator
const services = [
  {
    icon: Car,
    title: 'Gestión de Flota Completa',
    description: 'Sistema integral para gestionar todos tus vehículos: disponibilidad, mantenimientos, ITVs, seguros y documentación en un solo lugar.',
    features: ['Control de kilometraje', 'Alertas de mantenimiento', 'Historial completo', 'Gestión de daños'],
  },
  {
    icon: Handshake,
    title: 'Acuerdos de Flota',
    description: 'Acceso a acuerdos exclusivos con fabricantes y empresas de renting para conseguir los mejores precios en vehículos.',
    features: ['Descuentos exclusivos', 'Condiciones preferentes', 'Variedad de marcas', 'Renting y compra'],
  },
  {
    icon: FileText,
    title: 'Programa de Gestión Profesional',
    description: 'Software completo y profesional para gestionar reservas, contratos, facturación y contabilidad de tu negocio.',
    features: ['Reservas online', 'Contratos digitales', 'Facturación automática', 'Informes y estadísticas'],
  },
  {
    icon: TrendingUp,
    title: 'Asesoramiento Comercial',
    description: 'Te ayudamos a definir tu estrategia comercial, tarifas, promociones y posicionamiento en el mercado.',
    features: ['Estudio de mercado', 'Definición de tarifas', 'Estrategia de precios', 'Marketing digital'],
  },
  {
    icon: Shield,
    title: 'Negociación de Seguros',
    description: 'Negociamos con las mejores compañías aseguradoras para conseguir coberturas óptimas al mejor precio.',
    features: ['Pólizas de flota', 'Coberturas completas', 'Precios competitivos', 'Gestión de siniestros'],
  },
  {
    icon: Navigation,
    title: 'Dispositivos GPS',
    description: 'Sistema de localización GPS para toda tu flota con seguimiento en tiempo real y alertas personalizadas.',
    features: ['Localización 24/7', 'Historial de rutas', 'Alertas de velocidad', 'Geovallas'],
  },
  {
    icon: Key,
    title: 'Alquiler sin Llave (Keyless)',
    description: 'Tecnología de apertura y arranque sin llave física. Tus clientes pueden recoger y devolver vehículos de forma autónoma.',
    features: ['Apertura con app', 'Sin intervención', 'Disponibilidad 24/7', 'Reducción de costes'],
  },
  {
    icon: GraduationCap,
    title: 'Formación Completa',
    description: 'Programa de formación integral para ti y tu equipo. Desde operativa diaria hasta estrategia de negocio.',
    features: ['Formación inicial', 'Actualizaciones continuas', 'Materiales de apoyo', 'Certificación'],
    highlighted: true,
  },
  {
    icon: Globe,
    title: 'Página Web de Reservas',
    description: 'Web profesional y personalizada con motor de reservas integrado, optimizada para convertir visitantes en clientes.',
    features: ['Diseño personalizado', 'SEO optimizado', 'Reservas online', 'Responsive'],
  },
];

const process = [
  { step: 1, title: 'Contacto inicial', description: 'Nos ponemos en contacto para conocer tus objetivos y evaluar la viabilidad del proyecto.' },
  { step: 2, title: 'Estudio de mercado', description: 'Analizamos tu zona geográfica, competencia y oportunidades de negocio.' },
  { step: 3, title: 'Plan de negocio', description: 'Desarrollamos juntos un plan de negocio realista con proyecciones financieras.' },
  { step: 4, title: 'Formación', description: 'Te formamos en todos los aspectos del negocio: operativa, software, atención al cliente.' },
  { step: 5, title: 'Puesta en marcha', description: 'Te acompañamos en el lanzamiento y primeros meses de operación.' },
  { step: 6, title: 'Crecimiento', description: 'Seguimiento continuo y apoyo para escalar tu negocio.' },
];

const faqs = [
  { question: '¿Cuánto capital inicial necesito para empezar?', answer: 'La inversión inicial depende del tamaño de flota con el que quieras comenzar. Podemos empezar con una inversión mínima de 30.000€ para una flota pequeña de 5-10 vehículos, aunque lo recomendable es contar con 50.000-100.000€ para una flota de 15-25 vehículos que permita una operación más rentable.' },
  { question: '¿Necesito experiencia previa en el sector?', answer: 'No es necesario tener experiencia previa. Nuestro programa de formación completo te preparará para gestionar todos los aspectos del negocio. Lo más importante es tener actitud emprendedora y ganas de aprender.' },
  { question: '¿Cuánto tiempo tarda en ser rentable el negocio?', answer: 'Con una buena ubicación y siguiendo nuestras recomendaciones, la mayoría de nuestros asociados alcanzan el punto de equilibrio entre los 6 y 12 primeros meses. La rentabilidad completa suele llegar a partir del segundo año.' },
  { question: '¿Puedo elegir las marcas y modelos de vehículos?', answer: 'Sí, tienes total libertad para elegir tu flota. Nosotros te asesoramos sobre las mejores opciones según tu mercado y te damos acceso a nuestros acuerdos con fabricantes y empresas de renting.' },
  { question: '¿Qué comisiones o royalties tengo que pagar?', answer: 'Nuestro modelo es transparente: hay una cuota mensual fija por el uso del software y soporte, más una pequeña comisión por las reservas que lleguen a través de canales compartidos. No hay royalties sobre tu facturación.' },
  { question: '¿Tendré exclusividad en mi zona?', answer: 'Sí, garantizamos exclusividad territorial. No abriremos ni apoyaremos la apertura de otro asociado en tu zona de influencia definida en el contrato.' },
  { question: '¿Qué tipo de soporte recibiré después de abrir?', answer: 'Recibirás soporte continuo: acceso 24/7 a nuestro equipo técnico, actualizaciones de software, formación continua, acceso a nuevos acuerdos de flota, y reuniones periódicas de seguimiento con tu consultor asignado.' },
  { question: '¿Puedo tener una marca propia o debo usar Alkilator?', answer: 'Puedes crear tu propia marca. Nosotros te proporcionamos toda la infraestructura tecnológica y operativa, pero la imagen de cara al cliente puede ser completamente tuya.' },
];

const testimonials = [
  { name: 'Carlos Martínez', company: 'RentCar Málaga', text: 'Empecé hace 3 años sin ninguna experiencia en el sector. Gracias al apoyo de Alkilator, hoy tengo una flota de 40 vehículos y facturo más de 500.000€ al año.', years: 3, fleet: 40 },
  { name: 'María García', company: 'AutoRent Valencia', text: 'La formación inicial fue clave. Me enseñaron todo lo que necesitaba saber y el soporte continuo me ha ayudado a superar cada obstáculo.', years: 2, fleet: 25 },
  { name: 'Antonio López', company: 'Rent & Go Sevilla', text: 'Lo mejor es el sistema de gestión. Es muy intuitivo y me permite controlar todo el negocio desde el móvil. No podría trabajar sin él.', years: 4, fleet: 60 },
];

const statsBar = [
  { value: '20+', label: 'Años de experiencia', sub: 'en el sector' },
  { value: '50+', label: 'Empresas creadas', sub: 'con nuestro apoyo' },
  { value: '2.000+', label: 'Vehículos gestionados', sub: 'en la red' },
  { value: '98%', label: 'Tasa de éxito', sub: 'de nuestros asociados' },
];

export default function FranchisePage() {
  return (
    <div className="min-h-screen">
      {/* Hero — gradiente azul con toques verdes, texto blanco */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-br from-primary via-primary to-secondary/40 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-90" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-secondary/90 text-white border-white/20 backdrop-blur-sm px-4 py-1.5 text-sm font-medium shadow-lg shadow-secondary/30">
              <Award className="h-4 w-4 mr-1.5 inline" />
              Más de 20 años de experiencia
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
              Tu franquicia de{' '}
              <span className="text-secondary-200">rent a car</span>
              <br />
              con respaldo experto
            </h1>
            <p className="text-lg md:text-xl text-white/95 mb-10 max-w-2xl mx-auto">
              Te proporcionamos todo lo necesario para emprender en el sector del alquiler de vehículos:
              tecnología, formación, acuerdos de flota y soporte continuo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="#contacto">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white px-8 h-12 text-base font-semibold shadow-lg shadow-secondary/40">
                  Solicitar información
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/20 bg-transparent h-12 text-base">
                <Play className="h-5 w-5 mr-2" />
                Ver vídeo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Barra de números — fondo verde, texto blanco (contraste con hero azul) */}
      <section className="py-8 lg:py-10 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {statsBar.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-sm font-semibold text-white/90 mt-1">{stat.label}</p>
                <p className="text-xs text-white/60">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qué ofrecemos — fondo azul suave, texto oscuro para contraste */}
      <section className="py-16 lg:py-24 bg-primary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-primary text-white border-0 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              Todo incluido
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-primary">
              Todo lo que necesitas para triunfar
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto text-lg">
              Te proporcionamos las herramientas, la formación y el soporte necesarios
              para que puedas centrarte en hacer crecer tu negocio.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card
                key={index}
                className={cn(
                  'border-2 bg-white shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col overflow-hidden',
                  service.highlighted
                    ? 'border-secondary/50 hover:border-secondary ring-2 ring-secondary/20'
                    : 'border-primary/20 hover:border-primary/40'
                )}
              >
                <CardHeader>
                  <div
                    className={cn(
                      'h-12 w-12 rounded-xl flex items-center justify-center mb-4',
                      service.highlighted ? 'bg-secondary/20 text-secondary' : 'bg-primary/15 text-primary'
                    )}
                  >
                    <service.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                    {service.title}
                    {service.highlighted && (
                      <Badge className="bg-secondary text-white border-0 text-xs">Destacado</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 className={cn('h-4 w-4 shrink-0', service.highlighted ? 'text-secondary' : 'text-primary')} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Por qué Alkilator — fondo verde suave, texto oscuro */}
      <section className="py-16 lg:py-24 bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-secondary text-white border-0 px-3 py-1 text-xs font-semibold">
                ¿Por qué nosotros?
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">
                Más de 20 años{' '}
                <span className="text-secondary">creando empresarios de éxito</span>
              </h2>
              <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                No somos solo un proveedor de software. Somos tu partner estratégico.
                Hemos ayudado a más de 50 emprendedores a montar su negocio de alquiler
                de vehículos con una tasa de éxito del 98%.
              </p>
              <ul className="space-y-4">
                {[
                  'Experiencia real en el sector, no solo teoría',
                  'Acompañamiento personalizado desde el primer día',
                  'Acceso a acuerdos exclusivos de flota',
                  'Tecnología propia desarrollada durante 20 años',
                  'Red de contactos en el sector',
                  'Formación continua y actualizaciones',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-800">
                    <div className="h-6 w-6 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-secondary" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-white shadow-xl border-2 border-primary/20">
                <Sparkles className="h-12 w-12 text-secondary-200 mb-6" />
                <h3 className="text-2xl font-bold mb-4 text-white">Formación: Nuestra prioridad</h3>
                <p className="text-white/95 mb-6">
                  Creemos firmemente que la formación es la clave del éxito. Por eso,
                  nuestro programa de formación es el más completo del sector:
                </p>
                <ul className="space-y-3">
                  {[
                    'Formación inicial presencial de 2 semanas',
                    'Manuales operativos detallados',
                    'Vídeos tutoriales de todas las funciones',
                    'Webinars mensuales de actualización',
                    'Acceso a comunidad de empresarios',
                    'Mentor asignado durante el primer año',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-white/95">
                      <CheckCircle2 className="h-4 w-4 text-secondary-200 shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute -z-10 -top-4 -right-4 w-full h-full bg-secondary/20 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Proceso — fondo azul suave, texto oscuro */}
      <section className="py-16 lg:py-24 bg-primary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-primary text-white border-0 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              Cómo funciona
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-primary">
              6 pasos hacia tu nuevo negocio
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto text-lg">
              Un proceso estructurado y probado para asegurar el éxito de tu empresa desde el primer día.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {process.map((item, index) => (
              <Card key={index} className="border-2 border-primary/25 bg-white shadow-md hover:shadow-xl hover:border-primary/50 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-md shadow-primary/30">
                      {item.step}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios — fondo verde suave, texto oscuro */}
      <section className="py-16 lg:py-24 bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-secondary text-white border-0 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              Casos de éxito
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
              Empresarios que ya triunfan con nosotros
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 border-secondary/30 bg-white shadow-md hover:shadow-xl hover:border-secondary/50 overflow-hidden transition-all">
                <CardContent className="pt-6 pb-6">
                  <Quote className="h-8 w-8 text-secondary/40 mb-4" />
                  <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                    <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.company}</p>
                    </div>
                  </div>
                  <div className="flex gap-6 mt-4 text-sm">
                    <div>
                      <p className="text-2xl font-bold text-primary">{testimonial.years}</p>
                      <p className="text-xs text-gray-600">años</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-secondary">{testimonial.fleet}</p>
                      <p className="text-xs text-gray-600">vehículos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — fondo azul suave, texto oscuro */}
      <section className="py-16 lg:py-24 bg-primary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-primary text-white border-0 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              FAQ
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-primary">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full border-2 border-primary/25 rounded-xl overflow-hidden bg-white shadow-md">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-primary/15">
                  <AccordionTrigger className="text-left px-6 py-4 font-semibold text-gray-900 hover:text-primary hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA / Contacto — fondo primary, texto blanco; formulario en card blanco con texto oscuro */}
      <section id="contacto" className="py-16 lg:py-24 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
                ¿Listo para empezar tu aventura empresarial?
              </h2>
              <p className="text-white/90 mb-8 text-lg">
                Da el primer paso hacia tu nuevo negocio. Rellena el formulario y
                nos pondremos en contacto contigo en menos de 24 horas para
                resolver todas tus dudas.
              </p>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Teléfono</p>
                    <a href="tel:+34900123456" className="font-semibold text-white hover:text-accent transition-colors">
                      +34 900 123 456
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Email</p>
                    <a href="mailto:franquicias@alkilator.com" className="font-semibold text-white hover:text-accent transition-colors">
                      franquicias@alkilator.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Oficina central</p>
                    <p className="font-semibold text-white">Madrid, España</p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="border-0 shadow-xl bg-white overflow-hidden">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-xl font-bold text-gray-900">Solicita información</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Te respondemos en menos de 24 horas</p>
              </CardHeader>
              <CardContent className="pt-6">
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900">Nombre *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900">Apellidos *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Tus apellidos"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Email *</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Teléfono *</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Ciudad donde quieres operar</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Ej: Valencia"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Inversión disponible</label>
                    <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option value="">Selecciona un rango</option>
                      <option value="30-50">30.000€ - 50.000€</option>
                      <option value="50-100">50.000€ - 100.000€</option>
                      <option value="100-200">100.000€ - 200.000€</option>
                      <option value="200+">Más de 200.000€</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Mensaje (opcional)</label>
                    <textarea
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      rows={3}
                      placeholder="Cuéntanos más sobre tu proyecto..."
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" id="privacy" className="mt-1 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="privacy" className="text-sm text-gray-600">
                      Acepto la política de privacidad y el tratamiento de mis datos
                    </label>
                  </div>
                  <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold">
                    Enviar solicitud
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
