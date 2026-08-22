# Feature Specifications (`docs/features/`)

This directory contains markdown specifications for all features developed for the Stock-Manager system. Each feature is tracked by a unique Ticket ID (e.g. `FEAT-001.md`, `FEAT-002.md`).

## Purpose
1. **Persistent Requirements Memory**: Stores complete functional requirements, schema impact, API endpoints, and business rules.
2. **Conflict Prevention**: Prior to starting any new development, the AI assistant scans all feature specs in this directory to ensure new proposals do not contradict existing features or workflows.
3. **Branch Traceability**: Git feature branches are named directly after the Ticket ID (e.g., `feat/FEAT-001`).

---

## File Template (`FEAT-XXX.md`)

```markdown
# FEAT-XXX: [Feature Title]

- **Status**: Draft | In Progress | Completed | Deprecated
- **Created Date**: YYYY-MM-DD
- **Target Branch**: feat/FEAT-XXX

## 1. High-Level Summary
Brief description of the problem and what this feature accomplishes.

## 2. Business Logic & Rules
Detailed business requirements and constraints.

## 3. Database Schema Changes
New tables, columns, sequences, or index modifications.

## 4. API Endpoints
New or modified Express routes and signatures.

## 5. UI & Integration Impact
Impact on frontend or external integrations.
```

---

## Feature Log Index

| Ticket ID | Title | Status | Target Branch | Date Created |
| :--- | :--- | :--- | :--- | :--- |
| `FEAT-000` | Baseline System Setup & Core Schema | Completed | `main` | 2026-08-22 |

