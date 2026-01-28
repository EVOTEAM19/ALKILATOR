import { useParams } from 'react-router-dom';

export default function ConfirmationPage() {
  const { bookingId } = useParams();
  
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">¡Reserva confirmada!</h1>
      <p className="text-muted-foreground">Número de reserva: {bookingId}</p>
      <p className="text-muted-foreground mt-2">Esta página se implementará en prompts posteriores.</p>
    </div>
  );
}
