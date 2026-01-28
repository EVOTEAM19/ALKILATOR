import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  MapPin,
  Shield,
  Check,
  Phone,
  Mail,
  Award,
  Building2,
  Sparkles,
  ArrowRight,
  Play,
  Star,
  Globe,
  Target,
  GraduationCap,
  MessageSquare,
  Navigation,
  Key,
  Layers,
  Monitor,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AnimatedWaves } from '@/components/shared/AnimatedWaves';
import { ProcessTimeline } from '@/components/franchise/ProcessTimeline';
import { SEOHead } from '@/components/shared/SEOHead';

const SERVICES = [
  { icon: Layers, title: 'Gestión de Flota Completa', description: 'Sistema integral para gestionar todos tus vehículos: disponibilidad, mantenimientos, ITVs, seguros y documentación en un solo lugar.', features: ['Control de kilometraje', 'Alertas de mantenimiento', 'Historial completo', 'Gestión de daños'], color: 'from-blue-500 to-blue-600' },
  { icon: Car, title: 'Acuerdos de Flota', description: 'Acceso a acuerdos exclusivos con fabricantes y empresas de renting para conseguir los mejores precios en vehículos.', features: ['Descuentos exclusivos', 'Condiciones preferentes', 'Variedad de marcas', 'Renting y compra'], color: 'from-green-500 to-green-600' },
  { icon: Monitor, title: 'Programa de Gestión Profesional', description: 'Software completo y profesional para gestionar reservas, contratos, facturación y contabilidad de tu negocio.', features: ['Reservas online', 'Contratos digitales', 'Facturación automática', 'Informes y estadísticas'], color: 'from-purple-500 to-purple-600' },
  { icon: Globe, title: 'Incorporación a Alkilator con reservas', description: 'Al unirte a Alkilator puedes recibir ofertas y reservas desde la central y desde buscadores. Más visibilidad y más clientes para tu negocio.', features: ['Ofertas desde central', 'Reservas desde buscadores', 'Mayor visibilidad', 'Más clientes'], color: 'from-teal-500 to-teal-600', highlight: true },
  { icon: Target, title: 'Asesoramiento Comercial', description: 'Te ayudamos a definir tu estrategia comercial, tarifas, promociones y posicionamiento en el mercado.', features: ['Estudio de mercado', 'Definición de tarifas', 'Estrategia de precios', 'Marketing digital'], color: 'from-orange-500 to-orange-600' },
  { icon: Shield, title: 'Negociación de Seguros', description: 'Negociamos con las mejores compañías aseguradoras para conseguir coberturas óptimas al mejor precio.', features: ['Pólizas de flota', 'Coberturas completas', 'Precios competitivos', 'Gestión de siniestros'], color: 'from-red-500 to-red-600' },
  { icon: Navigation, title: 'Dispositivos GPS', description: 'Sistema de localización GPS para toda tu flota con seguimiento en tiempo real y alertas personalizadas.', features: ['Localización 24/7', 'Historial de rutas', 'Alertas de velocidad', 'Geovallas'], color: 'from-cyan-500 to-cyan-600' },
  { icon: Key, title: 'Alquiler sin Llave (Keyless)', description: 'Tecnología de apertura y arranque sin llave física. Tus clientes pueden recoger y devolver vehículos de forma autónoma.', features: ['Apertura con app', 'Sin intervención', 'Disponibilidad 24/7', 'Reducción de costes'], color: 'from-indigo-500 to-indigo-600' },
  { icon: GraduationCap, title: 'Formación Completa', description: 'Programa de formación integral para ti y tu equipo. Desde operativa diaria hasta estrategia de negocio.', features: ['Formación inicial', 'Actualizaciones continuas', 'Materiales de apoyo', 'Certificación'], color: 'from-pink-500 to-pink-600', highlight: true },
  { icon: Globe, title: 'Página Web de Reservas', description: 'Web profesional y personalizada con motor de reservas integrado, optimizada para convertir visitantes en clientes.', features: ['Diseño personalizado', 'SEO optimizado', 'Reservas online', 'Responsive'], color: 'from-teal-500 to-teal-600' },
];

