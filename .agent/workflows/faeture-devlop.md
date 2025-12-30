---
description: feature
---

# Workflow: New Feature Development

Follow these steps when the user asks to build a new feature:

1.  **Requirement Analysis:**
    - Identify which app(s) act on this feature (Admin? Web? Mobile?).
    - Does it need a database change?

2.  **Database Layer (if needed):**
    - Modify schema in `packages/db/src/schema`.
    - Generate migration script.
    - Run migration locally.

3.  **Backend/API Layer:**
    - Create Server Actions in the respective Next.js app or `packages/api`.
    - Define types/interfaces.

4.  **Frontend Implementation:**
    - **Web:** Create components in `components/` folder. Use shared UI from `packages/ui` if applicable.
    - **Mobile:** Generate Model -> Repository -> Provider -> Screen.

5.  **Integration & Safety:**
    - Verify that the new code doesn't conflict with existing variable names.
    - Check if shared components used were modified.
