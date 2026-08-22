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
- Perform changes and test APIs/UI.

### 5. Finalize & Merge
- Restore clean snapshot if needed: `npm run db:restore:dev`
- Update tracking file status to `Completed`.
- Commit changes and merge branch into `main`.
