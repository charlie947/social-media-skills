# Source Library — automated weekly run (setup)

This is the in-repo automation for the `source-library` skill, implementing the schedule
defined in [`skills/source-library/SCHEDULE.md`](../../skills/source-library/SCHEDULE.md):

```
Every Sunday at 8:00 PM  ·  America/New_York (EST/EDT)
```

The workflow is [`source-library.yml`](./source-library.yml).

## Which mechanism should I use?

SCHEDULE.md lists three. They are NOT equivalent — pick based on how durable you need it:

| Mechanism | Durable? | Setup | Notes |
|---|---|---|---|
| **Web Scheduled Session** (recommended) | ✅ forever | manual, ~2 min in claude.com/code UI | Reuses this environment's existing authenticated Gmail/Notion MCP connections. **No secrets needed.** See SCHEDULE.md §Setup. |
| **GitHub Actions** (this workflow) | ✅ forever | needs repo secrets | Version-controlled + headless. The hard part is MCP auth in CI (below). |
| **In-session cron** | ❌ ~7 days, dies with session | 1 command | Bridge only. Not a forever job. |

If you just want it running reliably with the least effort, use the **Web Scheduled Session**
(it's a manual UI step — Claude can't click it for you, but SCHEDULE.md has the exact config).
Use **this workflow** when you want the schedule in version control or to run it outside a
Claude session.

## Required setup for this workflow

1. **The skill must be on the default branch.** This workflow runs `claude -p "Run the
   source-library skill ..."`, which requires `skills/source-library/` to exist on the branch
   the scheduled run checks out (the repo's default branch). The skill currently lives on
   `claude/peaceful-noether-jclzec` — merge it to the default branch first, or the run will
   have no skill to invoke.

2. **Add two repository secrets** (Settings → Secrets and variables → Actions):

   - `ANTHROPIC_API_KEY` — a Claude API key for the headless run.
   - `MCP_CONFIG_JSON` — the full MCP server config for Gmail + Notion, **including working
     credentials**. Shape:

     ```json
     {
       "mcpServers": {
         "Gmail":  { "type": "http", "url": "https://.../gmail",  "headers": { "Authorization": "Bearer <token>" } },
         "Notion": { "type": "http", "url": "https://.../notion", "headers": { "Authorization": "Bearer <token>" } }
       }
     }
     ```

     ⚠️ **The OAuth caveat (why SCHEDULE.md preferred the web session):** Gmail and Notion are
     OAuth MCP servers. They authenticate interactively in a Claude session, but a GitHub
     Actions runner cannot complete an OAuth flow. You must supply already-valid tokens/headers
     in `MCP_CONFIG_JSON`, and refresh them when they expire. If your MCP provider issues
     long-lived service tokens, use those. If it only issues short-lived OAuth tokens, the web
     Scheduled Session is the better fit — it reuses the live connection and never expires.

## Schedule / timezone

GitHub Actions cron is UTC-only and has no DST awareness, so the workflow schedules two crons
(`0 0 * * 1` and `0 1 * * 1`) to land at ~8 PM America/New_York year-round. Whichever fires
first each week files the sources; the second is an idempotent no-op because dedup is handled
by the Gmail `Filed/SourceInbox` label (see SKILL.md Step 2), so already-filed threads are
excluded from the query.

## Manual run / testing

- **From GitHub:** Actions tab → "source-library-weekly" → "Run workflow" (`workflow_dispatch`).
- **From any Claude session in this repo:** `/source-library` (or "run the source library").

## Verifying a run

- Notion → 🔍 Source Inbox, view "Agent Query - New by Tier" — new rows with `Status = New`.
- The Actions run log — the Step 4 summary line: `N found · M new · R rejected · D duplicates`.
