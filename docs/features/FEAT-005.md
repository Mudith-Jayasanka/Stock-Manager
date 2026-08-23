# Feature Specification: FEAT-005

## Metadata
- **Ticket ID**: `FEAT-005`
- **Title**: Standardized data-testid UI Tagging & Registry Expansion across All Angular Templates
- **Type**: Feature
- **Status**: Completed
- **Target Branch**: `feat/FEAT-005`
- **Date Created**: 2026-08-22

## Problem & Business Goal
Comprehensive E2E test automation requires every interactive element, modal input, table row, filter dropdown, and action button to have an explicit, unambiguous `data-testid` attribute.
Currently, several interactive UI elements across Customers, Orders, Labels, and Purchases HTML templates lack `data-testid` tags, preventing Playwright from reliably interacting with modal forms, filters, and line items.

## Functional Requirements
1. **Template Tagging (`data-testid`)**:
   - `customers-list.component.html`: Search input, edit/delete buttons, edit modal inputs (name, phone, email, address), edit modal Save/Cancel buttons, delete modal confirm/cancel buttons.
   - `order-create.component.html`: Phone input, full name input, email input, address textarea, status badge, product select, add product button, quantity steppers/inputs, remove item button, order total display, save/cancel buttons.
   - `orders-list.component.html`: Status filter select, table, order row links, inline status dropdowns, cancel reason modal select & confirm/keep buttons, batch print buttons.
   - `order-detail.component.html`: Status badge, order total, per-item print buttons, sidebar print template buttons.
   - `label-list.component.html`: New template button, table, per-row edit/delete buttons, name cells.
   - `label-editor.component.html`: Name input, width/height inputs, add text/variable buttons, variable mapping select, canvas element, save/cancel buttons.
   - `purchases-list.component.html`: Header "Record Purchase" button (`purchases-record-btn`).

2. **UI Selectors Registry Expansion (`frontend/src/app/testing/ui-selectors.ts`)**:
   - Register all new selector strings into the `UI_SELECTORS` structured object.

## Conflict & Regression Detection
- Scanned existing specifications (`FEAT-000` through `FEAT-004`, `BUG-001`). No conflicts found.
- Non-breaking UI markup addition.

## Verification Plan
1. `ng build` — verify zero Angular template compilation errors.
2. Verify all registered selectors match their exact template `data-testid` attributes.

