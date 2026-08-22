# Stock Manager Agent Rules & Workflow Guidelines

## 1. Feature & Bugfix Specification & Branching Protocol

When the user requests a new feature, enhancement, or bugfix:
1. **Assign Ticket ID**: Identify or create a Ticket ID:
   - Features: `FEAT-XXX` (e.g. `FEAT-001`)
   - Bugfixes: `BUG-XXX` (e.g. `BUG-001`)
2. **Create Spec / Bug Description File**: Create or update the tracking file at `docs/features/FEAT-XXX.md` or `docs/features/BUG-XXX.md`.
3. **Conflict & Regression Detection**: Prior to coding, scan all existing specifications in `docs/features/` to verify that proposed changes do NOT conflict with existing business logic, workflows, or data models. Warn the user immediately if a conflict is detected.
4. **Git Branching**: Switch to/create a branch named after the Ticket ID:
   - For features: `feat/FEAT-XXX` (e.g. `git checkout -b feat/FEAT-001 main`)
   - For bugfixes: `fix/BUG-XXX` (e.g. `git checkout -b fix/BUG-001 main`)

---

## 2. Development & Database Protocol

1. **Development Mode**: Always run and test code against `devdb` (`DB_MODE=development` / `npm run dev:devdb`).
2. **Snapshot Baseline**:
   - Save the current clean state of `devdb` using:
     ```bash
     npm run db:snapshot:dev
     ```
3. **Restoring Baseline**:
   - After feature/bugfix testing or when data corruption occurs during experimentation, wipe `devdb` and restore clean baseline using:
     ```bash
     npm run db:restore:dev
     ```

---

## 3. UI Selector Tagging & Test Automation Protocol

1. **Mandatory Template Tagging (`data-testid`)**:
   - Whenever any new UI component, navigation link, tab button, form input, or submit button is added or modified in Angular HTML templates, it MUST be tagged with `data-testid="..."` or `[attr.data-testid]="..."`.
   - All selector strings MUST be registered in `frontend/src/app/testing/ui-selectors.ts`.
2. **E2E Sequential Dependency Ordering**:
   - E2E tests in `tests/e2e/app.spec.ts` MUST run serially in domain prerequisite order:
     1. Base Prerequisites: Master Data & Customers
     2. 1st-Tier Dependents: Purchases & Products Catalog (ingredients)
     3. 2nd-Tier Dependents: Orders & Labels
3. **Angular Form Event Triggers**:
   - Test scripts MUST dispatch `input`/`change`/`Enter` events on inputs to trigger Angular `[(ngModel)]` change detection so conditional submit buttons (`[disabled]="!isFormValid"`) enable immediately.

---

## 4. Ticket Completion & Merging Protocol

**IMPORTANT**: Do NOT restore `devdb` or merge back to `main` until the user explicitly reviews and approves/confirms that the feature or bugfix task is considered done.

When the user explicitly approves a feature or bugfix for completion:
1. Update `docs/features/FEAT-XXX.md` or `docs/features/BUG-XXX.md` status to `Completed`.
2. Restore clean baseline data on `devdb` if dirty test records were generated (`npm run db:restore:dev`).
3. Merge branch into `main`:
   ```bash

---

## 5. Test-Driven Development (TDD) & Comprehensive Verification Protocol

1. **Test-First Development**:
   - Before implementing any new UI feature or interaction, define all corresponding `data-testid` selectors in `ui-selectors.ts` and tag HTML templates.
   - Before implementing new backend routes/logic, write failing API integration tests in `tests/api/`.
   - Before writing feature logic, define E2E test steps in `tests/e2e/app.spec.ts`.
2. **Cross-UI Propagation Coverage**:
   - Any Master Data record creation/update MUST include E2E assertions verifying propagation across all downstream UI surfaces:
     - Purchases form material select dropdowns.
     - Product Create/Edit recipe dropdowns.
     - Partial BOM warning banner & hover tooltip missing materials list.
     - Master Data table `Used In` product count increment and button transition (`delete` $\rightarrow$ `archive`).
     - Dynamic unit cost calculation updates (`Avg Unit Cost` cell).
3. **E2E Completeness Verification Checklist**:
   - Every E2E test flow MUST verify:
     - [ ] **Happy Path**: Successful creation and state persistence.
     - [ ] **Cross-UI Propagation**: Dropdown populations, badge updates, and cost rollups across views.
     - [ ] **State Transitions**: Initial states (e.g. "No purchases yet", "Partial BOM") $\rightarrow$ updated states (e.g. "Rs. 1.50/g", "BOM Complete").
     - [ ] **Search & Filter**: Table searching and status filter dropdowns.
     - [ ] **Edit & Delete / Archive**: Modification modals and deletion/archival workflows.
4. **Mandatory Test Passage Gate**:
   - No feature or bugfix ticket may be marked `Completed` until:
     - API integration test suite (`npm run test:api`) passes with 0 failures.
     - Headless E2E test suite (`npm run test:e2e`) passes 100% cleanly.

