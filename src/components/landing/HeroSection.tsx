import { BookingSearchForm } from './BookingSearchForm';

export function HeroSection() {
  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1449965408869-ebd3fee8c8ff?q=80&w=2070&auto=format&fit=crop')`,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
          {/* Text Content */}
          <div className="mb-8 lg:mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Alquila tu coche
              <span className="text-secondary"> ideal</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-xl">
              Los mejores precios garantizados. Sin costes ocultos. 
              Cancelación gratuita hasta 48 horas antes.
            </p>
          </div>
          
          {/* Booking Form */}
          <BookingSearchForm />
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
