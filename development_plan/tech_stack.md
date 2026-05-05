# Technical Stack & Architecture

## Core Technologies
- **Frontend:** Angular
- **Backend:** Node.js with TypeScript
- **Database:** PostgreSQL

## Backend Database Configuration
- The backend must select its database connection through `backend/src/config/database.ts`.
- `DB_MODE=production` uses the production Neon database connection and is the default when no mode is provided.
- `DB_MODE=development` uses the development Neon database connection.
- `DATABASE_URL`, when provided, overrides the mode-specific defaults. This is intended for deployment or temporary local overrides.
- Schema setup must use the same database configuration as the server so `setupDb.ts` applies changes to the selected environment.
- Backend package scripts should expose easy commands for running and setting up both production and development database modes.

## Open Technical Decisions
*(Pending discussion on specific libraries and implementation details...)*
