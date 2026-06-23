# Scheduling the Source Library — every Sunday 8:00 PM EST

The `source-library` skill is the *what*. This file is the *when*. The trigger lives outside
the repo because Claude Code on the web sessions are ephemeral (reclaimed after inactivity),
and the in-session cron tool self-expires after 7 days — neither survives as a forever weekly
job. The durable mechanism is a **Scheduled Session** in the Claude Code web UI.

## Target schedule

```
Every Sunday at 8:00 PM
Timezone: America/New_York (EST/EDT)
CRON:     0 20 * * 0
```

## Setup (one-time, ~2 minutes)

1. Open **claude.com/code** → this repository's environment (`social-media-agent`).
2. Go to **Schedules / Automations** → **New scheduled session**.
3. Configure:
   - **Repository / environment:** `sal-avelar-01/social-media-agent`
   - **Schedule:** Weekly · Sunday · 8:00 PM · **America/New_York**  (cron `0 20 * * 0`)
   - **Prompt:**
     ```
     Run the source-library skill. Pull the last 10 days of newsletters from Gmail,
     dedup against Notion, clean + analyze each, file new high-signal sources into the
     Source Inbox database (Status = New), write the weekly digest to output/research/,
     and reply with the summary. This is the scheduled Sunday run — run unattended.
     ```
4. Ensure the environment's **network policy** allows the Gmail and Notion MCP servers, and
   that both are authenticated in the environment (the same OAuth connections used interactively).
5. Save. The first run fires the next Sunday at 8 PM EST.

## Verifying a run

After a scheduled run, check:
- **Notion → 🔍 Source Inbox**, view **"Agent Query - New by Tier"** — new rows with `Status = New`.
- **Repo** → `output/research/<date>__general__research__source-library-weekly.md` — the digest.
- The session transcript — the Step 5 summary (`N found · M new · R rejected · D duplicates`).

## Manual run anytime

In any session in this repo: `/source-library` (or "run the source library"). Same routine,
on demand — useful to backfill or test without waiting for Sunday.

## Fallback: GitHub Actions (if you ever want it fully in-repo)

A `.github/workflows/source-library.yml` on `schedule: cron: "0 0 * * 1"` (00:00 UTC Monday
= 8 PM EST Sunday, standard time) running headless Claude is possible, but needs
`ANTHROPIC_API_KEY` plus Gmail/Notion credentials as Actions secrets and a headless MCP setup.
Skipped for now in favor of the web Scheduled Session, which reuses this environment's existing
authenticated MCP connections. Ask if you want this wired up.
```
```
