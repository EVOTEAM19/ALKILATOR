import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Building2, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GuestGuard } from '@/components/auth/GuestGuard';

const customerSchema = z.object({
  firstName: z.string().min(2, 'Nombre muy corto'),
  lastName: z.string().min(2, 'Apellido muy corto'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

const businessSchema = z.object({
  companyName: z.string().min(2, 'Nombre de empresa muy corto'),
  firstName: z.string().min(2, 'Nombre muy corto'),
  lastName: z.string().min(2, 'Apellido muy corto'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type CustomerForm = z.infer<typeof customerSchema>;
type BusinessForm = z.infer<typeof businessSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'customer' | 'business'>('customer');
  const { signUp, isLoading } = useAuth();
  
  const customerForm = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });
  
  const businessForm = useForm<BusinessForm>({
    resolver: zodResolver(businessSchema),
  });
  
  const onCustomerSubmit = async (data: CustomerForm) => {
    try {
      await signUp({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
    } catch (error) {
      // Error manejado en signUp
    }
  };
  
  const onBusinessSubmit = async (data: BusinessForm) => {
    try {
      await signUp({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        companyName: data.companyName,
      });
    } catch (error) {
      // Error manejado en signUp
    }
  };
  
  return (
    <GuestGuard>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 py-8">
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
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Crear cuenta</CardTitle>
              <CardDescription>
                Elige el tipo de cuenta que necesitas
              </CardDescription>
            </CardHeader>
            
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mx-6 mb-4" style={{ width: 'calc(100% - 48px)' }}>
                <TabsTrigger value="customer" className="gap-2">
                  <User className="h-4 w-4" />
                  Cliente
                </TabsTrigger>
                <TabsTrigger value="business" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Empresa
                </TabsTrigger>
              </TabsList>
              
              {/* Formulario Cliente */}
              <TabsContent value="customer">
                <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer-firstName">Nombre</Label>
                        <Input
                          id="customer-firstName"
                          placeholder="Juan"
                          {...customerForm.register('firstName')}
                          disabled={isLoading}
                        />
                        {customerForm.formState.errors.firstName && (
                          <p className="text-xs text-destructive">
                            {customerForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer-lastName">Apellidos</Label>
                        <Input
                          id="customer-lastName"
                          placeholder="García"
                          {...customerForm.register('lastName')}
                          disabled={isLoading}
                        />
                        {customerForm.formState.errors.lastName && (
                          <p className="text-xs text-destructive">
                            {customerForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customer-email">Email</Label>
                      <Input
                        id="customer-email"
                        type="email"
                        placeholder="tu@email.com"
                        {...customerForm.register('email')}
                        disabled={isLoading}
                      />
                      {customerForm.formState.errors.email && (
                        <p className="text-xs text-destructive">
                          {customerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customer-phone">Teléfono (opcional)</Label>
                      <Input
                        id="customer-phone"
                        type="tel"
                        placeholder="+34 600 000 000"
                        {...customerForm.register('phone')}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customer-password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="customer-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...customerForm.register('password')}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {customerForm.formState.errors.password && (
                        <p className="text-xs text-destructive">
                          {customerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customer-confirmPassword">Confirmar contraseña</Label>
                      <Input
                        id="customer-confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        {...customerForm.register('confirmPassword')}
                        disabled={isLoading}
                      />
                      {customerForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-destructive">
                          {customerForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando cuenta...
                        </>
                      ) : (
                        'Crear cuenta de cliente'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
              
              {/* Formulario Empresa */}
              <TabsContent value="business">
                <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="business-companyName">Nombre de la empresa</Label>
                      <Input
                        id="business-companyName"
                        placeholder="Mi Rent a Car"
                        {...businessForm.register('companyName')}
                        disabled={isLoading}
                      />
                      {businessForm.formState.errors.companyName && (
                        <p className="text-xs text-destructive">
                          {businessForm.formState.errors.companyName.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="business-firstName">Tu nombre</Label>
                        <Input
                          id="business-firstName"
                          placeholder="Juan"
                          {...businessForm.register('firstName')}
                          disabled={isLoading}
                        />
                        {businessForm.formState.errors.firstName && (
                          <p className="text-xs text-destructive">
                            {businessForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-lastName">Apellidos</Label>
                        <Input
                          id="business-lastName"
                          placeholder="García"
                          {...businessForm.register('lastName')}
                          disabled={isLoading}
                        />
                        {businessForm.formState.errors.lastName && (
                          <p className="text-xs text-destructive">
                            {businessForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="business-email">Email corporativo</Label>
                      <Input
                        id="business-email"
                        type="email"
                        placeholder="contacto@miempresa.com"
                        {...businessForm.register('email')}
                        disabled={isLoading}
                      />
                      {businessForm.formState.errors.email && (
                        <p className="text-xs text-destructive">
                          {businessForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="business-phone">Teléfono (opcional)</Label>
                      <Input
                        id="business-phone"
                        type="tel"
                        placeholder="+34 900 000 000"
                        {...businessForm.register('phone')}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="business-password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="business-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...businessForm.register('password')}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {businessForm.formState.errors.password && (
                        <p className="text-xs text-destructive">
                          {businessForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="business-confirmPassword">Confirmar contraseña</Label>
                      <Input
                        id="business-confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        {...businessForm.register('confirmPassword')}
                        disabled={isLoading}
                      />
                      {businessForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-destructive">
                          {businessForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-secondary/10 rounded-lg p-3 text-sm">
                      <p className="font-medium text-secondary">✨ Cuenta de empresa incluye:</p>
                      <ul className="mt-1 text-muted-foreground text-xs space-y-1">
                        <li>• Panel de gestión completo</li>
                        <li>• Gestión de flota y reservas</li>
                        <li>• Landing page personalizada</li>
                        <li>• Motor de reservas online</li>
                      </ul>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando empresa...
                        </>
                      ) : (
                        'Crear cuenta de empresa'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="px-6 pb-6">
              <p className="text-sm text-center text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </GuestGuard>
  );
}
