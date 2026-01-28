import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

// Combinar clases de Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatear precio
export function formatPrice(amount: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(amount)
}

// Formatear fecha
export function formatDate(
  date: Date | string,
  formatStr: string = "dd/MM/yyyy"
): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, formatStr, { locale: es })
}

// Formatear fecha y hora
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "dd/MM/yyyy HH:mm", { locale: es })
}

// Tiempo relativo (hace X minutos)
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: es })
}

// Calcular días entre fechas
export function daysBetween(
  startDate: Date | string,
  endDate: Date | string
): number {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate
  const end = typeof endDate === "string" ? new Date(endDate) : endDate
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Generar slug
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

// Validar matrícula española
export function isValidSpanishPlate(plate: string): boolean {
  const pattern = /^[0-9]{4}[A-Z]{3}$/
  return pattern.test(plate.replace(/\s/g, "").toUpperCase())
}

// Validar DNI/NIE español
export function isValidSpanishId(id: string): boolean {
  const dniPattern = /^[0-9]{8}[A-Z]$/
  const niePattern = /^[XYZ][0-9]{7}[A-Z]$/
  const cleanId = id.replace(/\s/g, "").toUpperCase()
  return dniPattern.test(cleanId) || niePattern.test(cleanId)
}

// Truncar texto
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + "..."
}

// Generar número de reserva
export function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ALK-${year}-${random}`;
}

// Calcular días entre fechas
export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

// Validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar teléfono
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[0-9]{9,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Validar DNI
export function isValidDNI(dni: string): boolean {
  const dniRegex = /^[0-9]{8}[A-Za-z]$/;
  return dniRegex.test(dni);
}

// Validar NIE
export function isValidNIE(nie: string): boolean {
  const nieRegex = /^[XYZxyz][0-9]{7}[A-Za-z]$/;
  return nieRegex.test(nie);
}

// Validar matrícula (genérico)
export function isValidPlate(plate: string): boolean {
  // Formato español: 1234ABC o antiguo con letras
  const plateRegex = /^[0-9]{4}[A-Z]{3}$|^[A-Z]{1,2}[0-9]{4}[A-Z]{2}$/;
  return plateRegex.test(plate.toUpperCase().replace(/\s/g, ''));
}
