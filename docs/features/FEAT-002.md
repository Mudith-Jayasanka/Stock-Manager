# Feature Specification: FEAT-002

## Metadata
- **Ticket ID**: `FEAT-002`
- **Title**: Incomplete BOM Cost Warning, Missing Raw Materials Tooltip & Automated Verification Test Suite
- **Type**: Feature
- **Status**: Completed
- **Target Branch**: `feat/FEAT-002`
- **Date Created**: 2026-08-22

## Problem & Business Goal
1. **Incomplete BOM Warning**: When a product uses raw materials (wax, fragrance, container) that do not yet have recorded purchase histories in the system, their unit cost defaults to $0 / Rs. 0. The app currently displays the resulting partial BOM cost without indicating that raw material costs are missing, which is misleading.
2. **Automated Verification**: Manual regression testing across all user flows for every change is impractical. An automated testing system with direct `data-testid` targeting and a dedicated agent verification skill is needed to automate full-stack testing.

## Functional Requirements
1. **Backend Payload Enrichment (`enrichProduct`)**:
   - Detect if any raw material assigned to a product (container type, waxes, fragrances) has `unit_cost === 0`.
   - Add `isBomComplete` boolean field to the product JSON output.
   - Add `missingMaterials` array containing human-readable names and types of unpriced materials (e.g., `["Container: Amber Glass Jar", "Fragrance: Vanilla Velvet"]`).

2. **Products List UI (`ProductsListComponent`)**:
   - Tag UI elements with standardized `data-testid` attributes (`data-testid="product-cost-cell-..."`).
   - Display a warning icon ⚠️ and amber badge (`Partial BOM`) next to the cost when `isBomComplete === false`.
   - On hover over the icon/badge, show a tooltip detailing which raw materials are missing purchase history.

3. **Product Create/Edit Form UI (`ProductCreateComponent`)**:
   - Tag form controls with `data-testid` attributes (`product-name-input`, `product-price-input`, `save-product-btn`, `preview-bom-cost`).
   - In the live BOM cost preview panel, render an alert banner listing any ingredients that currently lack unit cost data.

4. **UI Selectors Registry**:
   - Create `frontend/src/app/testing/ui-selectors.ts` exporting a structured registry of all test IDs across pages (Products, Purchases, Master Data, Orders).

5. **Automated Verification Test Framework**:
   - **Backend API Integration Tests**: Test API endpoints, purchase cost updates, BOM cost rollups, and product CRUD against `devdb`.
   - **Frontend Playwright E2E Tests**: Run headless E2E tests interacting strictly with `data-testid` targets specified in `ui-selectors.ts`.

6. **Agent Verification Workflow Skill (`verification-workflow`)**:
   - Create `.agents/skills/verification-workflow/SKILL.md` defining automated steps for baseline restoration, running test suites, and log inspection.

## Conflict & Regression Detection
- Scanned existing specifications (`FEAT-000`, `FEAT-001`, `BUG-001`). No conflicts found.
- Extends `FEAT-001` dynamic BOM cost calculation without altering underlying calculation formulas or database schema.

## Verification Plan
1. Run backend integration test suite: `npm run test:api`.
2. Run frontend E2E Playwright test suite targeting `data-testid` elements: `npm run test:e2e`.
3. Execute `.agents/skills/verification-workflow/SKILL.md` workflow to verify clean passage of all automated test suites.
