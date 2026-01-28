import { useState } from 'react'
import { Link } from 'react-router-dom'
import alkilatorLogoImg from '../../../supabase/Alkilator_logo.png'
import {
  Download, ChevronLeft, ChevronRight,
  Building2, Target, Package,
  GraduationCap, Euro, CheckCircle, Users,
  Car, Truck, Shield, TrendingUp, Clock, Award,
  HelpCircle,
  Globe, ArrowRight, Layers,
  MapPin, Key, Navigation,
  BarChart3, CreditCard, Mail, Phone,
  Rocket, Star, Sparkles, CheckCircle2,
  FileText, Monitor, MessageSquare,
  Calendar, Wrench, FileSignature, Database,
  Smartphone, AlertTriangle, Receipt,
  Search, Bot, Bell, BarChart, Gauge,
  PieChart, Megaphone, Lock, Wifi,
  BookOpen, Handshake, Scale, FileCheck,
  Store, ParkingCircle, MapPinned, Landmark,
  UserCheck, ClipboardList, Calculator,
  Image, Settings, Send, RefreshCw,
  Wallet, ShieldCheck, CarFront, FileSpreadsheet,
  Banknote, TrendingDown, Activity, Zap
} from 'lucide-react'

// ==================== COMPONENTES ====================

const AlkilatorLogo = ({ size = 'normal' }: { size?: 'small' | 'normal' | 'large' }) => {
  const sizes = {
    small: { container: 'w-24 h-24' },
    normal: { container: 'w-32 h-32' },
    large: { container: 'w-40 h-40' }
  }
  const s = sizes[size]

  return (
    <img
      src={alkilatorLogoImg}
      alt="Alkilator"
      className={`${s.container} object-contain object-center flex-shrink-0`}
    />
  )
}

const SlideHeader = ({ title, icon: Icon }: { title: string; icon?: React.ElementType }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="w-1.5 h-10 bg-gradient-to-b from-[#0066CC] to-[#00CC66] rounded-full"></div>
      {Icon && (
        <div className="w-10 h-10 bg-gradient-to-br from-[#0066CC] to-[#0052A3] rounded-xl flex items-center justify-center shadow-lg">
          <Icon className="w-5 h-5 text-white" />
        </div>
      )}
      <h2 className="text-xl md:text-2xl font-bold text-[#003366]">{title}</h2>
    </div>
    <AlkilatorLogo size="small" />
  </div>
)

const CarSilhouette = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 200 80" className={className} fill="currentColor">
    <path d="M180 55c0-2.8-2.2-5-5-5h-10l-15-25c-2-3.5-5.5-5-9-5H59c-3.5 0-7 1.5-9 5L35 50H25c-2.8 0-5 2.2-5 5v10c0 2.8 2.2 5 5 5h5c0 8.3 6.7 15 15 15s15-6.7 15-15h80c0 8.3 6.7 15 15 15s15-6.7 15-15h5c2.8 0 5-2.2 5-5V55zM45 75c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10zm110 0c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10zM55 45l12-20h66l12 20H55z"/>
  </svg>
)

const VanSilhouette = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 200 80" className={className} fill="currentColor">
    <path d="M185 50h-15V25c0-5.5-4.5-10-10-10H40c-5.5 0-10 4.5-10 10v25H15c-2.8 0-5 2.2-5 5v10c0 2.8 2.2 5 5 5h5c0 8.3 6.7 15 15 15s15-6.7 15-15h100c0 8.3 6.7 15 15 15s15-6.7 15-15h5c2.8 0 5-2.2 5-5V55c0-2.8-2.2-5-5-5zM35 75c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10zm115 0c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10zM160 45H40V25h120v20zm-80-15H50v10h30V30zm40 0H90v10h30V30z"/>
  </svg>
)

