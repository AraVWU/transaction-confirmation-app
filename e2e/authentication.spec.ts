/**
 * E2E Tests - Authentication Flow
 * Tests login, logout, and protected routes
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testUser = {
    email: 'e2e-test@vapewholesaleusa.com',
    password: 'TestPassword123!',
  };

  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login|sign in/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('wrong@vapewholesaleusa.com');
    await page.getByLabel(/password/i).fill('WrongPassword!');
    await page.getByRole('button', { name: /login|sign in/i }).click();

    await expect(page.getByText(/invalid|incorrect|error/i)).toBeVisible({ timeout: 10000 });
  });

  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    // Try to access transaction records without login
    await page.goto('/transactions');

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('link', { name: /register|sign up|create account/i }).click();

    await expect(page).toHaveURL(/register/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should reject non-company email during registration', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel(/email/i).fill('user@gmail.com');
    await page.getByLabel(/password/i).fill('Password123!');

    // Try to register
    await page.getByRole('button', { name: /register|sign up|create/i }).click();

    // Should show company email error
    await expect(page.getByText(/vapewholesaleusa\.com/i)).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('link', { name: /forgot|reset/i }).click();

    await expect(page).toHaveURL(/reset|forgot/);
  });
});

test.describe('Authenticated User Actions', () => {
  // Use a fixture for authenticated state
  test.use({
    storageState: 'e2e/.auth/user.json',
  });

  test.skip('should display transaction records when authenticated', async ({ page }) => {
    // This test requires a valid auth state file
    await page.goto('/transactions');

    await expect(page.getByRole('table')).toBeVisible();
  });

  test.skip('should allow logout', async ({ page }) => {
    await page.goto('/transactions');

    // Find and click logout button
    await page.getByRole('button', { name: /logout|sign out/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });
});
