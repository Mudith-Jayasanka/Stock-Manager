# Feature Specification: FEAT-004

## Metadata
- **Ticket ID**: `FEAT-004`
- **Title**: Frontend Playwright E2E Test Suite & Visibly Headed Test Execution
- **Type**: Feature
- **Status**: Completed
- **Target Branch**: `feat/FEAT-004`
- **Date Created**: 2026-08-22
- **Date Completed**: 2026-08-23
- **Prerequisite Ticket**: `FEAT-005`

## Problem & Business Goal
The user requested to see the frontend E2E test execution visibly on their screen (in headed mode) rather than purely headless background execution.
To achieve this, we need a Playwright end-to-end test suite that interacts with the Angular frontend UI strictly using the registered `data-testid` selectors in `frontend/src/app/testing/ui-selectors.ts`, running against `devdb` with a visible browser window (`headless: false`).

## Functional Requirements
1. **Playwright E2E Setup**:
   - Install `@playwright/test` and configure `playwright.config.ts`.
   - Add scripts to `frontend/package.json` / root for running Playwright E2E tests in both headed (`npm run test:e2e:headed`) and headless (`npm run test:e2e`) modes.

2. **Frontend End-to-End Test Suite (`tests/e2e/app.spec.ts`)**:
   - **Navigation & Page Loading**: Verify navigation across Products, Purchases, Master Data, Customers, Orders, and Labels using `UI_SELECTORS.NAV` tags.
   - **Products Flow**:
     - Create a product via `UI_SELECTORS.PRODUCTS.CREATE`.
     - Verify live BOM cost preview alert banner and profit calculation.
     - Save product and verify appearance in `UI_SELECTORS.PRODUCTS.LIST.TABLE`.
     - Check Partial BOM warning badge ⚠️ and hover tooltip when raw materials lack purchase history.
   - **Master Data & Purchases Flow**:
     - Toggle material active status in Master Data tabs.
     - Log a raw material purchase with quantity and unit cost.
     - Verify product BOM cost dynamically updates from Rs. 0 / $0 to calculated cost.
   - **Orders Flow**:
     - Select customer & product, fill quantity, create order.
     - Update order status through stages (`pending` -> `making` -> `packaging` -> `dispatched` -> `delivered`).

3. **Visible Real-Time Execution**:
   - Run tests with `headless: false` and viewport configured so the browser window launches visibly on the desktop screen.
   - Slow down action steps slightly (`slowMo`) if desired, so the user can watch the form inputs, navigation, button clicks, tooltips, and status updates live.

## Conflict & Regression Detection
- Scanned existing specifications (`FEAT-000`, `FEAT-001`, `FEAT-002`, `FEAT-003`, `BUG-001`). No conflicts found.
- Non-breaking addition of E2E test automation.

## Verification Plan
1. Ensure `devdb` is in baseline state (`npm run db:restore:dev`).
2. Start backend dev server (`DB_MODE=development npm run dev:devdb`).
3. Start frontend dev server (`npm run start`).
4. Execute Playwright tests visibly (`npm run test:e2e:headed`).
5. Verify 100% pass rate with zero test failures.

