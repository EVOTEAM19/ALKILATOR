import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  Calendar,
  Percent,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  useDiscounts, 
  useDiscountStats,
  useCreateDiscount, 
  useUpdateDiscount, 
  useDeleteDiscount,
  useGenerateCode 
} from '@/hooks/useDiscounts';
import type { DiscountCode } from '@/types';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { toast } from 'sonner';

const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  percentage: 'Porcentaje',
  fixed: 'Importe fijo',
};

// Formulario de descuento
function DiscountFormDialog({
  open,
  onOpenChange,
  discount,
  onSave,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discount?: DiscountCode | null;
  onSave: (data: Partial<DiscountCode>) => void;
  isLoading: boolean;
}) {
  const { generate } = useGenerateCode();
  
  const [formData, setFormData] = useState<Partial<DiscountCode>>({
    code: discount?.code || '',
    description: discount?.description || '',
    discount_type: discount?.discount_type || 'percentage',
    discount_value: discount?.discount_value || 0,
    min_days: discount?.min_days || null,
    min_amount: discount?.min_amount || null,
    max_uses: discount?.max_uses || 0,
    current_uses: discount?.current_uses || 0,
    valid_from: discount?.valid_from || null,
    valid_until: discount?.valid_until || null,
    is_active: discount?.is_active ?? true,
  });
  
  const handleGenerateCode = () => {
    setFormData({ ...formData, code: generate() });
  };
  
  const handleSubmit = () => {
    onSave(formData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {discount ? 'Editar código' : 'Nuevo código de descuento'}
          </DialogTitle>
          <DialogDescription>
            {discount 
              ? 'Modifica los datos del código de descuento'
              : 'Crea un nuevo código promocional'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código *</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ej: VERANO2024"
                className="uppercase flex-1"
              />
              <Button type="button" variant="outline" onClick={handleGenerateCode}>
                <Sparkles className="h-4 w-4 mr-1" />
                Generar
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ej: Promoción de verano"
            />
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de descuento</Label>
              <Select
                value={formData.discount_type}
                onValueChange={(v) => setFormData({ ...formData, discount_type: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Porcentaje
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Importe fijo
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value">Valor *</Label>
              <div className="relative">
                <Input
                  id="value"
                  type="number"
                  step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {formData.discount_type === 'percentage' ? '%' : '€'}
                </span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <h4 className="font-medium">Restricciones (opcional)</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_days">Mínimo días</Label>
              <Input
                id="min_days"
                type="number"
                value={formData.min_days || ''}
                onChange={(e) => setFormData({ ...formData, min_days: parseInt(e.target.value) || null })}
                placeholder="Sin mínimo"
                min={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="min_amount">Importe mínimo (€)</Label>
              <Input
                id="min_amount"
                type="number"
                step="0.01"
                value={formData.min_amount || ''}
                onChange={(e) => setFormData({ ...formData, min_amount: parseFloat(e.target.value) || null })}
                placeholder="Sin mínimo"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max_uses">Usos máximos (0 = ilimitado)</Label>
            <Input
              id="max_uses"
              type="number"
              value={formData.max_uses || 0}
              onChange={(e) => setFormData({ ...formData, max_uses: parseInt(e.target.value) || 0 })}
              placeholder="Ilimitado"
              min={0}
            />
            {discount && formData.max_uses > 0 && (
              <p className="text-xs text-muted-foreground">
                Usados: {discount.current_uses} de {formData.max_uses}
              </p>
            )}
          </div>
          
          <Separator />
          
          <h4 className="font-medium">Validez</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Válido desde</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formData.valid_from 
                      ? format(parseISO(formData.valid_from), 'dd/MM/yyyy')
                      : 'Sin fecha'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.valid_from ? parseISO(formData.valid_from) : undefined}
                    onSelect={(date) => setFormData({
                      ...formData,
                      valid_from: date ? format(date, 'yyyy-MM-dd') : null
                    })}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Válido hasta</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formData.valid_until 
                      ? format(parseISO(formData.valid_until), 'dd/MM/yyyy')
                      : 'Sin fecha'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.valid_until ? parseISO(formData.valid_until) : undefined}
                    onSelect={(date) => setFormData({
                      ...formData,
                      valid_until: date ? format(date, 'yyyy-MM-dd') : null
                    })}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_active">Código activo</Label>
              <p className="text-xs text-muted-foreground">
                Los códigos inactivos no se pueden usar
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.code || !formData.discount_value || isLoading}
          >
            {isLoading ? 'Guardando...' : discount ? 'Guardar cambios' : 'Crear código'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Fila de la tabla
function DiscountRow({ 
  discount, 
  onEdit, 
  onCopy,
  onDelete 
}: { 
  discount: DiscountCode;
  onEdit: () => void;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const isExpired = discount.valid_until && new Date(discount.valid_until) < new Date();
  const isExhausted = discount.max_uses > 0 && discount.current_uses >= discount.max_uses;
  
  return (
    <TableRow className={cn(!discount.is_active && 'opacity-50')}>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-primary">{discount.code}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={onCopy}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
        {discount.description && (
          <p className="text-xs text-muted-foreground">{discount.description}</p>
        )}
      </TableCell>
      
      <TableCell>
        <Badge variant={discount.discount_type === 'percentage' ? 'default' : 'secondary'}>
          {discount.discount_type === 'percentage' ? (
            <>
              <Percent className="h-3 w-3 mr-1" />
              {discount.discount_value}%
            </>
          ) : (
            <>
              <DollarSign className="h-3 w-3 mr-1" />
              {formatPrice(discount.discount_value)}
            </>
          )}
        </Badge>
      </TableCell>
      
      <TableCell>
        <div className="text-sm">
          {discount.valid_from || discount.valid_until ? (
            <>
              {discount.valid_from && format(parseISO(discount.valid_from), 'dd/MM/yy')}
              {discount.valid_from && discount.valid_until && ' - '}
              {discount.valid_until && format(parseISO(discount.valid_until), 'dd/MM/yy')}
            </>
          ) : (
            <span className="text-muted-foreground">Sin límite</span>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        {discount.max_uses > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm">{discount.current_uses} / {discount.max_uses}</span>
            {isExhausted && (
              <Badge variant="destructive" className="text-xs">Agotado</Badge>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Ilimitado ({discount.current_uses} usos)</span>
        )}
      </TableCell>
      
      <TableCell>
        {!discount.is_active ? (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Inactivo
          </Badge>
        ) : isExpired ? (
          <Badge variant="destructive">Expirado</Badge>
        ) : isExhausted ? (
          <Badge variant="destructive">Agotado</Badge>
        ) : (
          <Badge className="bg-secondary">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        )}
      </TableCell>
      
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar código
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function DiscountsPage() {
  const { data: discounts, isLoading, refetch } = useDiscounts();
  const { data: stats } = useDiscountStats();
  const createMutation = useCreateDiscount();
  const updateMutation = useUpdateDiscount();
  const deleteMutation = useDeleteDiscount();
  
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);
  const [discountToDelete, setDiscountToDelete] = useState<DiscountCode | null>(null);
  
  const handleSave = async (data: Partial<DiscountCode>) => {
    if (editingDiscount) {
      await updateMutation.mutateAsync({ id: editingDiscount.id, updates: data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setShowForm(false);
    setEditingDiscount(null);
  };
  
  const handleDelete = async () => {
    if (discountToDelete) {
      await deleteMutation.mutateAsync(discountToDelete.id);
      setDiscountToDelete(null);
    }
  };
  
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado al portapapeles');
  };
  
  const openEdit = (discount: DiscountCode) => {
    setEditingDiscount(discount);
    setShowForm(true);
  };
  
  const openCreate = () => {
    setEditingDiscount(null);
    setShowForm(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Códigos de descuento</h1>
          <p className="text-muted-foreground">
            Gestiona los códigos promocionales y descuentos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo código
          </Button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalActive || 0}</p>
              <p className="text-sm text-muted-foreground">Códigos activos</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalUsedThisMonth || 0}</p>
              <p className="text-sm text-muted-foreground">Usos totales</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-2">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatPrice(stats?.totalSavings || 0)}</p>
              <p className="text-sm text-muted-foreground">Total descuentos aplicados</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Most used codes */}
      {stats?.mostUsed && stats.mostUsed.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-base font-semibold mb-3">Códigos más usados</h3>
            <div className="flex flex-wrap gap-2">
              {stats.mostUsed.map((item) => (
                <Badge key={item.code} variant="outline" className="text-sm py-1 px-3">
                  <span className="font-mono font-semibold">{item.code}</span>
                  <span className="text-muted-foreground ml-2">{item.uses} usos</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Discounts Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-20" />
                </div>
              ))}
            </div>
          ) : discounts?.length === 0 ? (
            <div className="p-12 text-center">
              <Tag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay códigos</h3>
              <p className="text-muted-foreground mb-4">
                Crea códigos de descuento para tus promociones
              </p>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Crear primer código
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Validez</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts?.map((discount) => (
                  <DiscountRow
                    key={discount.id}
                    discount={discount}
                    onEdit={() => openEdit(discount)}
                    onCopy={() => handleCopy(discount.code)}
                    onDelete={() => setDiscountToDelete(discount)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Form Dialog */}
      <DiscountFormDialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingDiscount(null);
        }}
        discount={editingDiscount}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
      
      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!discountToDelete}
        onOpenChange={(open) => !open && setDiscountToDelete(null)}
        title="Eliminar código"
        description={`¿Estás seguro de que quieres eliminar el código "${discountToDelete?.code}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
