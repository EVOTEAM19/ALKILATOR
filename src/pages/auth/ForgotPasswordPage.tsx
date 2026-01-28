import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GuestGuard } from '@/components/auth/GuestGuard';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const { resetPassword, isLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  
  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      await resetPassword(data.email);
      setSentEmail(data.email);
      setEmailSent(true);
    } catch (error) {
      // Error manejado en resetPassword
    }
  };
  
  return (
    <GuestGuard>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center">
              <img
                src="/images/Alkilator_logo.png"
                alt="Alkilator"
                className="h-16 sm:h-20 w-auto object-contain"
              />
            </Link>
          </div>
          
          <Card className="shadow-lg">
            {!emailSent ? (
              <>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
                  <CardDescription>
                    Introduce tu email y te enviaremos un enlace para restablecer tu contraseña
                  </CardDescription>
                </CardHeader>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        {...register('email')}
                        disabled={isLoading}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Enviar enlace de recuperación
                        </>
                      )}
                    </Button>
                    
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center text-sm text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Volver a iniciar sesión
                    </Link>
                  </CardFooter>
                </form>
              </>
            ) : (
              <>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
                    <CheckCircle2 className="h-8 w-8 text-secondary" />
                  </div>
                  <CardTitle className="text-2xl">¡Email enviado!</CardTitle>
                  <CardDescription>
                    Hemos enviado un enlace de recuperación a:
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="text-center">
                  <p className="font-medium text-lg">{sentEmail}</p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Si no recibes el email en unos minutos, revisa tu carpeta de spam.
                  </p>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setEmailSent(false)}
                  >
                    Enviar a otro email
                  </Button>
                  
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a iniciar sesión
                  </Link>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      </div>
    </GuestGuard>
  );
}
