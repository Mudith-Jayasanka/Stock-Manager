# Stock Manager Agent Rules & Workflow Guidelines

## 1. Feature Specification & Branching Protocol

When the user requests a new feature or development task:
1. **Assign Ticket ID**: Identify or create a Ticket ID (`FEAT-XXX`, e.g. `FEAT-001`).
2. **Create Spec File**: Create or update the feature specification file at `docs/features/FEAT-XXX.md`.
3. **Conflict Detection**: Prior to coding, scan all existing feature specifications in `docs/features/` to verify that the proposed changes do NOT conflict with existing business logic, workflows, or data models. Warn the user immediately if a conflict is detected.
4. **Git Branching**: Switch to/create a feature branch named after the Ticket ID:
   ```bash
   git checkout -b feat/FEAT-XXX main
   ```

---

## 2. Development & Database Protocol

1. **Development Mode**: Always run and test code against `devdb` (`DB_MODE=development` / `npm run dev:devdb`).
2. **Snapshot Baseline**:
   - Save the current clean state of `devdb` using:
     ```bash
     npm run db:snapshot:dev
     ```
3. **Restoring Baseline**:
   - After feature testing or when data corruption occurs during experimentation, wipe `devdb` and restore clean baseline using:
     ```bash
     npm run db:restore:dev
     ```

---

## 3. Feature Completion & Merging Protocol

When the user approves a feature for completion:
1. Update `docs/features/FEAT-XXX.md` status to `Completed`.
2. Restore clean baseline data on `devdb` if dirty test records were generated (`npm run db:restore:dev`).
3. Merge `feat/FEAT-XXX` into `main`:
   ```bash
   git checkout main
   git merge feat/FEAT-XXX
   ```