const StatCard = ({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) => (
  <div className="bg-white/90 rounded-xl p-3 text-center shadow-md hover:shadow-lg transition-all">
    <Icon className="w-5 h-5 text-[#0066CC] mx-auto mb-1" />
    <div className="text-xl font-bold text-[#003366]">{value}</div>
    <div className="text-xs text-gray-500">{label}</div>
  </div>
)

const SoftwareFeatureCard = ({ icon: Icon, title, description, color = 'blue' }: {
  icon: React.ElementType;
  title: string;
  description: string;
  color?: 'blue' | 'green'
}) => {
  const colors = {
    blue: { bg: 'from-[#0066CC] to-[#0052A3]', border: 'border-[#0066CC]/20' },
    green: { bg: 'from-[#00CC66] to-[#00A352]', border: 'border-[#00CC66]/20' }
  }
  const c = colors[color]

  return (
    <div className={`bg-white rounded-lg p-2.5 shadow-sm border ${c.border} hover:shadow-md transition-all`}>
      <div className="flex items-start gap-2">
        <div className={`w-7 h-7 bg-gradient-to-br ${c.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-[#003366] leading-tight">{title}</h4>
          <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  )
}

const ServiceDetailCard = ({ icon: Icon, title, description, features, color = 'blue', highlighted = false }: {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  color?: 'blue' | 'green';
  highlighted?: boolean;
}) => {
  const colors = {
    blue: { bg: 'from-[#0066CC] to-[#0052A3]', check: 'text-[#0066CC]' },
    green: { bg: 'from-[#00CC66] to-[#00A352]', check: 'text-[#00CC66]' }
  }
  const c = colors[color]

  return (
    <div className={`bg-white rounded-xl p-3 shadow-md hover:shadow-lg transition-all ${highlighted ? 'ring-2 ring-[#00CC66]' : ''}`}>
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-8 h-8 bg-gradient-to-br ${c.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#003366]">{title}</h4>
          {highlighted && <span className="text-[10px] text-[#00CC66] font-medium">Destacado</span>}
        </div>
      </div>
      <p className="text-[10px] text-gray-600 mb-2 leading-relaxed">{description}</p>
      <div className="grid grid-cols-2 gap-1">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-1 text-[10px] text-gray-600">
            <CheckCircle className={`w-2.5 h-2.5 ${c.check} flex-shrink-0`} />
            <span className="truncate">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const TimelineItem = ({ phase, title, duration, description, items }: {
  phase: string;
  title: string;
  duration: string;
  description: string;
  items: string[];
}) => (
  <div className="flex gap-2">
    <div className="flex flex-col items-center">
      <div className="w-7 h-7 bg-gradient-to-br from-[#00CC66] to-[#00A352] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
        {phase}
      </div>
      <div className="w-0.5 flex-1 bg-gradient-to-b from-[#00CC66] to-[#0066CC] mt-1" />
    </div>
    <div className="pb-3 flex-1">
      <div className="flex items-center gap-2 mb-0.5">
        <h4 className="text-xs font-bold text-[#003366]">{title}</h4>
        <span className="px-1.5 py-0.5 bg-[#00CC66]/20 text-[#00A352] text-[10px] rounded-full font-medium">{duration}</span>
      </div>
      <p className="text-[10px] text-gray-600 mb-1">{description}</p>
      <div className="flex flex-wrap gap-1">
        {items.map((item, idx) => (
          <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded">{item}</span>
        ))}
      </div>
    </div>
  </div>
)

// ==================== COMPONENTE PRINCIPAL ====================

export default function PresentacionPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = 7

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  const goToSlide = (index: number) => setCurrentSlide(index)

  const handleDownloadPDF = () => {
    window.print()
  }

  const slideNames = [
    'Portada', 'Quiénes Somos', '¿Dudas?', 'Qué Ofrecemos', 'Software 360',
    'Servicios', 'Proceso, requisitos e inversión'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-6 print:p-0">
      <div className="max-w-7xl mx-auto">
        {/* Controles - ocultos al imprimir */}
        <div className="mb-4 flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-md border border-gray-100 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="p-2 bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-[#003366] font-medium">
              {currentSlide + 1} / {totalSlides}
            </span>
            <button
              onClick={nextSlide}
              disabled={currentSlide === totalSlides - 1}
              className="p-2 bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-gray-500">{slideNames[currentSlide]}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/crear-empresa-alquiler"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#00CC66] hover:bg-[#00A352] text-white rounded-lg font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Solicitar info
            </Link>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-3 py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* Navegación por puntos - oculta al imprimir */}
        <div className="mb-4 flex flex-wrap gap-1.5 justify-center print:hidden">
          {slideNames.map((name, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all ${
                currentSlide === index
                  ? 'bg-[#0066CC] w-8'
                  : 'bg-gray-300 hover:bg-gray-400 w-2.5'
              }`}
              title={name}
            />
          ))}
        </div>

        {/* Presentación */}
        <div className="bg-gradient-to-br from-[#f0f7ff] via-white to-[#f0fff4] rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="aspect-[16/9] p-5 md:p-6 relative overflow-hidden">

            {/* ==================== SLIDE 0 - PORTADA ==================== */}
            {currentSlide === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0066CC] via-[#00CC66] to-[#0066CC]"></div>

                <div className="absolute top-10 left-10 opacity-10">
                  <CarSilhouette className="w-32 h-32 text-[#0066CC]" />
                </div>
                <div className="absolute bottom-10 right-10 opacity-10">
                  <VanSilhouette className="w-40 h-40 text-[#00CC66]" />
                </div>
                <div className="absolute top-20 right-20 w-20 h-20 rounded-full bg-[#0066CC]/5 blur-2xl"></div>
                <div className="absolute bottom-20 left-20 w-32 h-32 rounded-full bg-[#00CC66]/5 blur-2xl"></div>

                <div className="absolute top-16 left-24 p-3 bg-white/80 rounded-xl shadow-md animate-pulse">
                  <Car className="w-6 h-6 text-[#0066CC]" />
                </div>
                <div className="absolute bottom-24 left-16 p-3 bg-white/80 rounded-xl shadow-md">
                  <Truck className="w-6 h-6 text-[#00CC66]" />
                </div>
                <div className="absolute top-24 right-16 p-3 bg-white/80 rounded-xl shadow-md">
                  <Key className="w-6 h-6 text-[#0066CC]" />
                </div>
                <div className="absolute bottom-16 right-24 p-3 bg-white/80 rounded-xl shadow-md animate-pulse">
                  <MapPin className="w-6 h-6 text-[#00CC66]" />
                </div>

                <div className="mb-6 flex items-center justify-center z-10">
                  <img
                    src={alkilatorLogoImg}
                    alt="Alkilator"
                    className="w-64 h-64 md:w-80 md:h-80 object-contain object-center flex-shrink-0"
                  />
                </div>

                <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold text-[#003366] mb-4 leading-tight z-10">
                  Monta tu Empresa de<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066CC] to-[#00CC66]">
                    Alquiler de Vehículos
                  </span>
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-[#0066CC] to-[#00CC66] mx-auto mb-4 rounded-full"></div>
                <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-2xl z-10">
                  Todo lo que necesitas para emprender con éxito en el sector del alquiler de coches y furgonetas
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 mb-6 z-10">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-gray-100">
                    <Award className="w-5 h-5 text-[#0066CC]" />
                    <span className="text-sm text-gray-700 font-medium">+20 años experiencia</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-gray-100">
                    <Building2 className="w-5 h-5 text-[#00CC66]" />
                    <span className="text-sm text-gray-700 font-medium">+50 empresas creadas</span>
                  </div>
                </div>

                <div className="px-6 py-3 bg-gradient-to-r from-[#0066CC] to-[#00CC66] text-white rounded-xl inline-flex items-center gap-3 shadow-xl z-10">
                  <Rocket className="w-5 h-5" />
                  <p className="text-lg font-semibold">Tu negocio, nuestro respaldo</p>
                </div>
              </div>
            )}

            {/* ==================== SLIDE 1 - QUIÉNES SOMOS ==================== */}
            {currentSlide === 1 && (
              <div className="h-full flex flex-col">
                <SlideHeader title="¿Quiénes Somos?" icon={Building2} />

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <p className="text-sm text-gray-700 leading-relaxed mb-3">
                        <span className="text-[#0066CC] font-bold">Alkilator</span> es una marca española fundada y dirigida por profesionales con una experiencia de más de <span className="font-semibold">20 años en el sector del alquiler de vehículos</span>, con una visión de futuro basada en la unión de empresas dentro de una misma Red Comercial.
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed mb-3">
                        Estamos desarrollando un ambicioso proyecto con el fin de atender las necesidades de nuestros clientes en un amplio territorio de la geografía española, basándonos en las estrategias más efectivas del sector.
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Nuestra filosofía se centra en la <span className="text-[#00CC66] font-medium">continua rotación y renovación de la flota</span>, lo que permite mantener los vehículos siempre en perfecto estado de uso.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <StatCard value="20+" label="Años experiencia" icon={Award} />
                      <StatCard value="50+" label="Empresas creadas" icon={Building2} />
                      <StatCard value="2.000+" label="Vehículos gestionados" icon={Car} />
                      <StatCard value="2.000+" label="Reservas gestionadas" icon={Calendar} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white rounded-xl p-3 shadow-md">
                        <Car className="w-6 h-6 text-[#0066CC] mb-2" />
                        <h4 className="text-sm font-bold text-[#003366]">Coches</h4>
                        <p className="text-xs text-gray-500">Económicos, compactos, SUV, premium</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-md">
                        <Truck className="w-6 h-6 text-[#00CC66] mb-2" />
                        <h4 className="text-sm font-bold text-[#003366]">Furgonetas</h4>
                        <p className="text-xs text-gray-500">Pequeñas, medianas y grandes</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-md">
                        <Globe className="w-6 h-6 text-[#00CC66] mb-2" />
                        <h4 className="text-sm font-bold text-[#003366]">Tu propia marca</h4>
                        <p className="text-xs text-gray-500">Usa tu marca o únete a Alkilator</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-md">
                        <Users className="w-6 h-6 text-[#0066CC] mb-2" />
                        <h4 className="text-sm font-bold text-[#003366]">Red Comercial</h4>
                        <p className="text-xs text-gray-500">Expansión por toda España</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-[#0066CC]/10 to-[#00CC66]/10 rounded-xl p-4 border border-[#0066CC]/20">
                      <h4 className="text-[#003366] font-bold mb-2 flex items-center gap-2">
                        <Star className="w-5 h-5 text-[#00CC66]" />
                        ¿Por qué elegirnos?
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {['Know-how probado', 'Sin royalties', 'Formación completa', 'Software incluido', 'Acuerdos de flota', 'Exclusividad territorial'].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-[#00CC66]" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== SLIDE 2 - DUDAS ==================== */}
            {currentSlide === 2 && (
              <div className="h-full flex flex-col">
                <SlideHeader title="¿Dudas para montar un Rent a Car?" icon={HelpCircle} />

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <h4 className="text-[#0066CC] font-bold mb-3 flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      Cuestiones legales y normativas
                    </h4>
                    <ul className="space-y-2">
                      {[
                        '¿Qué normativa legal regula esta actividad?',
                        '¿Cuántos vehículos me obliga la ley a tener?',
                        '¿Qué responsabilidades operativas, comerciales o penales tengo?',
                        '¿Qué tipos de contratos debo utilizar?',
                        '¿Cómo debo actuar ante un vehículo robado?',
                      ].map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                          <span className="text-[#0066CC] font-bold mt-0.5">•</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <h4 className="text-[#00CC66] font-bold mb-3 flex items-center gap-2 text-sm">
                      <Calculator className="w-4 h-4" />
                      Gestión económica y comercial
                    </h4>
                    <ul className="space-y-2">
                      {[
                        '¿Quién me elabora una cuenta de explotación?',
                        '¿Cómo elaboro las tarifas y a quién las aplico?',
                        '¿Qué formas de cobro usar para evitar impagados?',
                        '¿Qué depósitos o fianzas debo exigir?',
                        '¿Cómo desarrollo una buena gestión comercial?',
                      ].map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                          <span className="text-[#00CC66] font-bold mt-0.5">•</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <h4 className="text-[#0066CC] font-bold mb-3 flex items-center gap-2 text-sm">
                      <Settings className="w-4 h-4" />
                      Operativa y gestión diaria
                    </h4>
                    <ul className="space-y-2">
                      {[
                        '¿Cómo tramito una reserva? ¿Qué pasos seguir?',
                        '¿Cómo tramitar multas, siniestros, incidencias?',
                        '¿Cómo coordino mi CAR CONTROL?',
                        '¿Cómo implanto el departamento de reservas?',
                        '¿Cómo actuar en alquileres ONE WAY?',
                      ].map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                          <span className="text-[#0066CC] font-bold mt-0.5">•</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <h4 className="text-[#00CC66] font-bold mb-3 flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4" />
                      Seguros y protección
                    </h4>
                    <ul className="space-y-2">
                      {[
                        '¿Qué tipos de seguros debo contratar?',
                        '¿Qué particularidades debe contener la póliza?',
                        '¿Cómo gestiono los siniestros?',
                        '¿Qué franquicias aplicar a los clientes?',
                      ].map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                          <span className="text-[#00CC66] font-bold mt-0.5">•</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <h4 className="text-[#0066CC] font-bold mb-3 flex items-center gap-2 text-sm">
                      <Car className="w-4 h-4" />
                      Flota y proveedores
                    </h4>
                    <ul className="space-y-2">
                      {[
                        '¿Cómo disponer de flota sin gran inversión?',
                        '¿Qué aplicación informática tengo que usar?',
                        '¿Quién puede asesorarme sobre proveedores?',
                        '¿Dónde conseguir cursos de procedimientos?',
                      ].map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                          <span className="text-[#0066CC] font-bold mt-0.5">•</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-[#0066CC] to-[#00CC66] rounded-xl p-4 text-white flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle2 className="w-10 h-10" />
                      <div>
                        <p className="font-bold text-lg">A todas estas dudas...</p>
                        <p className="text-white/90 text-sm">y muchas más consultas</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold">
                      Tendrás respuesta en <span className="underline">Alkilator</span>
                    </p>
                    <p className="text-sm text-white/80 mt-2">
                      Con el respaldo de más de 20 años de experiencia en el sector
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== SLIDE 3 - QUÉ OFRECEMOS ==================== */}
            {currentSlide === 3 && (
              <div className="h-full flex flex-col">
                <SlideHeader title="¿Qué Ofrecemos?" icon={Package} />

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 space-y-3">
                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <h4 className="text-[#003366] font-bold mb-3 text-sm">Servicios para crear tu empresa de alquiler</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { icon: FileText, title: 'Plan económico', desc: 'Cuenta de explotación ajustada a tu actividad' },
                          { icon: Scale, title: 'Normativa legal', desc: 'Asesoramiento completo sobre regulación' },
                          { icon: GraduationCap, title: 'Formación integral', desc: 'Operativa, comercial y gestión' },
                          { icon: Target, title: 'Plan comercial', desc: 'Tarifas, ofertas y captación de clientes' },
                          { icon: Calendar, title: 'Dpto. reservas', desc: 'Estructura y funcionamiento completo' },
                          { icon: Globe, title: 'Página web', desc: 'Diseño con motor de reservas integrado' },
                        ].map((item, idx) => {
                          const Icon = item.icon
                          return (
                            <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                              <Icon className="w-4 h-4 text-[#0066CC] mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-[#003366]">{item.title}</p>
                                <p className="text-[10px] text-gray-500">{item.desc}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white rounded-xl p-3 shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                          <Car className="w-5 h-5 text-[#0066CC]" />
                          <span className="text-xs font-bold text-[#003366]">Adquisición de Flota</span>
                        </div>
                        <p className="text-[10px] text-gray-600 mb-2">Traslado de fórmulas de adquisición de vehículos con las mejores condiciones del mercado.</p>
                        <div className="space-y-1">
                          {['Buy Back con contrato tipo', 'Renting flexible', 'Realquiler entre empresas', 'Lease Back'].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1 text-[10px] text-gray-600">
                              <CheckCircle className="w-2.5 h-2.5 text-[#0066CC]" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-5 h-5 text-[#00CC66]" />
                          <span className="text-xs font-bold text-[#003366]">Seguros</span>
                        </div>
                        <p className="text-[10px] text-gray-600 mb-2">Fórmulas de contratación de seguros y su correcta repercusión al cliente.</p>
                        <div className="space-y-1">
                          {['Qué seguros contratar', 'Cuáles comercializar', 'Pólizas de flota', 'Gestión de siniestros'].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1 text-[10px] text-gray-600">
                              <CheckCircle className="w-2.5 h-2.5 text-[#00CC66]" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-[#0066CC]" />
                          <span className="text-xs font-bold text-[#003366]">Proveedores</span>
                        </div>
                        <p className="text-[10px] text-gray-600 mb-2">Presentación de proveedores básicos y especializados para el desarrollo de tu actividad.</p>
                        <div className="space-y-1">
                          {['Software de gestión', 'Aseguradoras especializadas', 'Corredurías de seguros', 'Proveedores de flota'].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1 text-[10px] text-gray-600">
                              <CheckCircle className="w-2.5 h-2.5 text-[#0066CC]" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-[#0066CC] to-[#00CC66] rounded-xl p-4 text-white">
                      <h4 className="font-bold mb-3 flex items-center gap-2 text-sm">
                        <Sparkles className="w-5 h-5" />
                        Tu marca o la nuestra
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 bg-white/20 rounded-lg p-2">
                          <Globe className="w-5 h-5" />
                          <span className="text-sm">Usa tu propia marca</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 rounded-lg p-2">
                          <Building2 className="w-5 h-5" />
                          <span className="text-sm">O únete a Alkilator</span>
                        </div>
                      </div>
                      <p className="text-xs text-white/80 mt-3">Tú decides tu imagen y posicionamiento en el mercado</p>
                    </div>

                    <div className="bg-[#0066CC]/10 rounded-xl p-3 border border-[#0066CC]/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-[#0066CC]" />
                        <span className="text-sm font-bold text-[#003366]">Guiado por expertos</span>
                      </div>
                      <p className="text-xs text-gray-600">Siempre estarás guiado por la experiencia de Alkilator y los conocimientos adquiridos en más de 20 años en el sector del alquiler de vehículos.</p>
                    </div>

                    <div className="bg-[#00CC66]/10 rounded-xl p-3 border border-[#00CC66]/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-[#00CC66]" />
                        <span className="text-sm font-bold text-[#003366]">45-60 días</span>
                      </div>
                      <p className="text-xs text-gray-600">Tiempo de ejecución aproximado hasta el inicio de tu actividad</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== SLIDE 4 - SOFTWARE 360 ==================== */}
            {currentSlide === 4 && (
              <div className="h-full flex flex-col">
                <SlideHeader title="Software de Gestión 360°" icon={Monitor} />

                <div className="bg-gradient-to-r from-[#0066CC]/10 to-[#00CC66]/10 rounded-xl p-3 mb-3 border border-[#0066CC]/20">
                  <p className="text-sm text-gray-700">
                    Nuestro <span className="font-bold text-[#0066CC]">software de gestión integral 360°</span> te permite gestionar absolutamente todos los aspectos de tu empresa de alquiler de vehículos desde una única plataforma. Desarrollado durante más de 20 años y optimizado específicamente para el sector del rent a car.
                  </p>
                </div>

                <div className="flex-1 grid grid-cols-4 lg:grid-cols-5 gap-2">
                  <SoftwareFeatureCard icon={Globe} title="Gestión Web" description="Motor de reservas online 24/7 integrado en tu web" color="blue" />
                  <SoftwareFeatureCard icon={FileSignature} title="Contratos" description="Generación automática de contratos con firma digital" color="green" />
                  <SoftwareFeatureCard icon={Receipt} title="Contabilidad" description="Gestión contable completa integrada" color="blue" />
                  <SoftwareFeatureCard icon={FileSpreadsheet} title="Facturación" description="Facturación automática y personalizada" color="green" />
                  <SoftwareFeatureCard icon={BarChart3} title="Informes" description="Estadísticas y reportes en tiempo real" color="blue" />
                  <SoftwareFeatureCard icon={Database} title="Clientes" description="CRM completo con historial de clientes" color="green" />
                  <SoftwareFeatureCard icon={Wrench} title="Mantenimientos" description="Alertas y gestión de mantenimientos" color="blue" />
                  <SoftwareFeatureCard icon={Layers} title="Gestión Integral" description="Control total de toda la operativa" color="green" />
                  <SoftwareFeatureCard icon={Megaphone} title="Marketing Digital" description="Herramientas de promoción integradas" color="blue" />
                  <SoftwareFeatureCard icon={Bot} title="Chatbot" description="Atención automática a clientes 24/7" color="green" />
                  <SoftwareFeatureCard icon={CreditCard} title="Gestión Pagos" description="Pasarela de pagos segura integrada" color="blue" />
                  <SoftwareFeatureCard icon={Smartphone} title="App Móvil/Tablet" description="Acceso desde cualquier dispositivo" color="green" />
                  <SoftwareFeatureCard icon={AlertTriangle} title="Siniestros" description="Gestión completa de incidencias" color="blue" />
                  <SoftwareFeatureCard icon={PieChart} title="Análisis Ventas" description="Métricas y KPIs de negocio" color="green" />
                  <SoftwareFeatureCard icon={Navigation} title="Localización GPS" description="Seguimiento de vehículos en tiempo real" color="blue" />
                  <SoftwareFeatureCard icon={Send} title="Comunicados" description="Emails y SMS automáticos a clientes" color="green" />
                  <SoftwareFeatureCard icon={Calendar} title="Calendarios" description="Disponibilidad visual de la flota" color="blue" />
                  <SoftwareFeatureCard icon={Gauge} title="Analíticas" description="Dashboard con indicadores clave" color="green" />
                  <SoftwareFeatureCard icon={Lock} title="Seguridad" description="Encriptación y backups diarios" color="blue" />
                  <SoftwareFeatureCard icon={RefreshCw} title="Actualizaciones" description="Mejoras continuas sin coste extra" color="green" />
                </div>
              </div>
            )}

            {/* ==================== SLIDE 5 - SERVICIOS UNIFICADOS ==================== */}
            {currentSlide === 5 && (
              <div className="h-full flex flex-col">
                <SlideHeader title="Servicios Incluidos" icon={Layers} />

                <div className="flex-1 grid grid-cols-3 lg:grid-cols-4 gap-2">
                  <ServiceDetailCard
                    icon={Layers}
                    title="Gestión de Flota Completa"
                    description="Sistema integral para gestionar todos tus vehículos: disponibilidad, mantenimientos, ITVs, seguros y documentación."
                    features={['Control kilometraje', 'Alertas mantenimiento', 'Historial completo', 'Gestión de daños']}
                    color="blue"
                  />
                  <ServiceDetailCard
                    icon={Handshake}
                    title="Acuerdos de Flota"
                    description="Acceso a acuerdos exclusivos con fabricantes y empresas de renting para conseguir los mejores precios."
                    features={['Descuentos exclusivos', 'Condiciones preferentes', 'Variedad marcas', 'Renting y compra']}
                    color="green"
                  />
                  <ServiceDetailCard
                    icon={Monitor}
                    title="Software Gestión Profesional"
                    description="Software completo para gestionar reservas, contratos, facturación y contabilidad de tu negocio."
                    features={['Reservas online', 'Contratos digitales', 'Facturación auto.', 'Informes estadísticas']}
                    color="blue"
                  />
                  <ServiceDetailCard
                    icon={Building2}
                    title="Incorporación a Alkilator"
                    description="Al unirte puedes recibir ofertas y reservas desde la central y buscadores. Más visibilidad y más clientes."
                    features={['Ofertas central', 'Reservas buscadores', 'Mayor visibilidad', 'Más clientes']}
                    color="green"
                    highlighted
                  />
                  <ServiceDetailCard
                    icon={Target}
                    title="Asesoramiento Comercial"
                    description="Te ayudamos a definir tu estrategia comercial, tarifas, promociones y posicionamiento en el mercado."
                    features={['Estudio mercado', 'Definición tarifas', 'Estrategia precios', 'Marketing digital']}
                    color="blue"
                  />
                  <ServiceDetailCard
                    icon={Shield}
                    title="Negociación de Seguros"
                    description="Negociamos con las mejores compañías aseguradoras para conseguir coberturas óptimas al mejor precio."
                    features={['Pólizas de flota', 'Coberturas completas', 'Precios competitivos', 'Gestión siniestros']}
                    color="green"
                  />
                  <ServiceDetailCard
                    icon={Navigation}
                    title="Dispositivos GPS"
                    description="Sistema de localización GPS para toda tu flota con seguimiento en tiempo real y alertas personalizadas."
                    features={['Localización 24/7', 'Historial rutas', 'Alertas velocidad', 'Geovallas']}
                    color="blue"
                  />
                  <ServiceDetailCard
                    icon={Key}
                    title="Alquiler sin Llave (Keyless)"
                    description="Tecnología de apertura y arranque sin llave física. Tus clientes pueden recoger y devolver de forma autónoma."
                    features={['Apertura con app', 'Sin intervención', 'Disponibilidad 24/7', 'Reducción costes']}
                    color="green"
                  />
                  <ServiceDetailCard
                    icon={GraduationCap}
                    title="Formación Completa"
                    description="Programa de formación integral para ti y tu equipo. Desde operativa diaria hasta estrategia de negocio."
                    features={['Formación inicial', 'Actualizaciones', 'Materiales apoyo', 'Certificación']}
                    color="blue"
                    highlighted
                  />
                  <ServiceDetailCard
                    icon={Globe}
                    title="Página Web de Reservas"
                    description="Web profesional y personalizada con motor de reservas integrado, optimizada para convertir visitantes."
                    features={['Diseño personalizado', 'SEO optimizado', 'Reservas online', 'Pagos integrados']}
                    color="green"
                  />
                  <ServiceDetailCard
                    icon={Scale}
                    title="Asesoramiento Legal"
                    description="Información y asesoramiento sobre la normativa legal que regula la actividad de alquiler de vehículos."
                    features={['Normativa transporte', 'Contratos tipo', 'Responsabilidades', 'Documentación']}
                    color="blue"
                  />
                  <ServiceDetailCard
                    icon={BookOpen}
                    title="Base Documental"
                    description="Tres grandes áreas: Informativa, Jurídica y Operativa. Todos los impresos y documentos que necesitas."
                    features={['Área informativa', 'Área jurídica', 'Área operativa', 'Contratos modelo']}
                    color="green"
                  />
                </div>
              </div>
            )}

            {/* ==================== SLIDE 6 - PROCESO + REQUISITOS + INVERSIÓN + CONTACTO (unificado) ==================== */}
            {currentSlide === 6 && (
              <div className="h-full flex flex-col min-h-0 overflow-y-auto">
                <SlideHeader title="Proceso, requisitos e inversión" icon={Rocket} />

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
                  {/* Columna izquierda: Proceso de incorporación */}
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-[#0066CC] uppercase tracking-wide flex items-center gap-2">
                      <Rocket className="w-3.5 h-3.5" /> Proceso de incorporación
                    </h3>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0">
                      <TimelineItem
                        phase="1"
                        title="Contacto inicial"
                        duration="1 sem"
                        description="Evaluamos tu proyecto, zona y capacidad. Primera toma de contacto para conocer tus objetivos y viabilidad."
                        items={['Llamada', 'Cuestionario', 'Viabilidad']}
                      />
                      <TimelineItem
                        phase="2"
                        title="Definición de objetivos"
                        duration="1 sem"
                        description="Establecemos objetivos conjuntamente, medios y acciones para conseguirlos. Preparamos materiales."
                        items={['Plan trabajo', 'Materiales', 'Comunicación']}
                      />
                      <TimelineItem
                        phase="3"
                        title="Preparación local"
                        duration="2 sem"
                        description="Información completa para adaptación, decoración y equipamiento de tu nueva base operativa."
                        items={['Local 35-50m²', 'Imagen', 'Equipamiento']}
                      />
                      <TimelineItem
                        phase="4"
                        title="Formación completa"
                        duration="2 sem"
                        description="Curso formativo integral: operativa, comercial, administrativa y gestión. Entrega de manuales de procedimientos."
                        items={['Presencial', 'Manuales', 'Certificación']}
                      />
                      <TimelineItem
                        phase="5"
                        title="Setup y configuración"
                        duration="1 sem"
                        description="Configuración del software, web personalizada y asesoramiento en adquisición de vehículos y seguros."
                        items={['Software', 'Web', 'Flota inicial']}
                      />
                      <TimelineItem
                        phase="6"
                        title="Apertura y seguimiento"
                        duration="Continuo"
                        description="Acompañamiento en la apertura y asesoramiento en la fase inicial de tu negocio."
                        items={['Apertura', 'Soporte', 'Crecimiento']}
                      />
                    </div>
                    <div className="mt-2 bg-gradient-to-r from-[#0066CC]/10 to-[#00CC66]/10 rounded-lg p-2 flex items-center justify-between border border-[#0066CC]/20">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[#00CC66]" />
                        <p className="text-[#003366] font-bold text-[10px]">Tiempo total estimado</p>
                      </div>
                      <span className="text-xl font-bold text-[#00CC66]">45-60 días</span>
                    </div>
                  </div>

                  {/* Columna derecha: Requisitos + Inversión */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-[#0066CC] uppercase tracking-wide flex items-center gap-2">
                      <ClipboardList className="w-3.5 h-3.5" /> Requisitos de la base operativa
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="bg-white rounded-lg p-2 shadow-sm flex items-start gap-2">
                        <Store className="w-4 h-4 text-[#0066CC] flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-[10px] font-bold text-[#003366]">Local 35-50 m²</h4>
                          <p className="text-[9px] text-gray-500">Oficina para reservas y entregas</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2 shadow-sm flex items-start gap-2">
                        <ParkingCircle className="w-4 h-4 text-[#00CC66] flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-[10px] font-bold text-[#003366]">Sin garaje</h4>
                          <p className="text-[9px] text-gray-500">Solo plazas de aparcamiento</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2 shadow-sm flex items-start gap-2">
                        <MapPinned className="w-4 h-4 text-[#0066CC] flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-[10px] font-bold text-[#003366]">Ubicación</h4>
                          <p className="text-[9px] text-gray-500">Industrial, comercial o turística</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2 shadow-sm flex items-start gap-2">
                        <Landmark className="w-4 h-4 text-[#00CC66] flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-[10px] font-bold text-[#003366]">Propiedad o alquiler</h4>
                          <p className="text-[9px] text-gray-500">Estándares de imagen</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2 shadow-sm flex items-start gap-2 col-span-2">
                        <UserCheck className="w-4 h-4 text-[#0066CC] flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-[10px] font-bold text-[#003366]">Perfil emprendedor</h4>
                          <p className="text-[9px] text-gray-500">Convicción, dedicación y capacidad de inversión. Flota flexible según negocio.</p>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xs font-bold text-[#00CC66] uppercase tracking-wide flex items-center gap-2">
                      <Euro className="w-3.5 h-3.5" /> Inversión y propuesta de valor
                    </h3>
                    <div className="bg-gradient-to-br from-[#0066CC] to-[#00CC66] rounded-xl p-3 text-white">
                      <div className="flex items-baseline justify-between gap-2 mb-2">
                        <div>
                          <p className="text-white/80 text-[10px]">Inversión inicial</p>
                          <span className="text-2xl font-bold">6.000€</span>
                          <span className="text-[10px] text-white/70 ml-1">+ IVA</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-white/80">Cuota mensual</p>
                          <span className="text-lg font-bold">250€/mes</span>
                        </div>
                      </div>
                      <p className="text-[9px] text-white/80 mb-2">Incluye: software, formación, web, setup, asesoramiento, acuerdos flota/seguros, manuales.</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="flex items-center gap-1 text-[9px]">
                          <CheckCircle className="w-3 h-3 flex-shrink-0" /> Sin royalties
                        </div>
                        <div className="flex items-center gap-1 text-[9px]">
                          <CheckCircle className="w-3 h-3 flex-shrink-0" /> Tu propia marca
                        </div>
                        <div className="flex items-center gap-1 text-[9px]">
                          <CheckCircle className="w-3 h-3 flex-shrink-0" /> Exclusividad territorial
                        </div>
                        <div className="flex items-center gap-1 text-[9px]">
                          <CheckCircle className="w-3 h-3 flex-shrink-0" /> Formación profesional
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-[#00CC66]/10 to-[#0066CC]/10 rounded-lg p-2 border border-[#00CC66]/30 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#00CC66] flex-shrink-0" />
                      <p className="text-[10px] text-gray-700"><span className="font-bold text-[#003366]">ROI estimado: 12-18 meses.</span> Recupera tu inversión con gestión adecuada y acuerdos preferentes.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-2 bg-gradient-to-r from-[#0066CC] to-[#00CC66] rounded-xl p-2 text-white flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-6 h-6" />
                    <div>
                      <p className="font-bold text-sm">Te asesoramos en todo el proceso</p>
                      <p className="text-[10px] text-white/80">Desde la selección del local hasta la apertura · 100% acompañamiento</p>
                    </div>
                  </div>
                </div>

                {/* Sección Contacto integrada */}
                <div className="mt-2 pt-2 border-t border-gray-200 flex flex-col gap-2 flex-shrink-0">
                  <h3 className="text-sm font-bold text-[#003366] flex items-center gap-2">
                    <span className="w-1 h-5 bg-gradient-to-b from-[#0066CC] to-[#00CC66] rounded-full" />
                    ¿Listo para emprender?
                  </h3>
                  <p className="text-[10px] text-gray-600">
                    Da el primer paso hacia tu negocio de alquiler de vehículos. Te acompañamos en todo el proceso.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                      <Phone className="w-4 h-4 text-[#0066CC] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-gray-500">Teléfono</p>
                        <p className="text-[10px] font-medium text-[#003366] truncate">+34 900 123 456</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                      <Mail className="w-4 h-4 text-[#00CC66] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-gray-500">Email</p>
                        <p className="text-[10px] font-medium text-[#003366] truncate">info@alkilator.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                      <MapPin className="w-4 h-4 text-[#0066CC] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-gray-500">Oficina</p>
                        <p className="text-[10px] font-medium text-[#003366] truncate">Madrid, España</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
