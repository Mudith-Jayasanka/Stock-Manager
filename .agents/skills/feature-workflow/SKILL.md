---
name: feature-workflow
description: Workflow skill for managing Stock-Manager feature lifecycles, FEAT ticket specs, git branching, conflict detection, and devdb snapshot/restore.
---

# Feature Workflow Skill

Use this skill when managing feature developments in the Stock-Manager repository.

## Step-by-Step Feature Lifecycle

### 1. Initialize Feature
- Assign a Ticket ID (`FEAT-001`, `FEAT-002`, etc.).
- Create `docs/features/FEAT-XXX.md` using the standard template.
- Update `docs/features/README.md` index table.

### 2. Conflict Check
- Read all `.md` files in `docs/features/`.
- Cross-check new feature logic against existing requirements.
- Inform user of any potential conflicts before proceeding.

### 3. Branch & Snapshot
- Create feature branch: `git checkout -b feat/FEAT-XXX main`
- Create DB snapshot if needed: `npm run db:snapshot:dev`

### 4. Develop & Test
- Run dev server: `npm run dev:devdb`
- Perform changes and test APIs/UI.

### 5. Finalize & Merge
- Restore clean snapshot if needed: `npm run db:restore:dev`
- Update `docs/features/FEAT-XXX.md` status to `Completed`.
- Commit changes and merge to `main`.

