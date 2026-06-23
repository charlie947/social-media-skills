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

- **Gmail MCP** (`mcp__Gmail__search_threads`, `mcp__Gmail__get_thread`) — load via ToolSearch.
- **Notion MCP** (`mcp__Notion__notion-query-data-sources`, `mcp__Notion__notion-create-pages`,
  `mcp__Notion__notion-fetch`) — load via ToolSearch.

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

Call `mcp__Gmail__search_threads` with `pageSize: 50` and this query:

```
from:(kieranflanagan@substack.com OR gtmstrategist@substack.com OR cannonballgtm@substack.com OR team@demandcurve.com OR mkt1@substack.com OR lenny@substack.com OR elenaverna@substack.com) newer_than:10d
```

- **No threads found** → exit cleanly. Post a one-line "0 new sources this week" summary. This is success, not failure.
- **More than 50** → process the first 50 (the page returned). Note the overflow in the final summary.

For each thread, you'll need the full body — fetch it with `mcp__Gmail__get_thread`
(`messageFormat: FULL_CONTENT`) only when you reach Step 3 for that email (don't pre-fetch all 50).

Build the Gmail permalink for each thread as:
`https://mail.google.com/mail/u/0/#all/<threadId>` — this is the `URL` stored in Notion.

## Step 2 — Dedup against Notion

Before processing, pull existing entries so a retry or the overlapping 10-day window never
double-files. Query the Source Inbox data source for recent rows and collect their `URL`
values:

- Use `mcp__Notion__notion-query-data-sources` against `collection://31b00cfe-6b78-8015-9be8-000be9d99d6d`,
  selecting `userDefined:URL` and `Name`, sorted by `Captured At` desc (last ~100 rows is plenty for a 10-day window).
- Build a set of seen URLs. Skip any thread whose permalink is already in the set.

If the query fails, don't abort — proceed without dedup but flag it in the summary so Sal
can spot-check for duplicates.

## Step 3 — Per-email loop

For each non-duplicate thread (up to 50), run 3a → 3b → 3c. These are independent per email;
you may fan them out with the Agent tool (one sub-agent per email) to run in parallel — but
keep all Notion writes idempotent via the dedup set.

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
| `date:Captured At:start` | run timestamp (ISO-8601, set `date:Captured At:is_datetime` = 1) |
| `userDefined:URL`      | Gmail thread permalink from Step 1 |

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

Add the URL to the dedup set after a successful write so parallel/retried runs stay idempotent.

## Step 4 — Local mirror (repo convention)

Per CLAUDE.md, every deliverable also lands in `output/`. Write a weekly digest to:

```
output/research/YYYY-MM-DD__general__research__source-library-weekly.md
```

With the standard metadata header (`type: research`, `skill: source-library`, `status: approved`)
and a table of what was captured: Title · Source · Pillar · Tier · Tags · Notion link.

## Step 5 — Report

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
- **Idempotent by URL.** The Gmail permalink is the dedup key; never write the same URL twice.
- **Scheduling** is configured outside this skill — see `SCHEDULE.md` in this folder.
