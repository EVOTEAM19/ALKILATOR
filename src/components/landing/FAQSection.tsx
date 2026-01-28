import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: '¿Qué documentos necesito para alquilar un vehículo?',
    answer: 'Para alquilar un vehículo necesitas: DNI o pasaporte válido, carnet de conducir con al menos 1 año de antigüedad, y una tarjeta de crédito a nombre del conductor principal para la fianza.',
  },
  {
    question: '¿Está incluido el seguro en el precio?',
    answer: 'Sí, todos nuestros vehículos incluyen seguro a terceros obligatorio. Además, ofrecemos opciones de cobertura ampliada para reducir o eliminar la franquicia en caso de daños.',
  },
  {
    question: '¿Puedo devolver el vehículo en otra ubicación?',
    answer: 'Sí, ofrecemos la opción de devolver el vehículo en una ubicación diferente a la de recogida. Este servicio puede tener un cargo adicional que se mostrará durante el proceso de reserva.',
  },
  {
    question: '¿Hay límite de kilómetros?',
    answer: 'Nuestras tarifas incluyen un número de kilómetros diarios (normalmente 150-200 km/día). Si necesitas más, puedes contratar kilómetros ilimitados por un pequeño suplemento.',
  },
  {
    question: '¿Qué pasa si devuelvo el coche tarde?',
    answer: 'Disponemos de un periodo de gracia de 59 minutos. Si excedes este tiempo, se cobrará una tarifa adicional proporcional. Te recomendamos contactarnos si prevés un retraso.',
  },
  {
    question: '¿Cómo funciona la fianza?',
    answer: 'La fianza se retiene en tu tarjeta de crédito al recoger el vehículo (no se cobra). Se libera automáticamente tras la devolución sin incidencias, normalmente en 3-5 días laborables.',
  },
  {
    question: '¿Puedo añadir un conductor adicional?',
    answer: 'Sí, puedes añadir conductores adicionales durante la reserva o al recoger el vehículo. Cada conductor adicional tiene un coste de 7€/día y debe presentar su carnet de conducir.',
  },
  {
    question: '¿Cuál es la política de cancelación?',
    answer: 'Puedes cancelar tu reserva gratuitamente hasta 48 horas antes de la recogida. Después de ese plazo, se aplicará un cargo del 50% del importe total.',
  },
];

export function FAQSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Preguntas <span className="text-secondary">frecuentes</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encuentra respuestas a las dudas más comunes sobre nuestro servicio de alquiler.
          </p>
        </div>
        
        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        {/* Contact CTA */}
        <div className="text-center mt-10">
          <p className="text-muted-foreground">
            ¿No encuentras lo que buscas?{' '}
            <a href="/contacto" className="text-primary hover:underline font-medium">
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
