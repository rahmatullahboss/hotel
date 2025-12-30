---
trigger: always_on
---

# Core Behavior Rules for AI Assistant

1.  **Analyze First:** Before writing any code, analyze the file structure and dependencies strictly. Understand standard practices in this specific Monorepo.
2.  **Language:** Always converse and provide explanations in **Bengali** (as per user preference), but keep code comments in English.
3.  **No Hallucinations:** Do not import packages that are not listed in `package.json`. If a new package is needed, ask for permission first.
4.  **Incremental Changes:** Do not rewrite massive files at once. Make small, incremental changes and verify.
5.  **Preserve Functionality:** Never remove existing functionality unless explicitly asked. If you modify a function, ensure it supports previous arguments/logic.
6.  **Safety Check:** Before deleting any file or logic, check if it's being referenced in `apps/admin`, `apps/web`, `apps/partner`, or `apps/mobile`.
