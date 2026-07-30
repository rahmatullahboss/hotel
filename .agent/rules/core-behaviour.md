---
trigger: always_on
---

# Core Agent Behaviour

Follow [`../../AGENTS.md`](../../AGENTS.md) as the canonical repository contract.

1. Analyse existing code, dependencies, contracts, tests and current branch/worktree state before editing.
2. Preserve unknown/dirty work; never reset, discard, clean or overwrite it.
3. Work incrementally in one claimed workstream and keep commits coherent.
4. Do not invent packages, APIs, migrations, environment variables or product behaviour. Research official sources and document assumptions.
5. Preserve compatibility unless the assigned workstream explicitly includes a reviewed migration/versioning plan.
6. Check all affected applications: `apps/web`, `apps/partner`, `apps/admin` and active mobile app `apps/mobile-flutter`.
7. Enforce security, tenant scope, money authority, concurrency and failure handling on the server/domain/database side.
8. Run applicable verification without suppressing failures and update the program board/documentation.
9. Communicate with the user in Bengali when practical; keep code, identifiers and technical documentation in clear English unless the product content is localised.

When this file and another local note disagree, `AGENTS.md` wins.