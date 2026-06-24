---
name: source-library
description: >
  Build Sal's source library: pull the last 10 days of growth/GTM newsletters from Gmail, clean each one, extract high-signal operator insights, and file them into the Notion "Source Inbox" database (Status = New) for downstream content. Use this skill whenever Sal says "run the source library", "fill my source inbox", "pull my newsletters", "weekly source roundup", or when the scheduled Sunday 8PM EST run dispatches it. Reads from Gmail MCP, writes to Notion MCP. No API keys required — uses the connected MCP servers.
---

# Source Library

Weekly intake routine. Turns a fixed set of growth/GTM newsletters into clean, analyzed,
retrievable entries in the Notion **🔍 Source Inbox**, which feeds `post-writer`,
`content-matrix`, and the rest of the content stack. Redesigned from Sal's original Relay
flow; runs on this repo's MCP tools instead.

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1. Don't summarise the method. The run is
designed to complete unattended (human-in-the-loop OFF) — only stop to ask Sal if a tool
is missing or a credential fails.

## Prerequisites

- **Gmail MCP** (`mcp__Gmail__search_threads`, `mcp__Gmail__get_thread`, `mcp__Gmail__list_labels`,
  `mcp__Gmail__create_label`, `mcp__Gmail__label_thread`) — load via ToolSearch.
- **Notion MCP** (`mcp__Notion__notion-create-pages`, `mcp__Notion__notion-fetch`) — load via ToolSearch.

> **Plan note (verified live):** this workspace's Notion is *not* on a Business plan, so
> `notion-query-data-sources` and `notion-query-database-view` return a 400 plan-gate error.
> Do **not** rely on them. Dedup is handled in Gmail (Step 2), not by querying Notion.

If either server is disconnected, tell Sal which one and stop — do not partially run.

## Constants

```
SENDERS (7):
  kieranflanagan@substack.com
  gtmstrategist@substack.com
  cannonballgtm@substack.com
  team@demandcurve.com
  mkt1@substack.com
  lenny@substack.com
  elenaverna@substack.com

LOOKBACK         : 10 days
MAX_EMAILS       : 50
NOTION DATABASE  : 🔍 Source Inbox
  database id    : 31b00cfe-6b78-80f1-b015-d9d66172cd74
  data source id : 31b00cfe-6b78-8015-9be8-000be9d99d6d   (collection://31b00cfe-6b78-8015-9be8-000be9d99d6d)
```

> If Notion ever returns a different data source id, re-`fetch` the database by its id and
> use the live `collection://` id. Don't hard-fail on a stale id — re-resolve it.

---

## Step 1 — Fetch source emails (Gmail)

First ensure the dedup label exists: call `mcp__Gmail__list_labels`; if `Filed/SourceInbox`
isn't there, create it with `mcp__Gmail__create_label` (displayName `Filed/SourceInbox`). Grab its label id.

