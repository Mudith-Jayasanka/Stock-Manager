---
name: feature-workflow
description: Workflow skill for managing Stock-Manager features and bugfixes, FEAT/BUG ticket specs, git branching, conflict detection, and devdb snapshot/restore.
---

# Feature & Bugfix Workflow Skill

Use this skill when managing features or bugfixes in the Stock-Manager repository.

## Step-by-Step Task Lifecycle

### 1. Initialize Ticket
- Assign a Ticket ID (`FEAT-XXX` for features, `BUG-XXX` for bugfixes).
- Create `docs/features/FEAT-XXX.md` or `docs/features/BUG-XXX.md`.
- Update `docs/features/README.md` index table.

### 2. Conflict & Regression Check
- Read all `.md` files in `docs/features/`.
- Cross-check new task logic against existing requirements.
- Inform user of any potential conflicts before proceeding.

### 3. Branch & Snapshot
- Create branch:
  - Feature: `git checkout -b feat/FEAT-XXX main`
  - Bugfix: `git checkout -b fix/BUG-XXX main`
- Create DB snapshot if needed: `npm run db:snapshot:dev`

### 4. Develop & Test
- Run dev server: `npm run dev:devdb`
- **UI Selector Tagging**: Whenever adding or modifying UI elements in Angular HTML templates, immediately tag them with `data-testid="..."` attributes and register keys in `frontend/src/app/testing/ui-selectors.ts`.
- **E2E Test Updates**: Maintain sequential dependency ordering (Master Data -> Customers -> Products -> Orders) in `tests/e2e/app.spec.ts`.
- Run automated API & E2E verification:
  - `npm run test:api`
  - `npm run test:e2e` (or `npm run test:e2e:headed` if visible verification is requested)

### 5. Finalize & Merge (ONLY after explicit User Confirmation)
- Wait for user to test and explicitly confirm the task is done.
- Restore clean snapshot if needed: `npm run db:restore:dev`
- Update tracking file status to `Completed`.
- Commit changes and merge branch into `main`.
