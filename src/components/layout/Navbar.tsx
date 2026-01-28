import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Car,
  Truck,
  MapPin,
  ArrowRight,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isHomePage = location.pathname === '/';

  const navLinks = [
    { name: 'Coches', href: '/vehiculos?tipo=car', icon: Car },
    { name: 'Furgonetas', href: '/vehiculos?tipo=van', icon: Truck },
    { name: 'Ubicaciones', href: '/ubicaciones', icon: MapPin },
  ];

  const handleReservar = () => {
    if (isHomePage) {
      document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#reservar');
    }
  };

  return (
    <>
      {/* NAVBAR SIEMPRE AZUL en todas las páginas */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled && 'shadow-lg shadow-primary/20'
        )}
        style={{ backgroundColor: '#0066CC' }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
              <img
                src="/images/Alkilator_logo.png"
                alt="Alkilator"
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation - SIEMPRE TEXTO BLANCO */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                    location.pathname === link.href.split('?')[0] && (link.href.includes('tipo=car') ? location.search.includes('tipo=car') : link.href.includes('tipo=van') ? location.search.includes('tipo=van') : true)
                      ? 'bg-white/20 text-white'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Link>
              ))}

              <div className="w-px h-6 mx-2 bg-white/30" />

              {/* CTA DESTACADO - Franquicias (VERDE, sin icono) */}
              <Link
                to="/franquicias"
                className="flex items-center ml-2 px-5 py-2.5 rounded-xl font-bold transition-all bg-[#00CC66] text-white hover:bg-[#00CC66]/90 shadow-lg shadow-[#00CC66]/30 hover:shadow-xl hover:shadow-[#00CC66]/40 hover:scale-105 active:scale-100"
              >
                Franquicias
              </Link>
            </div>

            {/* Right side - Desktop - SIEMPRE TEXTO BLANCO */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                to="/login"
                className="flex items-center gap-2 font-medium text-white/80 hover:text-white transition-colors"
              >
                <User className="h-4 w-4" />
                Acceder
              </Link>
              <Link to="/contacto" className="font-medium text-white/80 hover:text-white transition-colors">
                Contacto
              </Link>
            </div>

            {/* Mobile menu button - SIEMPRE BLANCO */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label="Menú"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu - FONDO AZUL */}
        <div
          className={cn(
            'lg:hidden absolute top-full left-0 right-0 border-t border-white/10 shadow-xl transition-all duration-300 overflow-hidden',
            isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          )}
          style={{ backgroundColor: '#0066CC' }}
        >
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <link.icon className="h-5 w-5" />
                {link.name}
              </Link>
            ))}

            <Link
              to="/franquicias"
              className="flex items-center justify-between px-4 py-3 rounded-xl font-bold bg-[#00CC66] text-white hover:bg-[#00CC66]/90"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Franquicias
              <ArrowRight className="h-5 w-5" />
            </Link>

            <div className="pt-4 border-t border-white/10 mt-4 space-y-2">
              <Link
                to="/login"
                className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                Acceder
              </Link>
              <Link
                to="/contacto"
                className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contacto
              </Link>
              <Button
                className="w-full h-12 bg-white text-primary hover:bg-white/90 font-semibold"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleReservar();
                }}
              >
                Reservar ahora
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer para compensar el navbar fijo */}
      <div className="h-20" />
    </>
  );
}
