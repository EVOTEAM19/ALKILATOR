import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const footerLinks = {
  alquiler: [
    { name: 'Coches', href: '/vehiculos?tipo=car' },
    { name: 'Furgonetas', href: '/vehiculos?tipo=van' },
    { name: 'Ofertas', href: '/ofertas' },
    { name: 'Tarifas', href: '/tarifas' },
  ],
  informacion: [
    { name: 'Sobre nosotros', href: '/sobre-nosotros' },
    { name: 'Ubicaciones', href: '/ubicaciones' },
    { name: 'Preguntas frecuentes', href: '/faq' },
    { name: 'Contacto', href: '/contacto' },
  ],
  legal: [
    { name: 'Términos y condiciones', href: '/terminos' },
    { name: 'Política de privacidad', href: '/privacidad' },
    { name: 'Política de cookies', href: '/cookies' },
    { name: 'Aviso legal', href: '/aviso-legal' },
  ],
};

const socialLinks = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'LinkedIn', href: '#', icon: Linkedin },
];

export function PublicFooter() {
  return (
    <footer className="text-white" style={{ backgroundColor: '#002952' }}>
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 inline-block">
              <img
                src="/images/Alkilator_logo.png"
                alt="Alkilator"
                className="h-12 sm:h-14 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-white text-sm mb-6 max-w-xs">
              Tu partner de confianza para el alquiler de coches y furgonetas. 
              Los mejores precios garantizados y sin costes ocultos.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <a href="tel:+34900123456" className="flex items-center gap-2 text-white hover:text-white/90 transition-colors">
                <Phone className="h-4 w-4" />
                +34 900 123 456
              </a>
              <a href="mailto:info@alkilator.com" className="flex items-center gap-2 text-white hover:text-white/90 transition-colors">
                <Mail className="h-4 w-4" />
                info@alkilator.com
              </a>
              <p className="flex items-center gap-2 text-white">
                <MapPin className="h-4 w-4" />
                Madrid, España
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
          
          {/* Alquiler Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Alquiler</h3>
            <ul className="space-y-2">
              {footerLinks.alquiler.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white hover:text-white/90 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Información Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Información</h3>
            <ul className="space-y-2">
              {footerLinks.informacion.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white hover:text-white/90 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white hover:text-white/90 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white text-sm">
              © {new Date().getFullYear()} Alkilator. Todos los derechos reservados.
            </p>
            
            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-white text-xs">Métodos de pago:</span>
              <div className="flex items-center gap-2">
                {/* Iconos de métodos de pago - usando emojis por simplicidad */}
                <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-xs">
                  VISA
                </div>
                <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-xs">
                  MC
                </div>
                <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-xs">
                  AMEX
                </div>
                <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-xs">
                  PayPal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
