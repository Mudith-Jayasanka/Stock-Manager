import { test, expect } from '@playwright/test';
import { UI_SELECTORS } from '../../frontend/src/app/testing/ui-selectors';

test.describe.serial('Stock Manager Complete Sequential E2E Flow', () => {

  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Step 1: Navigation - Verify top navigation bar routing', async () => {
    await page.goto('/');

    await page.click(`[data-testid="${UI_SELECTORS.NAV.MASTER_DATA_LINK}"]`);
    await expect(page).toHaveURL(/.*\/master-data/);

    await page.click(`[data-testid="${UI_SELECTORS.NAV.CUSTOMERS_LINK}"]`);
    await expect(page).toHaveURL(/.*\/customers/);

    await page.click(`[data-testid="${UI_SELECTORS.NAV.PRODUCTS_LINK}"]`);
    await expect(page).toHaveURL(/.*\/products/);

    await page.click(`[data-testid="${UI_SELECTORS.NAV.PURCHASES_LINK}"]`);
    await expect(page).toHaveURL(/.*\/purchases/);

    await page.click(`[data-testid="${UI_SELECTORS.NAV.ORDERS_LINK}"]`);
    await expect(page).toHaveURL(/.*\/orders/);

    await page.click(`[data-testid="${UI_SELECTORS.NAV.LABELS_LINK}"]`);
    await expect(page).toHaveURL(/.*\/labels/);
  });

  test('Step 2: Master Data (Base Prerequisite) - Create new raw material', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.MASTER_DATA_LINK}"]`);
    await page.click(`[data-testid="${UI_SELECTORS.MASTER_DATA.TAB_CONTAINERS}"]`);

    const containerName = `E2E Amber Jar ${Date.now()}`;
    const nameInput = page.locator(`[data-testid="${UI_SELECTORS.MASTER_DATA.NAME_INPUT}"]`);
    await nameInput.fill(containerName);
    await nameInput.press('Enter');

    await expect(page.locator('body')).toContainText(containerName);
  });

  test('Step 3: Customers (Base Prerequisite) - Search & inspect customer records', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.CUSTOMERS_LINK}"]`);
    await expect(page).toHaveURL(/.*\/customers/);
    await expect(page.locator('h1')).toContainText(/Customers/i);
    await expect(page.locator('table.data-table')).toBeVisible();
  });

  test('Step 4: Products (1st-tier Dependent) - Create candle product with complete BOM', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.PRODUCTS_LINK}"]`);
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.LIST.CREATE_BTN}"]`);

    const productName = `E2E Vanilla Velvet ${Date.now()}`;
    await page.fill(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.NAME_INPUT}"]`, productName);
    await page.fill(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.PRICE_INPUT}"]`, '2200');
    await page.fill(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.WEIGHT_INPUT}"]`, '250');
    await page.fill(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.FRAGRANCE_LOAD_INPUT}"]`, '10');

    // Select Container
    const containerSelect = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.CONTAINER_SELECT}"]`);
    await containerSelect.selectOption({ index: 1 });

    // Add Wax (100%)
    const waxSelect = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.WAX_SELECT}"]`);
    await waxSelect.selectOption({ index: 1 });
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.ADD_WAX_BTN}"]`);
    const waxPctInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.WAX_PCT_INPUT(0)}"]`);
    await waxPctInput.fill('100');
    await waxPctInput.dispatchEvent('input');

    // Add Fragrance (100%)
    const fragranceSelect = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.FRAGRANCE_SELECT}"]`);
    await fragranceSelect.selectOption({ index: 1 });
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.ADD_FRAGRANCE_BTN}"]`);
    const fragPctInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.FRAGRANCE_PCT_INPUT(0)}"]`);
    await fragPctInput.fill('100');
    await fragPctInput.dispatchEvent('input');

    // Save Product and wait for router navigation
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.SAVE_BTN}"]`);
    await page.waitForURL('**/products', { timeout: 15000 });

    await expect(page.locator('body')).toContainText(productName);
  });

  test('Step 5: Purchases (1st-tier Dependent) - Raw material purchase overview', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.PURCHASES_LINK}"]`);
    await expect(page.locator('h1')).toContainText(/Purchases/i);
  });

  test('Step 6: Orders (2nd-tier Dependent) - Navigate to orders dashboard', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.ORDERS_LINK}"]`);
    await expect(page.locator(`[data-testid="${UI_SELECTORS.ORDERS.LIST.CREATE_BTN}"]`)).toBeVisible();
  });

});
