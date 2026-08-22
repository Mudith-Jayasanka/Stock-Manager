# Feature Specification: FEAT-002

## Metadata
- **Ticket ID**: `FEAT-002`
- **Title**: Incomplete BOM Cost Warning & Missing Raw Materials Tooltip
- **Type**: Feature
- **Status**: Draft
- **Target Branch**: `feat/FEAT-002`
- **Date Created**: 2026-08-22

## Problem & Business Goal
When a product uses raw materials (wax, fragrance, container) that do not yet have recorded purchase histories in the system, their unit cost defaults to $0 / Rs. 0. The app currently displays the resulting partial BOM cost without indicating that raw material costs are missing. This is misleading as users may interpret partial costs as total product manufacturing costs.

The goal is to provide visual warnings and detailed hover tooltips indicating when a product's BOM cost is incomplete due to missing raw material purchase records.

## Functional Requirements
1. **Backend Payload Enrichment (`enrichProduct`)**:
   - Detect if any raw material assigned to a product (container type, waxes, fragrances) has `unit_cost === 0`.
   - Add `isBomComplete` boolean field to the product JSON output.
   - Add `missingMaterials` array containing human-readable names and types of unpriced materials (e.g., `["Container: Amber Glass Jar", "Fragrance: Vanilla Velvet"]`).

2. **Products List UI (`ProductsListComponent`)**:
   - Display a warning icon ⚠️ and amber badge (e.g. `Partial BOM`) next to the cost when `isBomComplete === false`.
   - On hover over the icon/badge, show a tooltip detailing which raw materials are missing purchase history.

3. **Product Create/Edit Form UI (`ProductCreateComponent`)**:
   - In the live BOM cost preview panel, render an alert banner listing any ingredients that currently lack unit cost data.

## Conflict & Regression Detection
- Scanned existing specifications (`FEAT-000`, `FEAT-001`, `BUG-001`). No conflicts found.
- Extends `FEAT-001` dynamic BOM cost calculation without altering underlying calculation formulas or database schema.

## Verification Plan
1. Create a product with 3 ingredients (wax, fragrance, container) where only 1 ingredient has recorded purchases.
2. Verify products table shows `Partial BOM ⚠️` badge and hover tooltip lists the 2 missing ingredients.
3. Record purchases for remaining ingredients and verify badge automatically turns into standard `BOM` badge with complete cost.

