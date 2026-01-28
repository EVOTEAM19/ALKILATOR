import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Car, 
  Users, 
  DollarSign,
  Settings,
  MapPin,
  Tag,
  Wrench,
  FileText,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bell,
  Search,
  LogOut,
  User,
  Building2,
  HelpCircle,
  Moon,
  Sun,
  ChevronDown,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';

// Navegación del sidebar
const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: 'Reservas',
    href: '/admin/reservas',
    icon: Calendar,
    badge: 'new',
  },
  {
    name: 'Flota',
    href: '/admin/flota',
    icon: Car,
    children: [
      { name: 'Vehículos', href: '/admin/flota/vehiculos' },
      { name: 'Grupos', href: '/admin/flota/grupos' },
      { name: 'Ubicaciones', href: '/admin/ubicaciones' },
    ],
  },
  {
    name: 'Clientes',
    href: '/admin/clientes',
    icon: Users,
  },
  {
    name: 'Tarifas',
    href: '/admin/tarifas',
    icon: DollarSign,
    children: [
      { name: 'Tarifas', href: '/admin/tarifas' },
      { name: 'Extras', href: '/admin/extras' },
      { name: 'Descuentos', href: '/admin/descuentos' },
    ],
  },
  {
    name: 'Mantenimientos',
    href: '/admin/mantenimientos',
    icon: Wrench,
  },
  {
    name: 'Contabilidad',
    href: '/admin/contabilidad',
    icon: FileText,
  },
  {
    name: 'Configuración',
    href: '/admin/configuracion',
    icon: Settings,
  },
];

// Componente NavItem para el sidebar
function NavItem({ 
  item, 
  isCollapsed, 
  isActive,
  isMobile = false,
  onNavigate,
}: { 
  item: typeof navigation[0];
  isCollapsed: boolean;
  isActive: boolean;
  isMobile?: boolean;
  onNavigate?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  
  // Verificar si algún hijo está activo
  const isChildActive = hasChildren && item.children.some(
    child => location.pathname === child.href || location.pathname.startsWith(child.href + '/')
  );
  
  const Icon = item.icon;
  
  // Si está colapsado y tiene hijos, mostrar dropdown
  if (isCollapsed && !isMobile && hasChildren) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <DropdownMenu>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
                    isActive || isChildActive
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.name}
            </TooltipContent>
            <DropdownMenuContent side="right" align="start" className="w-48">
              <DropdownMenuLabel>{item.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {item.children.map((child) => (
                <DropdownMenuItem key={child.href} asChild>
                  <Link 
                    to={child.href}
                    className={cn(
                      'cursor-pointer',
                      location.pathname === child.href && 'bg-muted'
                    )}
                  >
                    {child.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Si está colapsado y no tiene hijos
  if (isCollapsed && !isMobile) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to={item.href}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-lg transition-colors relative',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.badge && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-secondary rounded-full" />
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.name}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Si tiene hijos, mostrar acordeón
  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isActive || isChildActive
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </div>
          <ChevronDown className={cn(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )} />
        </button>
        
        {isOpen && (
          <div className="mt-1 ml-4 pl-4 border-l space-y-1">
            {item.children.map((child) => (
              <Link
                key={child.href}
                to={child.href}
                onClick={onNavigate}
                className={cn(
                  'block px-3 py-2 rounded-lg text-sm transition-colors',
                  location.pathname === child.href
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  // Item normal sin hijos
  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative',
        isActive
          ? 'bg-primary text-white'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{item.name}</span>
      {item.badge && (
        <Badge variant="secondary" className="ml-auto text-xs bg-secondary text-white">
          {item.badge === 'new' ? '3' : item.badge}
        </Badge>
      )}
    </Link>
  );
}

// Componente Sidebar
function Sidebar({ 
  isCollapsed, 
  onCollapse,
  isMobile = false,
  onNavigate,
}: { 
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  isMobile?: boolean;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const { company } = useAuthStore();
  
  return (
    <div className={cn(
      'flex flex-col h-full bg-card border-r',
      isCollapsed && !isMobile ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b shrink-0',
        isCollapsed && !isMobile ? 'justify-center' : 'justify-between'
      )}>
        <Link to="/admin" className="flex items-center gap-2 min-w-0">
          <img
            src="/images/Alkilator_logo.png"
            alt="Alkilator"
            className={cn(
              'h-10 w-auto object-contain shrink-0',
              isCollapsed && !isMobile && 'mx-auto'
            )}
          />
          {(!isCollapsed || isMobile) && (
            <span className="text-xl font-bold truncate">Alkilator</span>
          )}
        </Link>
        
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => onCollapse(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      
      {/* Company info */}
      {(!isCollapsed || isMobile) && company && (
        <div className="px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{company.name}</p>
              <p className="text-xs text-muted-foreground truncate">{company.email}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.href
              : location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            
            return (
              <NavItem
                key={item.href}
                item={item}
                isCollapsed={isCollapsed && !isMobile}
                isActive={isActive}
                isMobile={isMobile}
                onNavigate={onNavigate}
              />
            );
          })}
        </nav>
      </ScrollArea>
      
      {/* Footer */}
      {(!isCollapsed || isMobile) && (
        <div className="p-4 border-t">
          <Link
            to="/admin/ayuda"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            <span>Ayuda y soporte</span>
          </Link>
        </div>
      )}
    </div>
  );
}

// Componente Header
function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, signOut } = useAuth();
  const { role } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 bg-card border-b">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Search */}
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar reservas, clientes, vehículos..."
            className="w-80 pl-9 bg-muted/50 border-0 focus-visible:bg-background focus-visible:ring-1"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>
      
      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-secondary rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-4 text-center text-sm text-muted-foreground">
              No tienes notificaciones nuevas
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-white text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium leading-none">
                  {user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {role?.replace('_', ' ')}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin/perfil" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/configuracion" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/" target="_blank" className="cursor-pointer">
                <Building2 className="mr-2 h-4 w-4" />
                Ver web pública
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// Layout principal
export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-50 h-screen hidden lg:block transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}>
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onCollapse={setSidebarCollapsed}
        />
      </aside>
      
      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar 
            isCollapsed={false} 
            onCollapse={() => {}}
            isMobile
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>
      
      {/* Main content */}
      <div className={cn(
        'transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      )}>
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        
        <main id="main-content" className="p-4 md:p-6 lg:p-8" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