const FAQS = [
  { question: '¿Cuánto capital inicial necesito para empezar?', answer: 'Nuestro soporte, formación y conocimientos (software, metodología y acompañamiento) tienen un coste de unos 6.000€. A eso hay que sumar los gastos de flota, arrendamientos de vehículos y demás costes operativos según el tamaño que quieras dar a tu negocio. Lo nuestro —el paquete Alkilator— cuesta eso.' },
  { question: '¿Necesito experiencia previa en el sector?', answer: 'No es necesario. Nuestro programa de formación está diseñado para enseñarte todo lo que necesitas saber, desde cero. Muchos de nuestros casos de éxito empezaron sin ninguna experiencia en el sector.' },
  { question: '¿Cuánto tiempo tarda en ser rentable el negocio?', answer: 'Con una gestión adecuada y siguiendo nuestras recomendaciones, la mayoría de negocios alcanzan el punto de equilibrio entre 6 y 12 meses. La rentabilidad depende de factores como ubicación, tamaño de flota y estrategia comercial.' },
  { question: '¿Puedo elegir las marcas y modelos de vehículos?', answer: 'Sí, tienes total libertad para elegir tu flota. Te asesoramos sobre qué vehículos funcionan mejor en tu zona y te damos acceso a nuestros acuerdos con fabricantes y empresas de renting.' },
  { question: '¿Qué comisiones o royalties tengo que pagar?', answer: 'No cobramos royalties ni comisiones sobre tus ingresos. Solo pagas una cuota mensual por el uso del software y los servicios incluidos. Precio fijo, sin sorpresas.' },
  { question: '¿Tendré exclusividad en mi zona?', answer: 'Sí, garantizamos exclusividad territorial. No trabajaremos con ningún otro emprendedor en tu zona geográfica definida.' },
  { question: '¿Qué tipo de soporte recibiré después de abrir?', answer: 'Tendrás soporte técnico 24/7 para el software, un mentor asignado durante el primer año, acceso a webinars mensuales de actualización y una comunidad de otros empresarios del sector.' },
  { question: '¿Puedo tener una marca propia o debo usar Alkilator?', answer: 'Puedes usar tu propia marca. Te proporcionamos el software y los servicios en marca blanca. Tu negocio, tu marca, tu identidad.' },
];

