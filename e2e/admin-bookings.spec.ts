import { test, expect } from '@playwright/test';

test.describe('Admin Bookings', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('admin@test.com');
    await page.getByLabel(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Esperar a que cargue el dashboard
    await expect(page).toHaveURL(/\/admin/);
  });

  test('displays bookings list', async ({ page }) => {
    await page.goto('/admin/reservas');

    await expect(page.getByRole('heading', { name: /reservas/i })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('filters bookings by status', async ({ page }) => {
    await page.goto('/admin/reservas');

    await page.getByRole('combobox', { name: /estado/i }).click();
    await page.getByRole('option', { name: /confirmada/i }).click();

    // Verificar que se aplicó el filtro
    await expect(page).toHaveURL(/status=confirmed/);
  });

  test('opens booking detail', async ({ page }) => {
    await page.goto('/admin/reservas');

    // Click en primera reserva
    const firstRow = page.locator('tbody tr').first();
    await firstRow.getByRole('link').first().click();

    // Verificar que estamos en el detalle
    await expect(page.getByText(/detalles de la reserva/i)).toBeVisible();
  });

  test('changes booking status', async ({ page }) => {
    await page.goto('/admin/reservas');

    // Abrir detalle de reserva
    const firstRow = page.locator('tbody tr').first();
    await firstRow.getByRole('link').first().click();

    // Cambiar estado
    await page.getByRole('button', { name: /cambiar estado/i }).click();
    await page.getByRole('menuitem', { name: /confirmar/i }).click();

    // Verificar toast de éxito
    await expect(page.getByText(/estado actualizado/i)).toBeVisible();
  });

  test('creates new booking from admin', async ({ page }) => {
    await page.goto('/admin/reservas/nueva');

    // Llenar formulario
    await page.getByLabel(/cliente/i).click();
    await page.getByRole('option').first().click();

    await page.getByLabel(/grupo de vehículos/i).click();
    await page.getByRole('option').first().click();

    await page.getByLabel(/fecha de recogida/i).fill('2024-06-01');
    await page.getByLabel(/fecha de devolución/i).fill('2024-06-05');

    await page.getByRole('button', { name: /crear reserva/i }).click();

    // Verificar redirección a detalle
    await expect(page).toHaveURL(/\/admin\/reservas\/[a-z0-9-]+/);
  });
});
