---
name: verification-workflow
description: Automated verification workflow skill for Stock-Manager. Runs API integration tests, data-testid selector validation, and snapshot restores prior to user review.
---

# Stock Manager Verification Workflow Skill

Use this skill when completing or verifying any feature or bugfix in the Stock-Manager codebase before asking the user for review.

## Verification Protocol Steps

### 1. Database Snapshot Baseline Check
Before starting verification tests, ensure `devdb` is running on baseline or clean state:
```bash
npm run db:restore:dev
```

### 2. UI Selector Registry Check (`data-testid`)
Verify that any newly added or modified UI elements (inputs, buttons, headers, status badges, price cells) are properly registered in `frontend/src/app/testing/ui-selectors.ts` and tagged with matching `data-testid="..."` attributes in the corresponding Angular HTML template.

### 3. API & Business Logic Integration Suite
Execute the automated API integration test suite against `devdb`:
```bash
cd backend && DB_MODE=development npx ts-node -e "import '../tests/api/products.test';"
```

### 4. Direct Selectors & E2E Validation
- Ensure tests access elements exclusively via `data-testid` attributes defined in `UI_SELECTORS`.
- Verify that test output reports 0 failures and 0 cancelled tests.

### 5. Post-Verification Cleanup
After test execution finishes:
- Restore clean snapshot baseline on `devdb`:
  ```bash
  npm run db:restore:dev
  ```
- Summarize test verification results in the turn response.

