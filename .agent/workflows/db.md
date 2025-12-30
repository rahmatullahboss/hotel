---
description: migrate
---

# Workflow: Database Migration

When asked to change the database:

1.  **Edit Schema:**
    - Locate the specific schema file in `packages/db/src/schema/`.
    - Make changes (add columns, tables).

2.  **Generate Migration:**
    - Run command: `npm run db:generate` (or specific command from package.json).
    - **DO NOT** manually write `.sql` files unless complex logic is required.

3.  **Sync/Push:**
    - Run `npm run db:push` or `npm run db:migrate`.

4.  **Update Types:**
    - Since we use Drizzle, types are inferred. Ensure any TypeScript code using the old schema is updated to reflect new fields.
