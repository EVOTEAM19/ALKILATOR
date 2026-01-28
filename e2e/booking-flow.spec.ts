import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Ir a la landing
    await page.goto('/');
  });

  test('complete booking flow from search to confirmation', async ({ page }) => {
    // 1. Buscar vehículos disponibles
    await page.getByLabel(/lugar de recogida/i).click();
    await page.getByRole('option', { name: /madrid/i }).click();

    await page.getByLabel(/fecha de recogida/i).click();
    // Seleccionar fecha futura
    await page.getByRole('gridcell', { name: '15' }).click();

    await page.getByLabel(/fecha de devolución/i).click();
    await page.getByRole('gridcell', { name: '20' }).click();

    await page.getByRole('button', { name: /buscar/i }).click();

    // 2. Esperar resultados y seleccionar vehículo
    await expect(page.getByText(/vehículos disponibles/i)).toBeVisible();
    
    const vehicleCard = page.locator('[data-testid="vehicle-card"]').first();
    await expect(vehicleCard).toBeVisible();
    await vehicleCard.getByRole('button', { name: /seleccionar/i }).click();

    // 3. Página de extras
    await expect(page.getByText(/extras y servicios/i)).toBeVisible();
    
    // Seleccionar un extra
    await page.getByText(/gps/i).click();
    await page.getByRole('button', { name: /continuar/i }).click();

    // 4. Datos del cliente
    await expect(page.getByText(/datos del conductor/i)).toBeVisible();

    await page.getByLabel(/nombre/i).fill('Juan');
    await page.getByLabel(/apellidos/i).fill('García Test');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/teléfono/i).fill('+34600000000');
    await page.getByLabel(/dni/i).fill('12345678A');

    await page.getByRole('button', { name: /continuar/i }).click();

    // 5. Confirmación
    await expect(page.getByText(/resumen de tu reserva/i)).toBeVisible();
    await expect(page.getByText(/juan garcía/i)).toBeVisible();

    // Aceptar términos
    await page.getByLabel(/acepto los términos/i).check();
    
    await page.getByRole('button', { name: /confirmar reserva/i }).click();

    // 6. Página de éxito
    await expect(page.getByText(/reserva confirmada/i)).toBeVisible();
    await expect(page.getByText(/alk-/i)).toBeVisible();
  });

  test('shows validation errors on empty form', async ({ page }) => {
    // Navegar directamente a datos del cliente
    await page.goto('/reserva/datos');

    await page.getByRole('button', { name: /continuar/i }).click();

    await expect(page.getByText(/nombre.*obligatorio/i)).toBeVisible();
    await expect(page.getByText(/email.*obligatorio/i)).toBeVisible();
  });

  test('allows modifying search criteria', async ({ page }) => {
    await page.getByRole('button', { name: /buscar/i }).click();
    
    // Modificar búsqueda
    await page.getByRole('button', { name: /modificar/i }).click();

    await expect(page.getByLabel(/lugar de recogida/i)).toBeVisible();
  });
});
