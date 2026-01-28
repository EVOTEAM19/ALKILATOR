import { cn } from '@/lib/utils';

interface AnimatedWavesProps {
  className?: string;
  variant?: 'hero' | 'section' | 'footer';
}

export function AnimatedWaves({ className, variant = 'hero' }: AnimatedWavesProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {/* Ola 1 - Verde */}
      <svg
        className="absolute bottom-0 left-0 w-[200%] animate-wave-slow"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: variant === 'hero' ? '40%' : '30%' }}
      >
        <path
          fill="rgba(0, 204, 102, 0.15)"
          d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      {/* Ola 2 - Azul claro */}
      <svg
        className="absolute bottom-0 left-0 w-[200%] animate-wave-medium"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: variant === 'hero' ? '35%' : '25%' }}
      >
        <path
          fill="rgba(0, 102, 204, 0.1)"
          d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,144C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      {/* Ola 3 - Verde más intenso */}
      <svg
        className="absolute bottom-0 left-0 w-[200%] animate-wave-fast"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: variant === 'hero' ? '25%' : '20%' }}
      >
        <path
          fill="rgba(0, 204, 102, 0.2)"
          d="M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,208C672,235,768,277,864,277.3C960,277,1056,235,1152,208C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
    </div>
  );
}

// Posiciones fijas para que no cambien en cada render
const PARTICLE_POSITIONS = [...Array(20)].map((_, i) => ({
  width: 5 + (i * 7) % 10,
  height: 5 + (i * 3) % 10,
  left: (i * 47) % 100,
  top: (i * 23) % 100,
  delay: (i * 0.7) % 5,
  duration: 10 + (i % 10),
}));

export function FloatingParticles({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {PARTICLE_POSITIONS.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/10 animate-float-particle"
          style={{
            width: p.width,
            height: p.height,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
