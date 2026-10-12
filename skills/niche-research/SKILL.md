---
name: niche-research
description: >
  Surface the 20 most relevant stories in a niche from the last 7 days using available live research tools. Verified dates, real links, shareable angles. Use available browser or web search tools to inspect dated source material. Use this skill whenever the user says "research my niche", "what's trending", "find stories", "this week's news", "content research", or drops a niche and asks what's happening in it. Requires live source access for current research.
---

# Niche Research

## Codex and Claude runtime

- Use this skill in Codex or Claude with the tools actually available in the current task. `AskUserQuestion` examples describe the questions, not a required API: use an available question tool within its limits, or ask in chat. Reuse answers and source material already supplied.
- Work in the user-selected project. Read its `about-me.md`, `voice.md` and relevant brand files before personalised work. Confirm the intended author if files conflict or contain starter defaults. Ask for missing facts or run `voice-builder`; never inherit the maintainer's identity, accounts or private files.
- Resolve bundled `references/` relative to this skill folder. For an explicitly requested profile refresh, read and update the canonical `about-me.md`, `voice.md` or `newsletter-voice.md` in place, preserving unrelated user facts and rules. Consumers must reread those canonical files. Use a new filename only for new deliverables that would collide with unrelated existing files. Installation alone never starts an interview or writes files. Do not write persistent learnings unless requested.
- Use supplied evidence first. Verify external claims through available search/source tools when needed. If a source or integration is unavailable, name the missing capability and offer supplied text/export input. Never invent facts, first-person experience, metrics or a successful tool run.
- Connect only services needed for the chosen route through the user's existing account. Never print credentials or overwrite connections. Drafting, saving and reviewing do not authorise publishing, sending messages or changing accounts.

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1. Do not summarise the research method.

## Prerequisites

Use the live web search and browser capabilities actually available in Codex or Claude. No particular extension or assistant vendor is required. Read tool documentation and check access before choosing a route. Use the user's existing authorised sessions for personalised feeds; never change their connections.

Browser feed access and indexed web search are different evidence surfaces. If feeds are unavailable, continue with indexed public results and label the missing feed coverage. If no live source access exists, current research is pending; supplied dated sources can support a clearly labelled limited brief.

Never scrape comments or replies on any platform. Read original post bodies and article text only. Aggregate engagement counts may be recorded when visible. Do not enable comment collection through an actor option.

### Optional BrowserAct CLI route

If the user chooses BrowserAct and its CLI and `browser-act` skill are available, read `references/browseract.md` before using it for source access in Step 2. It can supply article text or scoped original post content to the same research workflow. It is not required. Keep other available research tools and the supplied-source fallback. Do not install tools or change accounts just to use this route.

## Step 1. Gather the niche

Call AskUserQuestion:

```json
[
  {
    "question": "What niche do you want to research?",
    "header": "Niche",
    "multiSelect": false,
    "options": [
      {"label": "I will type my niche", "description": "Type the exact niche phrase after this"},
      {"label": "Pull from about-me.md", "description": "Use the niche and audience already in my voice files"}
    ]
  }
]
```

If the user picks "Pull from about-me.md", read the file from the project root. If the file does not exist or does not name a clear niche, fall back to asking the user to type it.

## Step 2. Browse like a human researcher

Use the available route for the following sources; skip inaccessible feeds with an explicit coverage note. Verify publish dates on every item. Exclude anything older than 7 days from today without exception.

### 2a. Reddit feed scanning

1. Navigate to https://www.reddit.com/ (home feed).
2. Scroll the feed. Load more posts.
3. Open niche-relevant posts. On each post, check the "posted X days ago" timestamp.
4. Discard posts older than 7 days.
5. Repeat with https://www.reddit.com/r/popular/.
6. Also search any niche-specific subreddits that come up while scrolling.

### 2b. X (Twitter) feed scanning

1. Navigate to https://x.com/home (For You feed).
2. Scroll multiple screens.
3. Open original niche-relevant posts. Author-authored continuations may supply context; do not collect the reply/comment thread.
4. Check the post timestamp on each thread.
5. Discard posts older than 7 days, even if engagement is high.

### 2c. Google web search

Run these searches one by one, open the top results, verify publish dates.

- `[niche] news` (set Tools → Any time → Past week)
- `[niche] launch` (past week)
- `[niche] controversy` (past week)
- `[niche] research` (past week)
- `[niche] regulation` (past week)

For each promising result:

1. Open the page.
2. Locate the visible publish date.
3. Verify it is within the last 7 days.
4. If the date is missing, unclear, or older than 7 days, exclude it.

## Step 3. Synthesise into themes

Collect a broad pool of verified, in-window items. Group related items into themes. Each theme may combine social discussion and news coverage.

Select themes that show at least two of:

- Strong attention or discussion
- Clear disagreement or debate
- Novel insight or new information
- Real-world implications for the niche

Target 20 themes. Fewer is acceptable if genuinely limited.

## Step 4. Output

First line before the table:

```
As of [DD/MM/YYYY]
```

Then a markdown table with these exact columns:

```
| Theme / Emerging Story | Platforms (Reddit, X, News) | Key Communities / Accounts / Sources | Representative Links | Attention Signals | What's Happening or Being Debated | Why It Matters for [NICHE] | Shareable Angle |
```

Include a short coverage note naming which feeds or indexed searches were actually used, the date window and any inaccessible sources.

## Step 5. Offer the next move

After the table, ask:

> Any row here you want me to turn into a LinkedIn post? Call the post-writer skill with the row number, or the post-formatter skill to apply a framework.

## Rules

- Never invent links, metrics, or dates.
- Exclude anything older than 7 days without exception.
- Verify every publish date before including an item. No shortcuts.
- Keep the table compact, with the coverage note outside it.
- If fewer than 20 themes pass the filter, say so. Do not pad with weak items.
- Indexed results do not prove a full feed scan. Missing feed access is a limitation, not evidence of no relevant stories.
- British English throughout. DD/MM/YYYY date format.
- Never use em dashes.
