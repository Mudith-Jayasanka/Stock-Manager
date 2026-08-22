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

## 3. Ticket Completion & Merging Protocol

**IMPORTANT**: Do NOT restore `devdb` or merge back to `main` until the user explicitly reviews and approves/confirms that the feature or bugfix task is considered done.

When the user explicitly approves a feature or bugfix for completion:
1. Update `docs/features/FEAT-XXX.md` or `docs/features/BUG-XXX.md` status to `Completed`.
2. Restore clean baseline data on `devdb` if dirty test records were generated (`npm run db:restore:dev`).
3. Merge branch into `main`:
   ```bash
   git checkout main
   git merge feat/FEAT-XXX   # or fix/BUG-XXX
   ```
