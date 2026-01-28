import { supabase } from '@/lib/supabase';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import type { Booking, Customer, Vehicle, VehicleGroup, Location, Company, Extra } from '@/types';

export interface ContractData {
  booking: Booking & {
    customer: Customer;
    vehicle?: Vehicle;
    vehicle_group: VehicleGroup;
    pickup_location: Location;
    return_location: Location;
    extras?: { extra: Extra; quantity: number; price: number }[];
  };
  company: Company;
  settings?: any;
}

export interface ContractTemplate {
  id: string;
  company_id: string;
  name: string;
  content: string;
  is_default: boolean;
  created_at: string;
}

export const contractService = {
  // Obtener datos completos para el contrato
  async getContractData(bookingId: string): Promise<ContractData> {
    // Obtener reserva con relaciones
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        vehicle:vehicles(*, vehicle_group:vehicle_groups(*)),
        vehicle_group:vehicle_groups(*),
        pickup_location:locations!bookings_pickup_location_id_fkey(*),
        return_location:locations!bookings_return_location_id_fkey(*),
        extras:booking_extras(
          id,
          quantity,
          unit_price,
          total_price,
          extra:extras(*)
        )
      `)
      .eq('id', bookingId)
      .single();
    
    if (bookingError) throw bookingError;
    
    // Obtener datos de la empresa
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', booking.company_id)
      .single();
    
    if (companyError) throw companyError;
    
    // Obtener configuración (desde companyService)
    // Por ahora usamos valores por defecto
    const settings = {
      tax_rate: company.tax_rate || 21,
      cancellation_hours: 24,
      extra_km_price: 0.15,
    };
    
    return {
      booking: {
        ...booking,
        extras: booking.extras?.map((be: any) => ({
          extra: be.extra,
          quantity: be.quantity,
          price: be.total_price || be.unit_price * be.quantity,
        })),
      },
      company,
      settings,
    };
  },

  // Generar PDF del contrato
  async generateContractPDF(data: ContractData): Promise<Blob> {
    const { booking, company, settings } = data;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = margin;
    
    // Colores
    const primaryColor = [0, 102, 204]; // #0066CC
    const textColor = [51, 51, 51];
    const lightGray = [128, 128, 128];
    
    // Helper para añadir texto
    const addText = (text: string, x: number, y: number, options: any = {}) => {
      const { fontSize = 10, fontStyle = 'normal', color = textColor, align = 'left' } = options;
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', fontStyle);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(text, x, y, { align });
      return y + (fontSize * 0.5);
    };
    
    // Helper para línea horizontal
    const addLine = (y: number, color = lightGray) => {
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      return y + 5;
    };
    
    // Helper para sección
    const addSection = (title: string, y: number) => {
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(margin, y, contentWidth, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 3, y + 5.5);
      return y + 12;
    };
    
    // ========== ENCABEZADO ==========
    // Logo/Nombre empresa
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(company.name || 'Alkilator', margin, yPos + 8);
    
    // Datos empresa (derecha)
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    const companyInfo = [
      company.name,
      `CIF: ${company.tax_id || 'N/A'}`,
      company.address || '',
      `${company.postal_code || ''} ${company.city || ''}`,
      company.phone || '',
      company.email || '',
    ].filter(Boolean);
    
    companyInfo.forEach((line, i) => {
      doc.text(line, pageWidth - margin, yPos + (i * 4), { align: 'right' });
    });
    
    yPos += 30;
    
    // Título del contrato
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('CONTRATO DE ALQUILER DE VEHÍCULO', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    // Número de contrato
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Nº ${booking.booking_number}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    // ========== DATOS DEL ARRENDATARIO ==========
    yPos = addSection('DATOS DEL ARRENDATARIO', yPos);
    
    const customer = booking.customer;
    if (!customer) throw new Error('Cliente no encontrado');
    
    const customerData = [
      ['Nombre completo:', `${customer.first_name} ${customer.last_name}`],
      ['Documento:', `${(customer.document_type || 'DNI').toUpperCase()}: ${customer.document_number || 'N/A'}`],
      ['Dirección:', `${customer.address || ''}, ${customer.postal_code || ''} ${customer.city || ''}`],
      ['Teléfono:', customer.phone || 'N/A'],
      ['Email:', customer.email],
      ['Carnet de conducir:', customer.license_number || 'N/A'],
    ];
    
    customerData.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(label, margin + 3, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, margin + 45, yPos);
      yPos += 5;
    });
    
    yPos += 5;
    
    // ========== DATOS DEL VEHÍCULO ==========
    yPos = addSection('DATOS DEL VEHÍCULO', yPos);
    
    const vehicle = booking.vehicle;
    const vehicleGroup = booking.vehicle_group;
    
    const vehicleData = [
      ['Categoría:', vehicleGroup?.name || 'N/A'],
      ['Vehículo:', vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.year})` : 'A asignar'],
      ['Matrícula:', vehicle?.plate || 'Pendiente'],
      ['Combustible:', vehicle?.fuel_type === 'gasoline' ? 'Gasolina' : 
                       vehicle?.fuel_type === 'diesel' ? 'Diésel' : 
                       vehicle?.fuel_type === 'hybrid' ? 'Híbrido' :
                       vehicle?.fuel_type === 'electric' ? 'Eléctrico' : 'N/A'],
      ['Km. actuales:', vehicle?.current_mileage ? `${vehicle.current_mileage.toLocaleString()} km` : 'N/A'],
    ];
    
    vehicleData.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(label, margin + 3, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, margin + 45, yPos);
      yPos += 5;
    });
    
    yPos += 5;
    
    // ========== PERÍODO DE ALQUILER ==========
    yPos = addSection('PERÍODO DE ALQUILER', yPos);
    
    const pickupDate = parseISO(booking.pickup_date);
    const returnDate = parseISO(booking.return_date);
    const days = differenceInDays(returnDate, pickupDate) || 1;
    
    const rentalData = [
      ['Fecha de recogida:', format(pickupDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })],
      ['Hora de recogida:', booking.pickup_time || '10:00'],
      ['Lugar de recogida:', booking.pickup_location?.name || 'N/A'],
      ['', booking.pickup_location?.address ? `${booking.pickup_location.address}, ${booking.pickup_location.city}` : ''],
      ['Fecha de devolución:', format(returnDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })],
      ['Hora de devolución:', booking.return_time || '10:00'],
      ['Lugar de devolución:', booking.return_location?.name || 'N/A'],
      ['', booking.return_location?.address ? `${booking.return_location.address}, ${booking.return_location.city}` : ''],
      ['Duración total:', `${days} día${days > 1 ? 's' : ''}`],
    ];
    
    rentalData.forEach(([label, value]) => {
      if (label) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(label, margin + 3, yPos);
      }
      doc.setFont('helvetica', 'normal');
      doc.text(value, margin + 50, yPos);
      yPos += 5;
    });
    
    yPos += 5;
    
    // ========== DESGLOSE ECONÓMICO ==========
    yPos = addSection('DESGLOSE ECONÓMICO', yPos);
    
    // Tabla de precios
    const formatPrice = (price: number) => `${price.toFixed(2)} €`;
    
    // Cabecera tabla
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 2, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Concepto', margin + 3, yPos + 3);
    doc.text('Precio', pageWidth - margin - 3, yPos + 3, { align: 'right' });
    yPos += 10;
    
    // Alquiler base
    const basePrice = booking.base_price || 0;
    doc.setFont('helvetica', 'normal');
    doc.text(`Alquiler ${vehicleGroup?.name || ''} (${days} días)`, margin + 3, yPos);
    doc.text(formatPrice(basePrice), pageWidth - margin - 3, yPos, { align: 'right' });
    yPos += 5;
    
    // Extras
    if (booking.extras && booking.extras.length > 0) {
      booking.extras.forEach((be: any) => {
        const extraText = be.quantity > 1 
          ? `${be.extra.name} x${be.quantity}`
          : be.extra.name;
        doc.text(extraText, margin + 3, yPos);
        doc.text(formatPrice(be.price), pageWidth - margin - 3, yPos, { align: 'right' });
        yPos += 5;
      });
    }
    
    // Recargo ubicación
    if (booking.location_surcharge && booking.location_surcharge > 0) {
      doc.text('Recargo por ubicación', margin + 3, yPos);
      doc.text(formatPrice(booking.location_surcharge), pageWidth - margin - 3, yPos, { align: 'right' });
      yPos += 5;
    }
    
    // Descuento
    if (booking.discount_amount && booking.discount_amount > 0) {
      doc.setTextColor(0, 150, 0);
      doc.text(`Descuento ${booking.discount_code ? `(${booking.discount_code})` : ''}`, margin + 3, yPos);
      doc.text(`-${formatPrice(booking.discount_amount)}`, pageWidth - margin - 3, yPos, { align: 'right' });
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      yPos += 5;
    }
    
    // Línea separadora
    yPos = addLine(yPos);
    
    // Subtotal
    const subtotal = booking.subtotal || (booking.total_price || 0) / (1 + (settings?.tax_rate || 21) / 100);
    doc.text('Subtotal', margin + 3, yPos);
    doc.text(formatPrice(subtotal), pageWidth - margin - 3, yPos, { align: 'right' });
    yPos += 5;
    
    // IVA
    const taxRate = settings?.tax_rate || 21;
    const taxAmount = booking.tax_amount || (booking.total_price || 0) - subtotal;
    doc.text(`IVA (${taxRate}%)`, margin + 3, yPos);
    doc.text(formatPrice(taxAmount), pageWidth - margin - 3, yPos, { align: 'right' });
    yPos += 5;
    
    // Total
    yPos = addLine(yPos);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL', margin + 3, yPos);
    doc.text(formatPrice(booking.total_price || 0), pageWidth - margin - 3, yPos, { align: 'right' });
    yPos += 8;
    
    // Fianza
    const depositAmount = booking.deposit_amount || vehicleGroup?.deposit_amount || 500;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(`Fianza requerida: ${formatPrice(depositAmount)} (se devolverá al finalizar el alquiler)`, margin + 3, yPos);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    yPos += 10;
    
    // ========== NUEVA PÁGINA - CONDICIONES ==========
    doc.addPage();
    yPos = margin;
    
    // ========== CONDICIONES GENERALES ==========
    yPos = addSection('CONDICIONES GENERALES DEL ALQUILER', yPos);
    
    const kmIncluded = vehicleGroup?.km_per_day || 150;
    const extraKmPrice = settings?.extra_km_price || 0.15;
    const cancellationHours = settings?.cancellation_hours || 24;
    
    const conditions = [
      '1. El arrendatario declara haber recibido el vehículo en perfecto estado de funcionamiento y limpieza, comprometiéndose a devolverlo en las mismas condiciones.',
      '2. El arrendatario se compromete a utilizar el vehículo de forma responsable, respetando las normas de circulación vigentes.',
      '3. Queda prohibido subarrendar el vehículo, utilizarlo para fines ilegales, o permitir su conducción a personas no autorizadas.',
      '4. El arrendatario será responsable de cualquier multa o sanción derivada del uso del vehículo durante el período de alquiler.',
      '5. En caso de avería o accidente, el arrendatario deberá comunicarlo inmediatamente a la empresa arrendadora.',
      '6. El combustible no está incluido. El vehículo se entrega con el depósito lleno/medio y debe devolverse en las mismas condiciones.',
      `7. Kilómetros incluidos: ${kmIncluded} km/día. El exceso se facturará a ${formatPrice(extraKmPrice)}/km.`,
      '8. La empresa arrendadora no se hace responsable de los objetos personales dejados en el vehículo.',
      '9. El arrendatario autoriza el uso de sus datos para la gestión del alquiler conforme a la LOPD.',
      `10. En caso de cancelación, se aplicará la política de cancelación vigente (cancelación gratuita hasta ${cancellationHours} horas antes).`,
    ];
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    conditions.forEach((condition) => {
      const lines = doc.splitTextToSize(condition, contentWidth - 6);
      lines.forEach((line: string) => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(line, margin + 3, yPos);
        yPos += 4;
      });
      yPos += 2;
    });
    
    yPos += 10;
    
    // ========== FIRMAS ==========
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }
    
    yPos = addSection('FIRMAS', yPos);
    yPos += 5;
    
    // Dos columnas para firmas
    const signatureWidth = (contentWidth - 20) / 2;
    
    // Arrendador
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('EL ARRENDADOR', margin + (signatureWidth / 2), yPos, { align: 'center' });
    doc.text('EL ARRENDATARIO', margin + signatureWidth + 20 + (signatureWidth / 2), yPos, { align: 'center' });
    yPos += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(company.name || 'La Empresa', margin + (signatureWidth / 2), yPos, { align: 'center' });
    doc.text(`${customer.first_name} ${customer.last_name}`, margin + signatureWidth + 20 + (signatureWidth / 2), yPos, { align: 'center' });
    yPos += 20;
    
    // Líneas de firma
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.line(margin + 10, yPos, margin + signatureWidth - 10, yPos);
    doc.line(margin + signatureWidth + 30, yPos, margin + signatureWidth + signatureWidth + 10, yPos);
    yPos += 5;
    
    doc.setFontSize(7);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text('Firma y sello', margin + (signatureWidth / 2), yPos, { align: 'center' });
    doc.text('Firma', margin + signatureWidth + 20 + (signatureWidth / 2), yPos, { align: 'center' });
    
    // ========== PIE DE PÁGINA ==========
    yPos = pageHeight - 15;
    doc.setFontSize(7);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(
      `Contrato generado el ${format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}`,
      pageWidth / 2,
      yPos,
      { align: 'center' }
    );
    doc.text(
      `${company.name} - ${company.website || company.email || ''}`,
      pageWidth / 2,
      yPos + 4,
      { align: 'center' }
    );
    
    // Generar blob
    return doc.output('blob');
  },

  // Generar y descargar contrato
  async downloadContract(bookingId: string, filename?: string): Promise<void> {
    const data = await this.getContractData(bookingId);
    const blob = await this.generateContractPDF(data);
    
    // Crear link de descarga
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `contrato_${data.booking.booking_number}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Obtener URL del contrato para preview
  async getContractPreviewUrl(bookingId: string): Promise<string> {
    const data = await this.getContractData(bookingId);
    const blob = await this.generateContractPDF(data);
    return URL.createObjectURL(blob);
  },

  // Guardar contrato firmado
  async saveSignedContract(
    bookingId: string, 
    signatureData: string,
    signedAt: Date = new Date()
  ): Promise<void> {
    // Buscar o crear contrato
    const { data: existingContract } = await supabase
      .from('contracts')
      .select('id')
      .eq('booking_id', bookingId)
      .single();
    
    if (existingContract) {
      // Actualizar contrato existente
      const { error } = await supabase
        .from('contracts')
        .update({
          signature_data: signatureData,
          signed_at: signedAt.toISOString(),
          status: 'signed',
        })
        .eq('id', existingContract.id);
      
      if (error) throw error;
    } else {
      // Crear nuevo contrato
      const { data: booking } = await supabase
        .from('bookings')
        .select('company_id, booking_number')
        .eq('id', bookingId)
        .single();
      
      if (!booking) throw new Error('Reserva no encontrada');
      
      const contractNumber = `CONT-${booking.booking_number}`;
      
      const { error } = await supabase
        .from('contracts')
        .insert({
          company_id: booking.company_id,
          booking_id: bookingId,
          contract_number: contractNumber,
          signature_data: signatureData,
          signed_at: signedAt.toISOString(),
          status: 'signed',
        });
      
      if (error) throw error;
    }
  },

  // Generar checklist de entrega
  async generateDeliveryChecklist(bookingId: string): Promise<Blob> {
    const data = await this.getContractData(bookingId);
    const { booking, company } = data;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = margin;
    
    // Título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CHECKLIST DE ENTREGA DE VEHÍCULO', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Reserva: ${booking.booking_number}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    // Info básica
    const vehicle = booking.vehicle;
    const customer = booking.customer;
    if (!customer) throw new Error('Cliente no encontrado');
    
    doc.setFontSize(10);
    doc.text(`Vehículo: ${vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}` : 'Pendiente'}`, margin, yPos);
    yPos += 6;
    doc.text(`Cliente: ${customer.first_name} ${customer.last_name}`, margin, yPos);
    yPos += 6;
    doc.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, margin, yPos);
    yPos += 15;
    
    // Checklist items
    const checklistItems = [
      'Estado exterior',
      '  □ Carrocería sin golpes ni arañazos',
      '  □ Cristales en buen estado',
      '  □ Neumáticos en buen estado',
      '  □ Luces funcionando correctamente',
      '',
      'Estado interior',
      '  □ Tapicería limpia y sin daños',
      '  □ Salpicadero y mandos correctos',
      '  □ Aire acondicionado funciona',
      '  □ Radio/Sistema multimedia funciona',
      '',
      'Documentación',
      '  □ Permiso de circulación',
      '  □ Ficha técnica (ITV)',
      '  □ Seguro obligatorio',
      '  □ Manual del vehículo',
      '',
      'Niveles',
      '  □ Combustible: ______ (vacío / 1/4 / 1/2 / 3/4 / lleno)',
      '  □ Kilometraje: __________ km',
      '',
      'Extras entregados',
      '  □ Silla de bebé',
      '  □ GPS',
      '  □ Cadenas',
      '  □ Otros: _______________________',
    ];
    
    checklistItems.forEach((item) => {
      doc.text(item, margin, yPos);
      yPos += 5;
    });
    
    yPos += 10;
    
    // Observaciones
    doc.text('Observaciones:', margin, yPos);
    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    for (let i = 0; i < 4; i++) {
      doc.line(margin, yPos + (i * 8), pageWidth - margin, yPos + (i * 8));
    }
    
    yPos += 40;
    
    // Firmas
    doc.text('Firma entrega (empresa):', margin, yPos);
    doc.text('Firma recepción (cliente):', pageWidth / 2, yPos);
    yPos += 20;
    doc.line(margin, yPos, margin + 60, yPos);
    doc.line(pageWidth / 2, yPos, pageWidth / 2 + 60, yPos);
    
    return doc.output('blob');
  },
};