Then call `mcp__Gmail__search_threads` with `pageSize: 50` and this query (note the
`-label:` exclusion — that's the dedup, see Step 2):

```
from:(kieranflanagan@substack.com OR gtmstrategist@substack.com OR cannonballgtm@substack.com OR team@demandcurve.com OR mkt1@substack.com OR lenny@substack.com OR elenaverna@substack.com) newer_than:10d -label:Filed/SourceInbox
```

- **No threads found** → exit cleanly. Post a one-line "0 new sources this week" summary. This is success, not failure.
- **More than 50** → process the first 50 (the page returned). Note the overflow in the final summary.

For each thread, you'll need the full body — fetch it with `mcp__Gmail__get_thread`
(`messageFormat: FULL_CONTENT`) only when you reach Step 3 for that email (don't pre-fetch all 50).

Build the Gmail permalink for each thread as:
`https://mail.google.com/mail/u/0/#all/<threadId>` — this is the `URL` stored in Notion.

## Step 2 — Dedup via Gmail label

Dedup is done in Gmail, not Notion (the Notion query tools are plan-gated here). The mechanism:

- The Step 1 query already excludes `-label:Filed/SourceInbox`, so any thread filed by a
  previous run never comes back. That's the whole dedup — the overlapping 10-day window and
  any retry are both covered.
- **After a successful Notion write (Step 3c), label that thread** `Filed/SourceInbox` with
  `mcp__Gmail__label_thread`. This is what makes the run idempotent. If the Notion write
  fails, do NOT label — so it gets retried next run.
- Discarded (low-signal) emails: still label them `Filed/SourceInbox` so they aren't
  re-evaluated every week. (Optionally use a separate `Filed/SourceInbox-Rejected` label if
  Sal wants to audit rejects; default to the single label.)

No Notion read is needed or possible. If `label_thread` fails, flag it in the summary so the
thread can be labeled manually (otherwise it re-files next week).

## Step 3 — Per-email loop

For each thread the Step 1 query returned (up to 50), run 3a → 3b → 3c → 3d. These are
independent per email; you may fan out the clean step (3a) with the Agent tool (one Haiku
sub-agent per email) to run in parallel. Always do the Gmail label (3d) only after a
confirmed Notion write so the run stays idempotent.

> **Big emails:** `get_thread` on a newsletter can exceed the tool output limit (a real one
> hit ~124K chars). When that happens the result is saved to a file path instead — hand that
> path to the Haiku sub-agent in 3a and have it extract the body with jq/python. Don't try to
> read the raw thread into your own context.

### 3a — Clean & structure (cheap model)

Run as a **Haiku** sub-agent (formatting task, no judgment). Input: the email's subject,
sender, date, and full body. System prompt:

```
CLEAN & STRUCTURE NEWSLETTER FOR NOTION

You are an editor and formatter. Convert a raw newsletter email into a clean, structured
Markdown document optimized for Notion and downstream analysis.

OBJECTIVES
1. Remove all non-editorial content: ads, sponsorships, partner sections; promotional CTAs
   (subscribe, upgrade, download); unsubscribe links, social links, nav menus; tracking
   URLs and generic homepage links.
2. Preserve and extract metadata: Title (use original or generate), Author/publication,
   Content origin (newsletter name / thread / article).
3. Preserve valuable content: all core editorial; links to specific articles, research,
   case studies, tools; meaningful insights, examples, data.
4. Improve structure: clean Markdown, consistent H1→H2→H3, shorter paragraphs (without
   rewriting), proper bullet lists.
5. Preserve the original editorial body (critical): keep the full original body; do NOT
   rewrite, paraphrase, or summarize; minimal edits for formatting/spacing only; faithful
   representation of the original.

OUTPUT FORMAT (STRICT)
# Title
**Author / Source:** [Name if available]
**Content Origin:** [Newsletter / Thread / Article if known]

## TL;DR
- 3–5 bullets, highest-signal ideas (directly from the content, no added interpretation)

## Main Content
### Section Heading
Original content, cleaned and formatted (no rewriting)

## Key Data / Examples
- Stats, case studies, concrete examples (if present)

## References
- Only meaningful links (articles, research, tools)

## Original (Cleaned, Verbatim)
Full editorial content preserved with minimal formatting changes only

RULES
- Do NOT add ideas, opinions, or interpretations.
- Do NOT remove meaningful insight or nuance.
- Do NOT rewrite or compress the editorial content.
- Remove duplicate/repeated content.
- If a section mixes editorial + promotion, keep only the editorial portion.
- If no clear structure exists, create logical sections without altering wording.
- Keep tone neutral and faithful to the original.
```

### 3b — Analyze & extract (strong model)

Run on the **main model** (Sonnet/Opus-class — judgment + structured output). Input: 3a's
cleaned Markdown. System prompt:

```
ANALYZE & STRUCTURE FOR NOTION DATABASE

You are a research analyst supporting a senior growth marketing operator. Evaluate the
cleaned content, extract high-signal insights, and structure a Notion-ready entry.

PRIORITIZE: contrarian / belief-challenging; real experiments or first-hand experience;
tactical and actionable; rich in frameworks/mental models; backed by examples/case studies.
FILTER OUT: generic marketing advice; beginner explanations; motivational/inspirational;
SEO-driven low-signal writing. If the content is low-signal, DISCARD it (set discard=true).

OUTPUT (STRICT — return these fields)
Title:
Source Author or Publication:
Content Type: (Article | Thread | Case Study | Framework | Experiment | Playbook | Opinion)
Key Insight: (1–2 sentences, the most valuable non-obvious takeaway)
TL;DR: (2–4 bullets — what the content says)
Why It Matters: (1 sentence — relevance to a growth operator)
Actionable Takeaways: (3–5 bullets — practical actions, experiments, tactics)
Strategic Implication: (what this changes about how you think/prioritize/operate)
Use Case: (when this is most applicable, e.g. "early-stage SaaS acquisition")
Pillar: one of [Acquisition, Activation, Retention, Monetization, Growth Systems, Strategy]
Tier: 0 = foundational/perspective-shifting | 1 = immediately actionable | 2 = useful reference
Topics: broad themes (e.g. AI, Demand Gen, PLG, Attribution, CRO)
Tactics: specific methods (e.g. Cold Outreach, Landing Pages, Retargeting, Lead Magnets)
Sal Content Pillars: which of Sal's 5 content pillars this could feed — choose any of
  [Growth Marketing That Ships, AI GTM Reality Checks, GTM Engineering Craft,
   The Human Side of AI + Growth, Industry Tea] (from about-me.md)
discard: true|false

RULES: be concise, specific, high-signal. Don't restate generically. Extract the real
insight, not surface points. Default to rejecting low-quality content.
```

If `discard=true`, skip the Notion write for that email; count it as "rejected" in the summary.

### 3c — File into Notion Source Inbox

Map 3a/3b output to the **real** schema (verified live) and call
`mcp__Notion__notion-create-pages` with parent `data_source_id: 31b00cfe-6b78-8015-9be8-000be9d99d6d`.

Properties:

| Notion property        | Value |
|------------------------|-------|
| `Name` (title)         | 3b `Title` |
| `Source`               | 3b `Source Author or Publication` |
| `Excerpt / Notes`      | 3b `Key Insight` |
| `Pillar`               | 3b `Pillar` (exact: Acquisition / Activation / Retention / Monetization / Growth Systems / Strategy) |
| `Tier`                 | 3b `Tier` as string `"0"` / `"1"` / `"2"` |
| `Tags`                 | JSON array, mapped to the DB's fixed vocab (see mapping below) |
| `Status`               | `"New"` (hardcoded) |
| `date:Captured At:start` | run date `YYYY-MM-DD` |
| `date:Captured At:is_datetime` | numeric `0` (date-only). **Must be the number `0` or `1`, not a string** — a string `"0"` returns a 400. |
| `userDefined:URL`      | Gmail thread permalink from Step 1 |

> Gotchas verified live: `Tier` is a string (`"1"`), `Tags` is a JSON-array string
> (`"[\"Guide\", \"Reference\"]"`), `is_datetime` is a bare number, and the URL property key
> is literally `userDefined:URL`.

**Tags mapping** — the DB `Tags` is a fixed content-type vocabulary
`[Article, Video, Tutorial, Research, Reference, News, Analysis, Guide, Review]`, NOT free
topics. Map from 3b `Content Type` + signal:
- Experiment / Case Study / data-heavy → `Research`, `Analysis`
- Framework / Playbook → `Guide`, `Reference`
- Opinion / Thread → `Analysis`
- Straight reporting / link roundup → `News`, `Article`
- How-to / step-by-step → `Tutorial`
Pick 1–3. The rich `Topics`/`Tactics` tags from 3b live in the page body (below), not in `Tags`.

**Page body** (Notion Markdown):
```
[3b Key Insight]

--

**Why it matters:** [3b Why It Matters]
**Content type:** [3b Content Type]   **Use case:** [3b Use Case]
**Topics:** [3b Topics]   **Tactics:** [3b Tactics]
**Could feed (Sal pillars):** [3b Sal Content Pillars]

### Actionable takeaways
[3b bullets]

### Strategic implication
[3b text]

--

[3a full cleaned Markdown]
```

### 3d — Label the thread (dedup)

After `notion-create-pages` returns a page id (confirmed write), call
`mcp__Gmail__label_thread` on that thread with the `Filed/SourceInbox` label id. This is what
keeps the routine idempotent — a labeled thread is excluded from next week's Step 1 query.
Discarded emails get labeled too (Step 2). Never label before the write succeeds.

## Step 4 — Report

The Notion Source Inbox is the only persistent destination — this skill does **not** write a
local `output/` file (Sal's choice: the DB is the source of truth, no repo mirror).

Post a tight summary in chat (and it's the scheduled-run output):
- `N found · M new · R rejected (low-signal) · D duplicates skipped`
- Bullet list of new entries with Pillar/Tier and Notion links
- Any warnings (overflow >50, dedup query failed, sender returned nothing)

Keep it scannable. No play-by-play of the loop.

---

## Notes

- **Model split** is intentional: cheap model cleans (3a), strong model judges (3b) — mirrors
  the original Relay cost design.
- **Default to reject.** A near-empty Source Inbox of only Tier-0/1 entries beats a full one
  of generic advice.
- **Idempotent by Gmail label.** `Filed/SourceInbox` is the dedup key (Notion query tools are
  plan-gated here). Label only after a confirmed Notion write; the Gmail permalink is still
  stored on each entry as the canonical link back.
- **Scheduling** is configured outside this skill — see `SCHEDULE.md` in this folder.
