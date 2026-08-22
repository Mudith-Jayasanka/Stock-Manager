# Feature Specification: FEAT-001

## Metadata
- **Ticket ID**: `FEAT-001`
- **Title**: Raw Material Purchases & Dynamic BOM Cost Calculation
- **Type**: Feature
- **Status**: Completed
- **Target Branch**: `feat/FEAT-001`
- **Date Created**: 2026-08-22

## Problem & Business Goal
Small-batch candle manufacturing involves purchase price variations across raw materials (waxes, fragrance oils, containers). Currently, products have a static `cost` field manually entered, and master data items (`WaxType`, `Fragrance`, `ContainerType`) have no purchase or cost tracking.

The goal is to implement Option B (Historical Material Purchases & Dynamic BOM Cost Rollup):
1. Record historical purchase records of raw materials (quantity, total cost, supplier, purchase date).
2. Maintain moving average unit costs for raw materials based on purchase history.
3. Automatically compute product manufacturing costs (BOM cost) and real profit margins per product based on ingredient recipes (wax %, fragrance load %, container price).

## Functional Requirements
1. **Raw Material Purchases Log (`material_purchases`)**:
   - Record purchases for `wax`, `fragrance`, or `container`.
   - Attributes: `materialType` ('wax' | 'fragrance' | 'container'), `materialId`, `quantity`, `unit` ('g' | 'kg' | 'units' | 'ml'), `totalCost`, `notes`, `purchaseDate`.
2. **Moving Average Unit Cost Calculation**:
   - When a purchase is logged, update or compute the average unit cost for that master data item (e.g. cost per gram for wax/fragrance, cost per unit for container).
3. **Dynamic BOM Cost Calculation for Products**:
   - Calculate total cost per candle:
     $$\text{Wax Cost} = \text{weightGrams} \times (1 - \text{fragranceLoad}/100) \times \text{waxUnitCost}$$
     $$\text{Fragrance Cost} = \text{weightGrams} \times (\text{fragranceLoad}/100) \times \text{fragranceUnitCost}$$
     $$\text{Container Cost} = \text{containerUnitCost}$$
     $$\text{BOM Cost} = \text{Wax Cost} + \text{Fragrance Cost} + \text{Container Cost}$$
   - Fall back gracefully to manual `cost` or default $0 if no purchases exist yet.
4. **UI Updates**:
   - Purchases tab / dialog in frontend to log and view raw material purchase history.
   - Display calculated BOM cost, profit amount, and profit margin % on product detail / product list pages.

## Conflict & Regression Detection
- Scanned existing specifications (`FEAT-000`, `BUG-001`). No conflicts found.
- The `products.cost` column remains present as a fallback/override, maintaining backward compatibility.

## Verification Plan
1. Create mock purchases for wax, fragrance, container.
2. Verify moving average unit cost calculations.
3. Create/view products with recipes and verify calculated BOM cost, profit, and margin %.

