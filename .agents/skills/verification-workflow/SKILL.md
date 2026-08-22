---
name: verification-workflow
description: Automated verification workflow skill for Stock-Manager. Runs API integration tests, Playwright E2E browser tests, data-testid selector validation, and snapshot restores prior to user review.
---

# Stock Manager Verification Workflow Skill

Use this skill when completing or verifying any feature or bugfix in the Stock-Manager codebase before asking the user for review.

## Verification Protocol Steps

### 1. Database Snapshot Baseline Check
Before starting verification tests, ensure `devdb` is running on baseline or clean state:
```bash
npm run db:restore:dev
```

### 2. UI Selector Registry & Template Tagging Check (`data-testid`)
- **Mandatory Template Tagging**: Verify that any newly added or modified UI elements (navigation links, tab buttons, form inputs, save/submit buttons, headers, status badges, price cells) are tagged with matching `data-testid="..."` or `[attr.data-testid]="..."` attributes directly in the Angular component HTML template.
- **Central Registry**: Verify that all test IDs are registered in `frontend/src/app/testing/ui-selectors.ts`.

### 3. API & Business Logic Integration Suite
Execute the automated API integration test suite against `devdb`:
```bash
npm run test:api
```

### 4. Playwright End-to-End (E2E) Browser Suite
Execute the Playwright E2E browser test suite:
- **Headless Automated Execution**:
  ```bash
  npm run test:e2e
  ```
- **Visible Headed Execution (When requested by User)**:
  ```bash
  npm run test:e2e:headed
  ```

---

## Testing & Execution Guidelines (Lessons Learned & Anti-Regression Rules)

### 1. Domain Data Dependency Ordering
- **Serial Execution**: Always structure E2E test suites serially (`test.describe.serial`) following the system's data dependency hierarchy:
  1. **Base Prerequisites**: Master Data (Containers, Waxes, Fragrances) & Customers (profiles).
  2. **1st-Tier Dependents**: Raw Material Purchases & Product Catalog (requires Master Data ingredients).
  3. **2nd-Tier Dependents**: Orders (requires registered Customers & Products) & Labels (requires Orders).
- Never execute dependent UI tests out of order; doing so causes missing dropdown options and timeout failures.

### 2. Angular `[(ngModel)]` & Form Validation
- **Trigger Event Binding**: When filling inputs via test scripts (`page.fill()`), invoke `.press('Enter')` or `.dispatchEvent('input')` to ensure Angular's `[(ngModel)]` binding triggers change detection and updates form validation state.
- **Complete Form Requirement**: Ensure test scripts populate ALL mandatory fields specified by the component's `isFormValid` getter before attempting to click submit/save buttons (preventing timeouts on `[disabled]` buttons).

### 3. Test File Isolation
- Keep Playwright browser test files (`tests/e2e/**/*.spec.ts`) isolated from Node.js API integration tests (`tests/api/**/*.test.ts`) via `testMatch: '**/*.spec.ts'` in `playwright.config.ts`.

### 5. Post-Verification Cleanup
After test execution finishes:
- Restore clean snapshot baseline on `devdb`:
  ```bash
  npm run db:restore:dev
  ```
- Summarize test verification results in the turn response.
