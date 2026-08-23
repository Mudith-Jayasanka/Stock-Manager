import { test, expect } from '@playwright/test';
import { UI_SELECTORS } from '../../frontend/src/app/testing/ui-selectors';

test.describe.serial('Stock Manager Comprehensive End-to-End Test Suite (FEAT-007 Complete BOM)', () => {

  let page;
  let container1Name: string;
  let wax1Name: string;
  let wax2Name: string;
  let frag1Name: string;
  let frag2Name: string;

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

    container1Name = `E2E Amber Jar ${Date.now()}`;
    const activeTabContent = page.locator('.tab-content');
    const nameInput = activeTabContent.locator(`[data-testid="${UI_SELECTORS.MASTER_DATA.NAME_INPUT}"]`);
    await nameInput.fill(container1Name);
    await nameInput.dispatchEvent('input');
    await activeTabContent.locator(`[data-testid="${UI_SELECTORS.MASTER_DATA.ADD_BTN}"]`).click();

    await expect(activeTabContent).toContainText(container1Name);
  });

  test('Step 3: Master Data - Create new Wax raw materials (Soy Wax & Beeswax)', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.MASTER_DATA.TAB_WAXES}"]`);

    wax1Name = `E2E Golden Soy Wax ${Date.now()}`;
    const activeTabContent = page.locator('.tab-content');
    const nameInput = activeTabContent.locator(`[data-testid="${UI_SELECTORS.MASTER_DATA.NAME_INPUT}"]`);
    await nameInput.fill(wax1Name);
    await nameInput.dispatchEvent('input');
    await activeTabContent.locator(`[data-testid="${UI_SELECTORS.MASTER_DATA.ADD_BTN}"]`).click();
    await expect(activeTabContent).toContainText(wax1Name);

    wax2Name = `E2E Beeswax ${Date.now()}`;
    await nameInput.fill(wax2Name);
    await nameInput.dispatchEvent('input');
    await activeTabContent.locator(`[data-testid="${UI_SELECTORS.MASTER_DATA.ADD_BTN}"]`).click();
    await expect(activeTabContent).toContainText(wax2Name);
  });

  test('Step 4: Master Data - Create new Fragrance raw materials (Vanilla & Lavender)', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.MASTER_DATA.TAB_FRAGRANCES}"]`);

    frag1Name = `E2E Vanilla Bean ${Date.now()}`;
    const activeTabContent = page.locator('.tab-content');
    const nameInput = activeTabContent.locator(`[data-testid="${UI_SELECTORS.MASTER_DATA.NAME_INPUT}"]`);
    await nameInput.fill(frag1Name);
    await nameInput.dispatchEvent('input');
    await activeTabContent.locator(`[data-testid="${UI_SELECTORS.MASTER_DATA.ADD_BTN}"]`).click();
    await expect(activeTabContent).toContainText(frag1Name);

    frag2Name = `E2E French Lavender ${Date.now()}`;
    await nameInput.fill(frag2Name);
    await nameInput.dispatchEvent('input');
    await activeTabContent.locator(`[data-testid="${UI_SELECTORS.MASTER_DATA.ADD_BTN}"]`).click();
    await expect(activeTabContent).toContainText(frag2Name);
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

  test('Step 5b: Customers - Create new customer via modal', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.CUSTOMERS_LINK}"]`);
    await page.click(`[data-testid="${UI_SELECTORS.CUSTOMERS.LIST.CREATE_BTN}"]`);

    const customerName = `E2E Customer ${Date.now()}`;
    const customerPhone = `077${Math.floor(1000000 + Math.random() * 9000000)}`;

    const nameInput = page.locator(`[data-testid="${UI_SELECTORS.CUSTOMERS.FORM.NAME_INPUT}"]`);
    await nameInput.fill(customerName);
    await nameInput.dispatchEvent('input');

    const phoneInput = page.locator(`[data-testid="${UI_SELECTORS.CUSTOMERS.FORM.PHONE_INPUT}"]`);
    await phoneInput.fill(customerPhone);
    await phoneInput.dispatchEvent('input');

    const emailInput = page.locator(`[data-testid="${UI_SELECTORS.CUSTOMERS.FORM.EMAIL_INPUT}"]`);
    await emailInput.fill('e2ecustomer@example.com');
    await emailInput.dispatchEvent('input');

    const addressInput = page.locator(`[data-testid="${UI_SELECTORS.CUSTOMERS.FORM.ADDRESS_INPUT}"]`);
    await addressInput.fill('123 E2E Test Lane');
    await addressInput.dispatchEvent('input');

    await page.click(`[data-testid="${UI_SELECTORS.CUSTOMERS.FORM.SAVE_BTN}"]`);

    await expect(page.locator(`[data-testid="${UI_SELECTORS.CUSTOMERS.LIST.TABLE}"]`)).toContainText(customerName);
  });

  // ─── 3. RAW MATERIAL PURCHASES (ESTABLISH COMPLETE BOM BASELINE) ───────────

  test('Step 6: Purchases - Log raw material purchases for Container, Wax 1 & Fragrance 1', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.PURCHASES_LINK}"]`);
    await expect(page).toHaveURL(/.*\/purchases/);

    // 1. Log Container Purchase (50 units @ Rs. 7,500 total -> Rs. 150 / unit)
    await page.click(`[data-testid="${UI_SELECTORS.PURCHASES.RECORD_BTN}"]`);
    await page.click(`[data-testid="${UI_SELECTORS.PURCHASES.CATEGORY_CONTAINER_BTN}"]`);
    const matSelectCt = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.MATERIAL_ID_SELECT}"]`);
    await matSelectCt.selectOption({ label: container1Name });
    await matSelectCt.dispatchEvent('change');
    const qtyCt = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.QUANTITY_INPUT}"]`);
    await qtyCt.fill('50');
    await qtyCt.dispatchEvent('input');
    const costCt = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.TOTAL_COST_INPUT}"]`);
    await costCt.fill('7500');
    await costCt.dispatchEvent('input');
    await page.click(`[data-testid="${UI_SELECTORS.PURCHASES.SUBMIT_BTN}"]`);
    await page.waitForTimeout(500);

    // 2. Log Wax 1 Purchase (5000g / 5kg @ Rs. 5,000 total -> Rs. 1.00 / g)
    await page.click(`[data-testid="${UI_SELECTORS.PURCHASES.RECORD_BTN}"]`);
    await page.click(`[data-testid="${UI_SELECTORS.PURCHASES.CATEGORY_WAX_BTN}"]`);
    const matSelectWax = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.MATERIAL_ID_SELECT}"]`);
    await matSelectWax.selectOption({ label: wax1Name });
    await matSelectWax.dispatchEvent('change');
    const qtyWax = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.QUANTITY_INPUT}"]`);
    await qtyWax.fill('5'); // 5 kg
    await qtyWax.dispatchEvent('input');
    const unitWax = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.UNIT_SELECT}"]`);
    await unitWax.selectOption('kg');
    await unitWax.dispatchEvent('change');
    const costWax = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.TOTAL_COST_INPUT}"]`);
    await costWax.fill('5000');
    await costWax.dispatchEvent('input');
    await page.click(`[data-testid="${UI_SELECTORS.PURCHASES.SUBMIT_BTN}"]`);
    await page.waitForTimeout(500);

    // 3. Log Fragrance 1 Purchase (500ml @ Rs. 5,000 total -> Rs. 10.00 / ml)
    await page.click(`[data-testid="${UI_SELECTORS.PURCHASES.RECORD_BTN}"]`);
    await page.click(`[data-testid="${UI_SELECTORS.PURCHASES.CATEGORY_FRAGRANCE_BTN}"]`);
    const matSelectFrag = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.MATERIAL_ID_SELECT}"]`);
    await matSelectFrag.selectOption({ label: frag1Name });
    await matSelectFrag.dispatchEvent('change');
    const qtyFrag = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.QUANTITY_INPUT}"]`);
    await qtyFrag.fill('500');
    await qtyFrag.dispatchEvent('input');
    const costFrag = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.TOTAL_COST_INPUT}"]`);
    await costFrag.fill('5000');
    await costFrag.dispatchEvent('input');
    await page.click(`[data-testid="${UI_SELECTORS.PURCHASES.SUBMIT_BTN}"]`);

    await expect(page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.TABLE}"]`)).toBeVisible();
  });

  // ─── 4. PRODUCTS CATALOG & COMPLETE BOM VALIDATION ─────────────────────────

  test('Step 7: Products - Create Product with Proper Complete BOM & verify exact cost/profit rollup', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.PRODUCTS_LINK}"]`);
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.LIST.CREATE_BTN}"]`);

    const productName = `E2E Complete BOM Candle ${Date.now()}`;

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

    // Select Container 1
    const containerSelect = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.CONTAINER_SELECT}"]`);
    await containerSelect.selectOption({ label: container1Name });
    await containerSelect.dispatchEvent('change');

    // Add Wax 1 (100%)
    const waxSelect = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.WAX_SELECT}"]`);
    await waxSelect.selectOption({ label: wax1Name });
    await waxSelect.dispatchEvent('change');
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.ADD_WAX_BTN}"]`);
    const waxPctInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.WAX_PCT_INPUT(0)}"]`);
    await waxPctInput.fill('100');
    await waxPctInput.dispatchEvent('input');

    // Add Fragrance 1 (100%)
    const fragranceSelect = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.FRAGRANCE_SELECT}"]`);
    await fragranceSelect.selectOption({ label: frag1Name });
    await fragranceSelect.dispatchEvent('change');
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.ADD_FRAGRANCE_BTN}"]`);
    const fragPctInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.FRAGRANCE_PCT_INPUT(0)}"]`);
    await fragPctInput.fill('100');
    await fragPctInput.dispatchEvent('input');

    // Assert WARNING BANNER IS HIDDEN for Complete BOM
    const warningBanner = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.WARNING_BANNER}"]`);
    await expect(warningBanner).not.toBeVisible();

    // Assert Preview BOM Cost using candle math (513.64)
    const bomCostPreview = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.PREVIEW_BOM_COST}"]`);
    await expect(bomCostPreview).toContainText('513.64');

    // Save Product
    const saveBtn = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.SAVE_BTN}"]`);
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    await expect(page).toHaveURL(/.*\/products/);
    const table = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.LIST.TABLE}"]`);
    await expect(table).toBeVisible({ timeout: 15000 });
    await expect(table).toContainText(productName);
    await expect(table).toContainText('513.64');
  });

  test('Step 7b: Products - Partial to Complete BOM State Transition upon purchase logging', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.PRODUCTS_LINK}"]`);
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.LIST.CREATE_BTN}"]`);

    const partialProductName = `E2E Transition Candle ${Date.now()}`;

    const nameInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.NAME_INPUT}"]`);
    await nameInput.fill(partialProductName);
    await nameInput.dispatchEvent('input');

    const priceInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.PRICE_INPUT}"]`);
    await priceInput.fill('4000');
    await priceInput.dispatchEvent('input');

    const weightInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.WEIGHT_INPUT}"]`);
    await weightInput.fill('200');
    await weightInput.dispatchEvent('input');

    const loadInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.FRAGRANCE_LOAD_INPUT}"]`);
    await loadInput.fill('10');
    await loadInput.dispatchEvent('input');

    // Select Container 1 (has purchase)
    const containerSelect = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.CONTAINER_SELECT}"]`);
    await containerSelect.selectOption({ label: container1Name });
    await containerSelect.dispatchEvent('change');

    // Add Wax 2 (Beeswax - 0 purchases yet!)
    const waxSelect = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.WAX_SELECT}"]`);
    await waxSelect.selectOption({ label: wax2Name });
    await waxSelect.dispatchEvent('change');
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.ADD_WAX_BTN}"]`);
    const waxPctInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.WAX_PCT_INPUT(0)}"]`);
    await waxPctInput.fill('100');
    await waxPctInput.dispatchEvent('input');

    // Add Fragrance 1 (has purchase)
    const fragranceSelect = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.FRAGRANCE_SELECT}"]`);
    await fragranceSelect.selectOption({ label: frag1Name });
    await fragranceSelect.dispatchEvent('change');
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.ADD_FRAGRANCE_BTN}"]`);
    const fragPctInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.FRAGRANCE_PCT_INPUT(0)}"]`);
    await fragPctInput.fill('100');
    await fragPctInput.dispatchEvent('input');

    // Assert Warning Banner IS VISIBLE because Wax 2 is unpriced
    const warningBanner = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.WARNING_BANNER}"]`);
    await expect(warningBanner).toBeVisible();

    // Save Product
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.SAVE_BTN}"]`);
    await expect(page).toHaveURL(/.*\/products/);

    // Verify product row shows Partial BOM warning badge
    const table = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.LIST.TABLE}"]`);
    await expect(table).toContainText(partialProductName);
    await expect(table).toContainText('Partial BOM');

    // Now log purchase for Wax 2 to complete BOM
    await page.click(`[data-testid="${UI_SELECTORS.NAV.PURCHASES_LINK}"]`);
    await page.click(`[data-testid="${UI_SELECTORS.PURCHASES.RECORD_BTN}"]`);
    await page.click(`[data-testid="${UI_SELECTORS.PURCHASES.CATEGORY_WAX_BTN}"]`);
    const matSelectWax2 = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.MATERIAL_ID_SELECT}"]`);
    await matSelectWax2.selectOption({ label: wax2Name });
    await matSelectWax2.dispatchEvent('change');
    const qtyWax2 = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.QUANTITY_INPUT}"]`);
    await qtyWax2.fill('2'); // 2 kg
    await qtyWax2.dispatchEvent('input');
    const unitWax2 = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.UNIT_SELECT}"]`);
    await unitWax2.selectOption('kg');
    await unitWax2.dispatchEvent('change');
    const costWax2 = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.TOTAL_COST_INPUT}"]`);
    await costWax2.fill('4000'); // Rs. 2.00 / g
    await costWax2.dispatchEvent('input');
    await page.click(`[data-testid="${UI_SELECTORS.PURCHASES.SUBMIT_BTN}"]`);

    // Return to Products table and assert Partial BOM badge is GONE
    await page.click(`[data-testid="${UI_SELECTORS.NAV.PRODUCTS_LINK}"]`);
    const productRow = table.locator('tr', { hasText: partialProductName });
    await expect(productRow).not.toContainText('Partial BOM');
  });

  test('Step 7c: Products - Multi-Ingredient Recipe BOM Rollup (60% Soy / 40% Beeswax, 70% Vanilla / 30% Lavender)', async () => {
    // Log purchase for Fragrance 2 (Lavender) first
    await page.click(`[data-testid="${UI_SELECTORS.NAV.PURCHASES_LINK}"]`);
    await page.click(`[data-testid="${UI_SELECTORS.PURCHASES.RECORD_BTN}"]`);
    await page.click(`[data-testid="${UI_SELECTORS.PURCHASES.CATEGORY_FRAGRANCE_BTN}"]`);
    const matSelectFrag2 = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.MATERIAL_ID_SELECT}"]`);
    await matSelectFrag2.selectOption({ label: frag2Name });
    await matSelectFrag2.dispatchEvent('change');
    const qtyFrag2 = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.QUANTITY_INPUT}"]`);
    await qtyFrag2.fill('500');
    await qtyFrag2.dispatchEvent('input');
    const costFrag2 = page.locator(`[data-testid="${UI_SELECTORS.PURCHASES.TOTAL_COST_INPUT}"]`);
    await costFrag2.fill('7500'); // Rs. 15.00 / ml
    await costFrag2.dispatchEvent('input');
    await page.click(`[data-testid="${UI_SELECTORS.PURCHASES.SUBMIT_BTN}"]`);

    // Create Multi-Blend Candle (250g, 10% frag load)
    await page.click(`[data-testid="${UI_SELECTORS.NAV.PRODUCTS_LINK}"]`);
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.LIST.CREATE_BTN}"]`);

    const multiBlendName = `E2E Multi-Blend Candle ${Date.now()}`;

    const nameInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.NAME_INPUT}"]`);
    await nameInput.fill(multiBlendName);
    await nameInput.dispatchEvent('input');

    const priceInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.PRICE_INPUT}"]`);
    await priceInput.fill('4500');
    await priceInput.dispatchEvent('input');

    const weightInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.WEIGHT_INPUT}"]`);
    await weightInput.fill('250');
    await weightInput.dispatchEvent('input');

    const loadInput = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.FRAGRANCE_LOAD_INPUT}"]`);
    await loadInput.fill('10');
    await loadInput.dispatchEvent('input');

    // Container 1 (Rs. 150)
    const containerSelect = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.CONTAINER_SELECT}"]`);
    await containerSelect.selectOption({ label: container1Name });
    await containerSelect.dispatchEvent('change');

    // Add 60% Wax 1 (Soy @ Rs. 1.00/g) & 40% Wax 2 (Beeswax @ Rs. 2.00/g)
    const waxSelect = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.WAX_SELECT}"]`);
    await waxSelect.selectOption({ label: wax1Name });
    await waxSelect.dispatchEvent('change');
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.ADD_WAX_BTN}"]`);
    const wax1Pct = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.WAX_PCT_INPUT(0)}"]`);
    await wax1Pct.fill('60');
    await wax1Pct.dispatchEvent('input');

    await waxSelect.selectOption({ label: wax2Name });
    await waxSelect.dispatchEvent('change');
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.ADD_WAX_BTN}"]`);
    const wax2Pct = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.WAX_PCT_INPUT(1)}"]`);
    await wax2Pct.fill('40');
    await wax2Pct.dispatchEvent('input');

    // Add 70% Fragrance 1 (Vanilla @ Rs. 10.00/ml) & 30% Fragrance 2 (Lavender @ Rs. 15.00/ml)
    const fragSelect = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.FRAGRANCE_SELECT}"]`);
    await fragSelect.selectOption({ label: frag1Name });
    await fragSelect.dispatchEvent('change');
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.ADD_FRAGRANCE_BTN}"]`);
    const frag1Pct = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.FRAGRANCE_PCT_INPUT(0)}"]`);
    await frag1Pct.fill('70');
    await frag1Pct.dispatchEvent('input');

    await fragSelect.selectOption({ label: frag2Name });
    await fragSelect.dispatchEvent('change');
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.ADD_FRAGRANCE_BTN}"]`);
    const frag2Pct = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.FRAGRANCE_PCT_INPUT(1)}"]`);
    await frag2Pct.fill('30');
    await frag2Pct.dispatchEvent('input');

    // Assert calculated BOM cost = 729.55 in preview
    const bomPreview = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.PREVIEW_BOM_COST}"]`);
    await expect(bomPreview).toContainText('729.55');

    // Save and verify in table
    await page.click(`[data-testid="${UI_SELECTORS.PRODUCTS.CREATE.SAVE_BTN}"]`);
    await expect(page).toHaveURL(/.*\/products/);
    const table = page.locator(`[data-testid="${UI_SELECTORS.PRODUCTS.LIST.TABLE}"]`);
    await expect(table).toContainText(multiBlendName);
    await expect(table).toContainText('729.55');
  });

  // ─── 5. 2ND-TIER DEPENDENTS: ORDERS LIFECYCLE ────────────────────────────────

  test('Step 8: Orders - Create order with registered customer and line items', async () => {
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

  test('Step 9: Orders - Filter order records by status dropdown', async () => {
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

  test('Step 10: Labels - Navigate to labels manager and inspect template list', async () => {
    await page.click(`[data-testid="${UI_SELECTORS.NAV.LABELS_LINK}"]`);
    await expect(page).toHaveURL(/\/labels$/);
    await expect(page.locator('.page-title')).toContainText('Label Templates');
  });

  test('Step 11: Labels - Create new label template with canvas elements and save', async () => {
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
