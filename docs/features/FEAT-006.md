# Feature Specification: FEAT-006

## Metadata
- **Ticket ID**: `FEAT-006`
- **Title**: Horizontal Table Scrolling and Fragrance Grid Layout
- **Type**: Feature
- **Status**: Completed
- **Target Branch**: `feat/FEAT-006`
- **Date Created**: 2026-08-23

## Problem & Business Goal
On the Products (`/products`) and Purchases (`/purchases`) pages, tables contain multi-column data (names, dates, unit costs, profit badges, recipes). Currently, table text cells wrap onto multiple lines when horizontal width is restricted or content is long, causing rows to expand vertically and cluttering the visual interface.

The goal is to:
1. Make both Products and Purchases page table containers horizontally scrollable while preventing text line-wrapping (`white-space: nowrap`) across table cells.
2. Provide a specific layout exception for the Fragrances column in the Products table:
   - Fragrance pills can wrap vertically, arranged in a CSS grid based on item count:
     - 1 fragrance item: 1x1 grid (1 row, 1 column)
     - 2 fragrance items: 1x2 grid (1 row, 2 columns)
     - 3 fragrance items: 2x2 grid (2 rows, 2 columns)
     - 4 fragrance items: 2x2 grid (2 rows, 2 columns)

## Functional & UI Requirements
1. **Products Page Table (`/products`)**:
   - Table wrapper container `.card` or `.table-card` must support horizontal scrolling (`overflow-x: auto`) with a responsive table width.
   - Text cells (`Product Name`, `Container`, `Weight`, `Price`, `Cost`, `Profit`) prevent text wrapping (`white-space: nowrap`).
   - `.fragrance-pills` container uses a CSS grid layout:
     - 1 fragrance: `grid-template-columns: repeat(1, max-content)` (1x1 grid)
     - 2, 3, or 4 fragrances: `grid-template-columns: repeat(2, max-content)` (1x2 grid for 2 items, 2x2 grid for 3 or 4 items)
2. **Purchases Page Table (`/purchases`)**:
   - Table wrapper container `.table-card` must support horizontal scrolling (`overflow-x: auto`).
   - All table header and body cells prevent text line-wrapping (`white-space: nowrap`).

## Conflict & Regression Detection
- Scanned all existing feature and bugfix specifications (`FEAT-000` through `FEAT-005`, `BUG-001` through `BUG-003`). No business logic or schema conflicts identified.
- `BUG-001` enforced single line formatting (`white-space: nowrap`) on `.profit-badge`; this feature extends horizontal single-line formatting to overall table cells while allowing grid wrapping for fragrances.

## Verification Plan
1. Automated E2E verification: Run Playwright tests (`npm run test:e2e`) and API tests (`npm run test:api`) to ensure no UI regressions or broken selectors.
2. Visual / CSS inspection: Verify horizontal scrollability and grid layout behavior for fragrances (1x1, 1x2, 2x2).

