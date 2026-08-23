# Feature Specification: FEAT-007

## Metadata
- **Ticket ID**: `FEAT-007`
- **Title**: Complete BOM Creation, Verification & Expanded Test Suite Scenarios
- **Type**: Feature
- **Status**: Completed
- **Target Branch**: `feat/FEAT-007`
- **Date Created**: 2026-08-23

## Problem & Business Goal
In previous E2E and API testing workflows, products were frequently created with **Partial BOM** (where raw materials lacked logged purchase histories). While testing Partial BOM warning banners and fallbacks is a valid edge case, the system was missing explicit E2E and API test coverage for **Complete (Proper) BOM** lifecycle scenarios.

The goal of this ticket is to implement comprehensive E2E and API test scenarios for products created with complete BOMs and verify all associated details (dynamic BOM cost rollup, profit amount, profit margin %, multi-ingredient wax/fragrance blends, partial-to-complete BOM transitions, live recalculations on purchase additions or product edits, and order profit rollups).

## Functional & Test Requirements

### 1. E2E Test Suite Enhancements (`tests/e2e/app.spec.ts`)
- **Step 6 (Updated)**: Create raw material purchases FIRST for Containers, Waxes, and Fragrances before product creation. Create a candle product with a Complete BOM.
  - Assert that `isBomComplete` is true.
  - Assert that NO warning banner is rendered in the Product Create live preview.
  - Assert exact calculated BOM cost, estimated profit amount, and profit margin percentage.
  - Assert Product List table displays exact BOM cost and a clean positive profit badge (with no amber `Partial BOM` badge).
- **Step 6b (New - Partial to Complete BOM Transition)**: Create a product with unpriced raw materials (Partial BOM), verify amber `Partial BOM` warning badge and tooltip, then log missing material purchases in Purchases UI, and verify the product transitions seamlessly to Complete BOM status without manual editing.
- **Step 6c (New - Multi-Ingredient BOM Recipe Rollup)**: Test products with multi-wax composition (e.g. 60% Soy Wax + 40% Beeswax) and multi-fragrance blends (e.g. 70% Lavender + 30% Vanilla) where all materials have recorded purchase histories. Verify individual material weight rollups and aggregate BOM cost calculation.
- **Step 6d (New - Moving Average Cost Update Propagation)**: Log an additional purchase for an existing raw material at a different purchase price (updating moving average unit cost) and verify that product total BOM cost and profit margin update live across views.
- **Step 6e (New - Product Recipe Edit & Live Recalculation)**: Edit a product's BOM (changing container, adjusting total weight from 200g to 300g, or fragrance load from 8% to 10%) and verify live recalculation of Complete BOM cost and margin.

### 2. API Integration Test Suite Enhancements (`tests/api/products.test.ts` & `tests/api/purchases.test.ts`)
- **Complete BOM Payload Checks**: Verify `isBomComplete: true` and `missingMaterials: []` when all material IDs have purchases.
- **Recipe Rollup Precision Tests**: Verify mathematical formulas for single/multi-ingredient BOM calculations at the API layer:
  $$\text{Wax Cost} = \sum (\text{weightGrams} \times (1 - \text{fragLoad}/100) \times (\text{waxPct}_i/100) \times \text{waxUnitCost}_i)$$
  $$\text{Fragrance Cost} = \sum (\text{weightGrams} \times (\text{fragLoad}/100) \times (\text{fragPct}_i/100) \times \text{fragUnitCost}_i)$$
  $$\text{Container Cost} = \text{containerUnitCost}$$
- **Order Downstream Profit Checks**: Verify order line item profit calculations accurately reflect products with complete BOM cost rollups.

## Conflict & Regression Detection
- Scanned existing specifications (`FEAT-000` through `FEAT-006`, `BUG-001` through `BUG-003`). No conflicts found.
- Extends and completes `FEAT-001` and `FEAT-002` testing coverage without modifying core DB schema or API contracts.

## Verification Plan
1. Run backend API test suite: `npm run test:api`.
2. Run headless Playwright E2E test suite: `npm run test:e2e`.
3. Verify 100% test passage across all test scenarios.

