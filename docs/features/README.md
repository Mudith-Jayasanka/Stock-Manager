# Feature & Bugfix Specifications (`docs/features/`)

This directory contains markdown specifications for all features and bugfixes developed for the Stock-Manager system. Each task is tracked by a unique Ticket ID:
- **Features**: `FEAT-001.md`, `FEAT-002.md`, etc.
- **Bugfixes**: `BUG-001.md`, `BUG-002.md`, etc.

## Purpose
1. **Persistent Requirements Memory**: Stores complete functional requirements, bug details, schema impact, API endpoints, and business rules.
2. **Conflict & Regression Prevention**: Prior to starting any new task, the AI assistant scans all specs in this directory to ensure proposals do not contradict existing features or introduce regressions.
3. **Branch Traceability**: Git branches are named directly after the Ticket ID (`feat/FEAT-XXX` or `fix/BUG-XXX`).

---

## Ticket Log Index

| Ticket ID | Title | Type | Status | Target Branch | Date Created |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `FEAT-000` | Baseline System Setup & Core Schema | Feature | Completed | `main` | 2026-08-22 |
| `FEAT-001` | Raw Material Purchases & Dynamic BOM Cost Calculation | Feature | Completed | `feat/FEAT-001` | 2026-08-22 |
| `FEAT-002` | Incomplete BOM Warning, Tooltip & Verification Test Suite | Feature | Completed | `feat/FEAT-002` | 2026-08-22 |
| `FEAT-003` | Comprehensive Verification Test Suite for Legacy Features | Feature | Completed | `feat/FEAT-003` | 2026-08-22 |
| `FEAT-004` | Comprehensive 19-Step Frontend Playwright E2E Test Suite | Feature | Planned | `feat/FEAT-004` | 2026-08-22 |
| `FEAT-005` | Standardized data-testid UI Tagging & Registry Expansion | Feature | Completed | `feat/FEAT-005` | 2026-08-22 |
| `FEAT-006` | Horizontal Table Scrolling and Fragrance Grid Layout | Feature | Completed | `feat/FEAT-006` | 2026-08-23 |
| `BUG-001` | Profit badge text wrapping fix | Bugfix | Completed | `fix/BUG-001` | 2026-08-22 |
| `BUG-002` | Restore missing "+ Add Customer" button and modal | Bugfix | Completed | `fix/BUG-002` | 2026-08-23 |
| `BUG-003` | Reorganize Record Material Purchase modal layout | Bugfix | Completed | `fix/BUG-003` | 2026-08-23 |
