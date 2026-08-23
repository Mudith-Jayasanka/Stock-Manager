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

### 2. Angular SPA Client-Side Routing vs Document Load (`expect(page).toHaveURL`)
- **Avoid `page.waitForURL(...)` for SPA Navigations**: In Angular Single Page Applications (SPAs), route changes via `routerLink` or `router.navigate` use HTML5 PushState and do NOT trigger a full browser `load` event. `page.waitForURL('**/labels')` defaults to `waitUntil: 'load'`, causing Playwright to hang or time out waiting for a document reload event that never occurs.
- **Use Web-First URL Assertions**: Always use `await expect(page).toHaveURL(/\/path$/)`. Playwright's web-first assertions poll SPA router URL updates continuously without requiring a document reload.

### 3. Strict End-of-String URL Regex Matching
- **Avoid Loose Glob Matches**: Loose regexes like `/.*\/orders/` match both `/orders` (list view) and `/orders/ord-12` (detail view). When creating an order redirects to `/orders/ord-12`, a loose URL check resolves prematurely while still on the detail page, causing subsequent navigation clicks to drop mid-transition.
- **Use Strict Route Regexes**: Use strict end-of-string regexes:
  - List pages: `/\/orders$/`, `/\/labels$/`, `/\/products$/`, `/\/customers$/`, `/\/master-data$/`
  - Creation pages: `/\/labels\/create$/`, `/\/products\/create$`
  - Detail pages: `/\/orders\/ord-/`

### 4. Angular `[(ngModel)]` & Form Event Triggers
- **Full Event Triad (`input`, `change`, `blur`)**: When filling form inputs via `page.fill()`, dispatch `input`, `change`, and `blur` events (`await input.dispatchEvent('change'); await input.dispatchEvent('blur');`). This ensures Angular's `[(ngModel)]` binding updates component state and enables conditional submit buttons (`[disabled]="!name.trim() || saving"`) immediately.
- **Complete Form Requirement**: Ensure test scripts populate ALL mandatory fields specified by the component's validation logic before asserting `toBeEnabled()` or clicking save buttons.

### 5. Angular Fonts Optimization in Isolated Sandbox
- **Disable Font Inlining in `angular.json`**: Angular CLI attempts to fetch and inline Google Fonts during `ng build` / `ng serve`. In sandbox or network-isolated test environments, this causes build failures (`getaddrinfo EAI_AGAIN fonts.googleapis.com`). Ensure `angular.json` sets:
  ```json
  "optimization": {
    "fonts": false
  }
  ```

### 6. Cross-Platform WebServer Config (`playwright.config.ts`)
- **Use `cwd` and Package Scripts**: Avoid inline shell environment variables (e.g. `DB_MODE=development npm ...`) in `webServer.command`. Use package script commands and explicit `cwd` properties:
  ```ts
  webServer: [
    { command: 'npm run dev:devdb', cwd: './backend', url: 'http://127.0.0.1:3000/api/health', reuseExistingServer: true },
    { command: 'npm run start', cwd: './frontend', url: 'http://127.0.0.1:4200', reuseExistingServer: true }
  ]
  ```

### 7. Test File Isolation & Cleanup
- Keep Playwright browser test files (`tests/e2e/**/*.spec.ts`) isolated from Node.js API integration tests (`tests/api/**/*.test.ts`) via `testMatch: '**/*.spec.ts'` in `playwright.config.ts`.
- After verification finishes, restore clean snapshot baseline on `devdb`:
  ```bash
  npm run db:restore:dev
  ```
