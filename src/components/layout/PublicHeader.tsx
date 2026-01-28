import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Car, 
  Truck, 
  Menu, 
  X, 
  MapPin, 
  Tag,
  User,
  LogIn,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  { name: 'Coches', href: '/vehiculos?tipo=car', icon: Car },
  { name: 'Furgonetas', href: '/vehiculos?tipo=van', icon: Truck },
  { name: 'Ofertas', href: '/ofertas', icon: Tag },
  { name: 'Ubicaciones', href: '/ubicaciones', icon: MapPin },
];

export function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, isAdmin, isStaff, signOut } = useAuth();
  
  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href.split('?')[0]);
  };
  
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/images/Alkilator_logo.png"
              alt="Alkilator"
              className="h-12 sm:h-14 md:h-16 w-auto object-contain"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive(item.href)
                      ? 'text-primary bg-primary/5'
                      : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Gestionar Reserva (desktop) */}
            <Link
              to="/gestionar-reserva"
              className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              Gestionar reserva
            </Link>
            
            {/* Auth Buttons */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="hidden sm:block max-w-[100px] truncate">
                      {user?.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {(isAdmin || isStaff) && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          Panel de gestión
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/mi-cuenta" className="cursor-pointer">
                      Mi cuenta
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/mi-cuenta/reservas" className="cursor-pointer">
                      Mis reservas
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => signOut()}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                    <LogIn className="h-4 w-4" />
                    Iniciar sesión
                  </Button>
                </Link>
                <Link to="/registro">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                      <img
                        src="/images/Alkilator_logo.png"
                        alt="Alkilator"
                        className="h-12 w-auto object-contain"
                      />
                    </Link>
                  </div>
                  
                  {/* Mobile Navigation */}
                  <nav className="flex-1 py-6">
                    <div className="space-y-1">
                      {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                          <SheetClose asChild key={item.name}>
                            <Link
                              to={item.href}
                              className={cn(
                                'flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-colors',
                                isActive(item.href)
                                  ? 'text-primary bg-primary/5'
                                  : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                              )}
                            >
                              <Icon className="h-5 w-5" />
                              {item.name}
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t">
                      <SheetClose asChild>
                        <Link
                          to="/gestionar-reserva"
                          className="flex items-center gap-3 px-3 py-3 text-base font-medium text-foreground/70 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                          Gestionar reserva
                        </Link>
                      </SheetClose>
                    </div>
                  </nav>
                  
                  {/* Mobile Auth */}
                  <div className="pt-4 border-t space-y-2">
                    {isAuthenticated ? (
                      <>
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          {user?.email}
                        </div>
                        {(isAdmin || isStaff) && (
                          <SheetClose asChild>
                            <Link to="/admin">
                              <Button variant="outline" className="w-full">
                                Panel de gestión
                              </Button>
                            </Link>
                          </SheetClose>
                        )}
                        <SheetClose asChild>
                          <Link to="/mi-cuenta">
                            <Button variant="outline" className="w-full">
                              Mi cuenta
                            </Button>
                          </Link>
                        </SheetClose>
                        <Button 
                          variant="ghost" 
                          className="w-full text-destructive hover:text-destructive"
                          onClick={() => {
                            signOut();
                            setIsOpen(false);
                          }}
                        >
                          Cerrar sesión
                        </Button>
                      </>
                    ) : (
                      <>
                        <SheetClose asChild>
                          <Link to="/login">
                            <Button variant="outline" className="w-full">
                              Iniciar sesión
                            </Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link to="/registro">
                            <Button className="w-full bg-primary hover:bg-primary/90">
                              Registrarse
                            </Button>
                          </Link>
                        </SheetClose>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
