/**
 * E2E Tests - Transaction Submission Flow
 * Tests the complete customer transaction submission workflow
 */

import { test, expect } from '@playwright/test';

test.describe('Transaction Submission Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the transaction form', async ({ page }) => {
    // Check form elements are visible
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/order number/i)).toBeVisible();
    await expect(page.getByLabel(/amount/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /submit/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /submit/i }).click();

    // Should show validation messages
    await expect(page.getByText(/required/i)).toBeVisible();
  });

  test('should submit transaction successfully', async ({ page }) => {
    // Fill in the form
    await page.getByLabel(/email/i).fill('testcustomer@example.com');
    await page.getByLabel(/order number/i).fill(`TEST${Date.now()}`);
    await page.getByLabel(/amount/i).fill('100.00');
    await page.getByLabel(/transaction number/i).fill('TXN123456');

    // Select transaction type
    await page.getByLabel(/transaction type/i).click();
    await page.getByRole('option', { name: /zelle/i }).click();

    // Submit
    await page.getByRole('button', { name: /submit/i }).click();

    // Should show success message
    await expect(page.getByText(/success|submitted|thank you/i)).toBeVisible({ timeout: 10000 });
  });

  test('should prevent duplicate order number submission', async ({ page }) => {
    const orderNumber = `DUP${Date.now()}`;

    // Submit first transaction
    await page.getByLabel(/email/i).fill('test1@example.com');
    await page.getByLabel(/order number/i).fill(orderNumber);
    await page.getByLabel(/amount/i).fill('50.00');
    await page.getByLabel(/transaction number/i).fill('TXN111');
    await page.getByLabel(/transaction type/i).click();
    await page.getByRole('option', { name: /zelle/i }).click();
    await page.getByRole('button', { name: /submit/i }).click();

    // Wait for success
    await expect(page.getByText(/success|submitted|thank you/i)).toBeVisible({ timeout: 10000 });

    // Reload and try to submit same order number
    await page.reload();
    await page.getByLabel(/email/i).fill('test2@example.com');
    await page.getByLabel(/order number/i).fill(orderNumber);
    await page.getByLabel(/amount/i).fill('75.00');
    await page.getByLabel(/transaction number/i).fill('TXN222');
    await page.getByLabel(/transaction type/i).click();
    await page.getByRole('option', { name: /zelle/i }).click();
    await page.getByRole('button', { name: /submit/i }).click();

    // Should show error about duplicate
    await expect(page.getByText(/already exists|duplicate/i)).toBeVisible({ timeout: 10000 });
  });
});
