# ZinuRooms Agent Entry Point

The canonical instructions are now in [`AGENTS.md`](AGENTS.md).

Before any implementation:

1. read `AGENTS.md`;
2. read `docs/README.md`;
3. read `docs/audit/2026-07-30-static-system-audit.md`;
4. claim a workstream in `docs/execution/03-program-board.md`;
5. follow the ownership, verification and handoff requirements.

Important corrections to older guidance:

- `apps/mobile-flutter` is the only active mobile application; Expo guidance is legacy;
- Route Handlers are valid and required for mobile APIs, webhooks, cron and external integrations;
- production/staging database changes use committed migrations, not `db:push`;
- existing inline styles should be improved incrementally, but broad unrelated style rewrites are prohibited;
- tests/build failures may never be suppressed;
- server-side code calculates all authoritative money, commission, wallet and booking values.

Do not duplicate the full agent rules in this file. Update `AGENTS.md` and the linked canonical documents instead.