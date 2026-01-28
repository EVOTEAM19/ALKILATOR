import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
} from 'lucide-react';

// ==================== FORM FIELD CON ACCESIBILIDAD ====================

interface AccessibleFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (props: {
    id: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
    'aria-required'?: boolean;
  }) => React.ReactNode;
}

export function AccessibleField({
  label,
  error,
  hint,
  required,
  children,
}: AccessibleFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-hidden>
            *
          </span>
        )}
        {required && <span className="sr-only">(requerido)</span>}
      </label>

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': !!error,
        'aria-required': required,
      })}

      {hint && !error && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="text-sm text-destructive flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="h-4 w-4" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

// ==================== ALERTS ACCESIBLES ====================

interface AccessibleAlertProps {
  variant: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const alertIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const alertStyles = {
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200',
  success:
    'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-200',
  warning:
    'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-200',
  error:
    'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200',
};

const alertRoles = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  error: 'alert',
} as const;

export function AccessibleAlert({
  variant,
  title,
  children,
  className,
}: AccessibleAlertProps) {
  const Icon = alertIcons[variant];

  return (
    <div
      role={alertRoles[variant]}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'p-4 rounded-lg border flex gap-3',
        alertStyles[variant],
        className
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden />
      <div>
        {title && <p className="font-medium">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}

// ==================== TABLA ACCESIBLE ====================

interface AccessibleTableProps {
  caption: string;
  headers: string[];
  rows: (string | React.ReactNode)[][];
  className?: string;
}

export function AccessibleTable({
  caption,
  headers,
  rows,
  className,
}: AccessibleTableProps) {
  return (
    <div
      className={cn('overflow-x-auto', className)}
      role="region"
      aria-label={caption}
    >
      <table className="w-full border-collapse">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b bg-muted/50">
            {headers.map((header, i) => (
              <th
                key={i}
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-sm">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==================== BOTÓN CON LOADING ACCESIBLE ====================

interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const AccessibleButton = forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps
>(
  (
    {
      isLoading,
      loadingText = 'Cargando...',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="sr-only">{loadingText}</span>
            <span aria-hidden>{loadingText}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

// ==================== IMAGEN ACCESIBLE ====================

interface AccessibleImageProps {
  src: string;
  alt: string;
  decorative?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export function AccessibleImage({
  src,
  alt,
  decorative = false,
  className,
  width,
  height,
}: AccessibleImageProps) {
  if (decorative) {
    return (
      <img
        src={src}
        alt=""
        role="presentation"
        className={className}
        width={width}
        height={height}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
    />
  );
}

// ==================== LINK EXTERNO ACCESIBLE ====================

interface ExternalLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

export function ExternalLink({ children, ...props }: ExternalLinkProps) {
  return (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (se abre en una nueva ventana)</span>
    </a>
  );
}

// ==================== VISUALLY HIDDEN ====================

export function VisuallyHidden({
  children,
}: {
  children: React.ReactNode;
}) {
  return <span className="sr-only">{children}</span>;
}