function ServiceCard({ service }: { service: (typeof SERVICES)[0] }) {
  return (
    <div className={cn('group relative h-full flex flex-col bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300', service.highlight && 'ring-2 ring-secondary ring-offset-2')}>
      {service.highlight && (
        <div className="absolute -top-3 left-6 px-3 py-1 bg-secondary text-white text-xs font-bold rounded-full">Destacado</div>
      )}
      <div className={cn('w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4', service.color)}>
        <service.icon className="h-7 w-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2 shrink-0">{service.title}</h3>
      <p className="text-gray-600 mb-4 flex-1 min-h-0">{service.description}</p>
      <ul className="space-y-2 shrink-0">
        {service.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-secondary flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CrearEmpresaAlquilerPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    ciudad: '',
    inversion: '',
    mensaje: '',
    acepto: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <>
      <SEOHead
        title="Crea tu Empresa de Alquiler de Coches y Furgonetas | Franquicia Rent a Car"
        description="Monta tu negocio de alquiler de vehículos con el respaldo de expertos. 20+ años de experiencia, software incluido, formación completa y sin royalties. Solicita información."
        keywords={['crear empresa alquiler coches', 'montar rent a car', 'franquicia alquiler coches', 'franquicia rent a car', 'negocio alquiler furgonetas', 'emprender alquiler vehiculos', 'software rent a car', 'crear empresa alquiler furgonetas']}
      />

      {/* HERO — fondo azul, texto blanco; contenido centrado y equilibrado */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-primary via-primary to-primary/90 overflow-hidden">
        <AnimatedWaves variant="hero" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center justify-items-center">
            <div className="flex flex-col justify-center text-center lg:text-left w-full max-w-xl mx-auto lg:mx-0">
              <div className="inline-flex items-center justify-center lg:justify-start gap-2 bg-secondary/20 border border-secondary/30 rounded-full px-4 py-2 mb-6 w-fit mx-auto lg:mx-0">
                <Award className="h-4 w-4 text-secondary shrink-0" />
                <span className="text-sm font-medium text-secondary">Más de 20 años de experiencia</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-primary-100">
                Tu franquicia de
                <span className="block text-secondary">rent a car</span>
                con respaldo experto
              </h1>
              <p className="text-xl text-primary-100/95 mb-8 max-w-xl mx-auto lg:mx-0">
                Te proporcionamos todo lo necesario para emprender en el sector del alquiler de vehículos: tecnología, formación, acuerdos de flota y soporte continuo.
              </p>
              <div className="flex flex-wrap gap-4 mb-10 justify-center lg:justify-start">
                <a href="#contacto">
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-bold shadow-lg !bg-[#00CC66] hover:!bg-[#00B35C]">
                    Solicitar información
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </a>
                <Link to="/presentacion" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-2 border-secondary text-secondary hover:bg-secondary/15 bg-transparent">
                    <FileText className="h-5 w-5 mr-2" />
                    Ver Documento
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center lg:justify-items-start">
                {[
                  { value: '20+', label: 'Años de experiencia', sublabel: 'en el sector' },
                  { value: '50+', label: 'Empresas creadas', sublabel: 'con nuestro apoyo' },
                  { value: '2.000+', label: 'Vehículos gestionados', sublabel: 'en la red' },
                  { value: '98%', label: 'Tasa de éxito', sublabel: 'de nuestros asociados' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <div className="text-3xl sm:text-4xl font-bold text-secondary">{stat.value}</div>
                    <div className="text-sm text-primary-100">{stat.label}</div>
                    <div className="text-xs text-primary-200">{stat.sublabel}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative w-full max-w-lg mx-auto lg:mx-0">
              <div className="aspect-video rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden shadow-xl">
                <img src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800" alt="Flota de vehículos" className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button type="button" className="w-20 h-20 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center hover:bg-white/35 transition-colors group border-2 border-white/40">
                    <Play className="h-8 w-8 text-white ml-1 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Todo incluido</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Todo lo que necesitas para triunfar</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Te proporcionamos las herramientas, la formación y el soporte necesarios para que puedas centrarte en hacer crecer tu negocio.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch">
            {SERVICES.map((service, index) => (
              <div
                key={service.title}
                className={cn(
                  'min-w-0 h-full flex',
                  index === SERVICES.length - 1 && 'lg:col-start-2 xl:col-start-auto'
                )}
              >
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUÉ NOSOTROS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-secondary/10 rounded-full px-4 py-2 mb-4">
                <Star className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">¿Por qué nosotros?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Más de 20 años creando empresarios de éxito</h2>
              <p className="text-lg text-gray-600 mb-8">
                No somos solo un proveedor de software. Somos tu partner estratégico. Hemos ayudado a más de 50 emprendedores a montar su negocio de alquiler de vehículos con una tasa de éxito del 98%.
              </p>
              <ul className="space-y-4 mb-8">
                {['Experiencia real en el sector, no solo teoría', 'Acompañamiento personalizado desde el primer día', 'Acceso a acuerdos exclusivos de flota', 'Tecnología propia desarrollada durante 20 años', 'Red de contactos en el sector', 'Formación continua y actualizaciones'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Formación: Nuestra prioridad</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Creemos firmemente que la formación es la clave del éxito. Por eso, nuestro programa de formación es el más completo del sector:
              </p>
              <ul className="space-y-3">
                {['Formación inicial', 'Manuales operativos detallados', 'Vídeos tutoriales de todas las funciones', 'Asesoramiento comercial', 'Acceso a comunidad de empresarios', 'Mentor asignado durante el primer año'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-700">
                    <Check className="h-5 w-5 text-secondary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESO ESTILO FASTIA (timeline zigzag) */}
      <ProcessTimeline />

      {/* FAQ — compacta y ordenada */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <MessageSquare className="h-3.5 w-3.5" />
              FAQ
            </span>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">Preguntas frecuentes</h2>
            <p className="mt-1 text-sm text-gray-500">Resolvemos tus dudas más habituales</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <Accordion type="single" collapsible className="divide-y divide-gray-100">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-0 px-4 sm:px-5">
                  <AccordionTrigger className="text-left text-sm font-semibold text-gray-900 hover:no-underline py-3.5 [&[data-state=open]]:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 leading-relaxed pb-3.5 pt-0">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="py-20 bg-gradient-to-br from-primary via-primary to-primary/90 relative overflow-hidden">
        <AnimatedWaves variant="section" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="text-secondary">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">¿Listo para empezar tu aventura empresarial?</h2>
              <p className="text-xl text-secondary/95 mb-8">
                Da el primer paso hacia tu nuevo negocio. Rellena el formulario y nos pondremos en contacto contigo en menos de 24 horas.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <div className="text-sm text-secondary/80">Teléfono</div>
                    <div className="text-lg font-semibold">+34 900 123 456</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <div className="text-sm text-secondary/80">Email</div>
                    <div className="text-lg font-semibold">franquicias@alkilator.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <div className="text-sm text-secondary/80">Oficina central</div>
                    <div className="text-lg font-semibold">Madrid, España</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Solicita información</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input id="nombre" placeholder="Tu nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellidos">Apellidos *</Label>
                    <Input id="apellidos" placeholder="Tus apellidos" value={formData.apellidos} onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="tu@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input id="telefono" placeholder="+34 600 000 000" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad donde quieres operar</Label>
                  <Input id="ciudad" placeholder="Ej: Valencia" value={formData.ciudad} onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inversion">Inversión disponible</Label>
                  <Select value={formData.inversion} onValueChange={(value) => setFormData({ ...formData, inversion: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rango" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="menos-30k">Menos de 30.000€</SelectItem>
                      <SelectItem value="30k-50k">30.000€ - 50.000€</SelectItem>
                      <SelectItem value="50k-100k">50.000€ - 100.000€</SelectItem>
                      <SelectItem value="mas-100k">Más de 100.000€</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mensaje">Mensaje (opcional)</Label>
                  <Textarea id="mensaje" placeholder="Cuéntanos más sobre tu proyecto..." rows={3} value={formData.mensaje} onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })} />
                </div>
                <div className="flex items-start gap-2">
                  <input type="checkbox" id="acepto" checked={formData.acepto} onChange={(e) => setFormData({ ...formData, acepto: e.target.checked })} className="mt-1" required />
                  <Label htmlFor="acepto" className="text-sm text-gray-600 font-normal">Acepto la política de privacidad y el tratamiento de mis datos</Label>
                </div>
                <Button type="submit" className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white font-bold text-lg">
                  Enviar solicitud
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
