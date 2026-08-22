# Feature Specification: FEAT-003

## Metadata
- **Ticket ID**: `FEAT-003`
- **Title**: Comprehensive Automated Verification Test Suite for Core Legacy Features
- **Type**: Feature
- **Status**: Completed
- **Target Branch**: `feat/FEAT-003`
- **Date Created**: 2026-08-22

## Problem & Business Goal
Prior to introducing ticket-based feature specifications, core system modules were implemented without automated unit/integration test suites or explicit `data-testid` tagging. These legacy modules include:
1. **Master Data Management**: CRUD and active/inactive state toggling for Waxes, Fragrances, and Container Types.
2. **Customer Management**: Phone-based customer lookups, creation, and record updates.
3. **Orders & Inventory Workflow**: Order lifecycle transitions (`pending` -> `making` -> `packaging` -> `dispatched` -> `delivered` / `cancelled`), line item profit rollups, and stock calculations.
4. **Label Printing Templates**: Variable mapping evaluations (`order.customer.fullName`, `product.name`) and schema validations.

The goal is to extend `UI_SELECTORS` (`data-testid` tags) across all remaining Angular HTML templates and write API integration tests covering all legacy modules.

## Functional Requirements
1. **UI Selectors Registry Expansion (`frontend/src/app/testing/ui-selectors.ts`)**:
   - Add selector keys for Customers (`CUSTOMERS.LIST`, `CUSTOMERS.FORM`), Orders (`ORDERS.LIST`, `ORDERS.CREATE`, `ORDERS.STATUS_SELECT`), and Label Designer (`LABELS.LIST`, `LABELS.DESIGNER`).
2. **Template `data-testid` Tagging**:
   - Add `data-testid` attributes to HTML templates for Master Data, Customers, Orders, and Label Templates.
3. **API Integration Test Suites**:
   - `tests/api/master_data.test.ts`: Verify CRUD, unique constraints, and active/inactive toggles.
   - `tests/api/customers.test.ts`: Verify phone-based lookups, uniqueness, and profile updates.
   - `tests/api/orders.test.ts`: Verify order creation, status transitions, cancellation reason rules, and profit totals.
   - `tests/api/labels.test.ts`: Verify label template CRUD and placeholder mapping logic.
   - `tests/api/all.test.ts`: Combined runner for all API test suites with clean DB teardown.
4. **Verification Skill Integration**:
   - Update `.agents/skills/verification-workflow/SKILL.md` to execute all API test suites in a single command.

## Conflict & Regression Detection
- Scanned existing specifications (`FEAT-000`, `FEAT-001`, `FEAT-002`, `BUG-001`). No conflicts found.
- Non-breaking addition of test attributes and test suites.

## Verification Plan
1. Run combined automated test suite: `DB_MODE=development npx ts-node --test tests/api/all.test.ts`
2. Verify all test suites pass with 0 failures.
