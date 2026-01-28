# Supabase Edge Functions - Integración Stripe

Este directorio contiene las Edge Functions necesarias para la integración con Stripe.

## Funciones Disponibles

### 1. `create-payment-intent`
Crea una intención de pago en Stripe para procesar pagos de reservas.

**Endpoint:** `POST /functions/v1/create-payment-intent`

**Body:**
```json
{
  "bookingId": "uuid",
  "amount": 10000, // en centavos
  "currency": "eur",
  "paymentType": "booking",
  "metadata": {}
}
```

### 2. `process-refund`
Procesa un reembolso a través de Stripe.

**Endpoint:** `POST /functions/v1/process-refund`

**Body:**
```json
{
  "paymentIntentId": "pi_xxxxx",
  "amount": 5000, // opcional, en centavos. Si no se especifica, reembolso total
  "reason": "Cancelación de reserva"
}
```

## Configuración

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Iniciar sesión en Supabase

```bash
supabase login
```

### 3. Vincular tu proyecto

```bash
supabase link --project-ref tu-project-ref
```

### 4. Configurar Secret de Stripe

En el dashboard de Supabase:
- Ve a **Settings** > **Edge Functions** > **Secrets**
- Añade el secret: `STRIPE_SECRET_KEY` con tu clave secreta de Stripe

O usando CLI:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
```

### 5. Desplegar las funciones

```bash
# Desplegar todas las funciones
supabase functions deploy

# O desplegar una función específica
supabase functions deploy create-payment-intent
supabase functions deploy process-refund
```

## Desarrollo Local

Para probar las funciones localmente:

```bash
# Iniciar el entorno local
supabase start

# Ejecutar una función localmente
supabase functions serve create-payment-intent
```

## Notas

- Las funciones requieren que `STRIPE_SECRET_KEY` esté configurado como secret en Supabase
- En producción, usa la clave secreta de Stripe (sk_live_xxxxx)
- En desarrollo, puedes usar la clave de test (sk_test_xxxxx)
- Las funciones incluyen CORS headers para permitir llamadas desde el frontend
