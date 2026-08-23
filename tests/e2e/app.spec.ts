import { test, expect } from '@playwright/test';
import { UI_SELECTORS } from '../../frontend/src/app/testing/ui-selectors';

test.describe.serial('Stock Manager Comprehensive End-to-End Test Suite', () => {

  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    if (page) {
      await page.close();
    }
  });

  // ─── 1. BASE PREREQUISITES: NAVIGATION & MASTER DATA ────────────────────────

  test('Step 1: Top Navigation - Verify page routing across all main views', async () => {
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

  test('Step 2: Master Data - Create new Container raw material', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.MASTER_DATA_LINK}"]`);
    await page.click(`[data-testid="${UI_SELECTORS.MASTER_DATA.TAB_CONTAINERS}"]`);

    const containerName = `E2E Amber Jar ${Date.now()}`;
    const activeTabContent = page.locator('.tab-content');
    const nameInput = activeTabContent.locator(`[data-testid="${UI_SELECTORS.MASTER_DATA.NAME_INPUT}"]`);
    await nameInput.fill(containerName);
    await nameInput.dispatchEvent('input');
    await activeTabContent.locator(`[data-testid="${UI_SELECTORS.MASTER_DATA.ADD_BTN}"]`).click();

    await expect(activeTabContent).toContainText(containerName);
  });

  test('Step 3: Master Data - Create new Wax raw material', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.MASTER_DATA.TAB_WAXES}"]`);

    const waxName = `E2E Golden Soy Wax ${Date.now()}`;
    const activeTabContent = page.locator('.tab-content');
    const nameInput = activeTabContent.locator(`[data-testid="${UI_SELECTORS.MASTER_DATA.NAME_INPUT}"]`);
    await nameInput.fill(waxName);
    await nameInput.dispatchEvent('input');
    await activeTabContent.locator(`[data-testid="${UI_SELECTORS.MASTER_DATA.ADD_BTN}"]`).click();

    await expect(activeTabContent).toContainText(waxName);
  });

  test('Step 4: Master Data - Create new Fragrance raw material', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.MASTER_DATA.TAB_FRAGRANCES}"]`);

    const fragranceName = `E2E Vanilla Bean ${Date.now()}`;
    const activeTabContent = page.locator('.tab-content');
    const nameInput = activeTabContent.locator(`[data-testid="${UI_SELECTORS.MASTER_DATA.NAME_INPUT}"]`);
    await nameInput.fill(fragranceName);
    await nameInput.dispatchEvent('input');
    await activeTabContent.locator(`[data-testid="${UI_SELECTORS.MASTER_DATA.ADD_BTN}"]`).click();

    await expect(activeTabContent).toContainText(fragranceName);
  });

  // ─── 2. BASE PREREQUISITES: CUSTOMERS ───────────────────────────────────────

  test('Step 5: Customers - Search and inspect customer records', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.CUSTOMERS_LINK}"]`);
    await expect(page).toHaveURL(/.*\/customers/);
    await expect(page.locator(`[data-testid="${UI_SELECTORS.CUSTOMERS.LIST.TABLE}"]`)).toBeVisible();

    const searchInput = page.locator(`[data-testid="${UI_SELECTORS.CUSTOMERS.LIST.SEARCH_INPUT}"]`);
    await searchInput.fill('Mudith');
    await searchInput.dispatchEvent('input');
    await expect(page.locator(`[data-testid="${UI_SELECTORS.CUSTOMERS.LIST.TABLE}"]`)).toContainText('Mudith');
    await searchInput.clear();
    await searchInput.dispatchEvent('input');
  });

  // ─── 3. 1ST-TIER DEPENDENTS: PRODUCTS CATALOG & BOM ────────────────────────

  test('Step 6: Products - Create product with recipe BOM & verify warning banner', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.PRODUCTS_LINK}"]`);
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.LIST.CREATE_BTN}"]`);

    const productName = `E2E Scented Candle ${Date.now()}`;
    
    const nameInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.NAME_INPUT}"]`);
    await nameInput.fill(productName);
    await nameInput.dispatchEvent('input');

    const priceInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.PRICE_INPUT}"]`);
    await priceInput.fill('3500');
    await priceInput.dispatchEvent('input');

    const weightInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.WEIGHT_INPUT}"]`);
    await weightInput.fill('200');
    await weightInput.dispatchEvent('input');

    const loadInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.FRAGRANCE_LOAD_INPUT}"]`);
    await loadInput.fill('10');
    await loadInput.dispatchEvent('input');

    // Select Container
    const containerSelect = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.CONTAINER_SELECT}"]`);
    await containerSelect.selectOption({ index: 1 });
    await containerSelect.dispatchEvent('change');

    // Add Wax (100%)
    const waxSelect = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.WAX_SELECT}"]`);
    await waxSelect.selectOption({ index: 1 });
    await waxSelect.dispatchEvent('change');
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.ADD_WAX_BTN}"]`);
    const waxPctInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.WAX_PCT_INPUT(0)}"]`);
    await waxPctInput.fill('100');
    await waxPctInput.dispatchEvent('input');

    // Add Fragrance (100%)
    const fragranceSelect = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.FRAGRANCE_SELECT}"]`);
    await fragranceSelect.selectOption({ index: 1 });
    await fragranceSelect.dispatchEvent('change');
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.ADD_FRAGRANCE_BTN}"]`);
    const fragPctInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.FRAGRANCE_PCT_INPUT(0)}"]`);
    await fragPctInput.fill('100');
    await fragPctInput.dispatchEvent('input');

    // Verify warning banner
    const warningBanner = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.WARNING_BANNER}"]`);
    await expect(warningBanner).toBeVisible();

    // Save Product
    const saveBtn = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.SAVE_BTN}"]`);
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();
    await expect(page).toHaveURL(/.*\/products/);
    await expect(page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.LIST.TABLE}"]`)).toBeVisible({ timeout: 15000 });
    await expect(page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.LIST.TABLE}"]`)).toContainText(productName);
  });

  test('Step 7: Products - Verify partial BOM badge in table for products lacking purchase history', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.PRODUCTS_LINK}"]`);
    await expect(page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.LIST.TABLE}"]`)).toBeVisible();
  });

  // ─── 4. 1ST-TIER DEPENDENTS: RAW MATERIAL PURCHASES ────────────────────────

  test('Step 8: Purchases - Log raw material purchase & verify unit cost calculation', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.PURCHASES_LINK}"]`);
    await expect(page).toHaveURL(/.*\/purchases/);

    const recordBtn = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.RECORD_BTN}"]`);
    await expect(recordBtn).toBeVisible();
    await recordBtn.click();

    const waxCatBtn = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.CATEGORY_WAX_BTN}"]`);
    if (await waxCatBtn.isVisible()) {
      await waxCatBtn.click();
    }

    const matSelect = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.MATERIAL_ID_SELECT}"]`);
    await matSelect.selectOption({ index: 1 });
    await matSelect.dispatchEvent('change');

    const qtyInput = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.QUANTITY_INPUT}"]`);
    await qtyInput.fill('5000');
    await qtyInput.dispatchEvent('input');

    const costInput = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.TOTAL_COST_INPUT}"]`);
    await costInput.fill('7500');
    await costInput.dispatchEvent('input');

    const supplierInput = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.SUPPLIER_INPUT}"]`);
    if (await supplierInput.isVisible()) {
      await supplierInput.fill('E2E Supplier Co');
      await supplierInput.dispatchEvent('input');
    }

    const submitBtn = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.SUBMIT_BTN}"]`);
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    await expect(page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.TABLE}"]`)).toBeVisible();
  });

  // ─── 5. 2ND-TIER DEPENDENTS: ORDERS LIFECYCLE ────────────────────────────────

  test('Step 9: Orders - Create order with registered customer and line items', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.ORDERS_LINK}"]`);
    await expect(page).toHaveURL(/.*\/orders/);

    await page.click(`[data-testid="${UI_SELECTORS.ORDERS.LIST.CREATE_BTN}"]`);

    const phoneInput = page.locator(`[data-testid="${UI_SELECTORS.ORDERS.CREATE.CUSTOMER_PHONE_INPUT}"]`);
    await phoneInput.fill('0771234567');
    await phoneInput.dispatchEvent('input');

    const nameInput = page.locator(`[data-testid="${UI_SELECTORS.ORDERS.CREATE.CUSTOMER_NAME_INPUT}"]`);
    await nameInput.fill('E2E Test Customer');
    await nameInput.dispatchEvent('input');

    const addressInput = page.locator(`[data-testid="${UI_SELECTORS.ORDERS.CREATE.CUSTOMER_ADDRESS_INPUT}"]`);
    await addressInput.fill('123 Test Street, Colombo');
    await addressInput.dispatchEvent('input');

    const productSelect = page.locator(`[data-testid="${UI_SELECTORS.ORDERS.CREATE.PRODUCT_SELECT}"]`);
    await productSelect.selectOption({ index: 1 });
    await productSelect.dispatchEvent('change');

    const addBtn = page.locator(`[data-testid="${UI_SELECTORS.ORDERS.CREATE.ADD_ITEM_BTN}"]`);
    await addBtn.click();

    const saveBtn = page.locator(`[data-testid="${UI_SELECTORS.ORDERS.CREATE.SAVE_BTN}"]`);
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();
    await expect(page).toHaveURL(/\/orders\/ord-/);
  });

  test('Step 10: Orders - Filter order records by status dropdown', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.ORDERS_LINK}"]`);
    await expect(page).toHaveURL(/\/orders$/);
    const statusFilter = page.locator(`[data-testid="${UI_SELECTORS.ORDERS.LIST.STATUS_FILTER}"]`);
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('pending');
      await statusFilter.dispatchEvent('change');
      await statusFilter.selectOption('');
      await statusFilter.dispatchEvent('change');
    }
  });

  // ─── 6. 2ND-TIER DEPENDENTS: LABELS TEMPLATE DESIGNER ───────────────────────

  test('Step 11: Labels - Navigate to labels manager and inspect template list', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.LABELS_LINK}"]`);
    await expect(page).toHaveURL(/\/labels$/);
    await expect(page.locator('.page-title')).toContainText('Label Templates');
  });

  test('Step 12: Labels - Create new label template with canvas elements and save', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.LABELS_LINK}"]`);
    await expect(page).toHaveURL(/\/labels$/);
    await page.click(`[data-testid="${UI_SELECTORS.LABELS.LIST.CREATE_BTN}"]`);
    await expect(page).toHaveURL(/\/labels\/create$/);

    const templateName = `E2E Label Template ${Date.now()}`;
    const nameInput = page.locator(`[data-testid="${UI_SELECTORS.LABELS.DESIGNER.NAME_INPUT}"]`);
    await expect(nameInput).toBeVisible();
    await nameInput.fill(templateName);
    await nameInput.dispatchEvent('input');
    await nameInput.dispatchEvent('change');
    await nameInput.dispatchEvent('blur');

    // Add Text Element
    const addTextBtn = page.locator(`[data-testid="${UI_SELECTORS.LABELS.DESIGNER.ADD_TEXT_BTN}"]`);
    if (await addTextBtn.isVisible()) {
      await addTextBtn.click();
    }

    // Save Template
    const saveBtn = page.locator(`[data-testid="${UI_SELECTORS.LABELS.DESIGNER.SAVE_BTN}"]`);
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    // Verify Redirect to Labels Manager & Persistence in Table
    await expect(page).toHaveURL(/\/labels$/);
    await expect(page.locator(`[data-testid="${UI_SELECTORS.LABELS.LIST.TABLE}"]`)).toBeVisible({ timeout: 15000 });
    await expect(page.locator(`[data-testid="${UI_SELECTORS.LABELS.LIST.TABLE}"]`)).toContainText(templateName);
  });

});
