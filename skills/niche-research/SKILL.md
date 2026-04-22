---
name: niche-research
description: >
  Surface the 20 most relevant stories in a niche from the last 7 days using Claude for Chrome. Verified dates, real links, shareable angles. Claude drives the browser to scroll Reddit, X and run Google searches — exactly like a human researcher would. Use this skill whenever the user says "research my niche", "what's trending", "find stories", "this week's news", "content research", or drops a niche and asks what's happening in it. Requires the Claude for Chrome extension to be enabled for live browsing.
---

# Niche Research

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1. Do not summarise the research method.

## Prerequisites

This skill needs live browsing. Use this order of preference:

1. **Claude for Chrome extension** (preferred). Check that the extension is enabled and Claude has permission to browse on the current tab. If not, tell the user:
   > Enable the Claude for Chrome extension and open a blank tab. I need to drive the browser to scroll Reddit, X, and run Google searches with verified dates.
2. **Playwright MCP** as a fallback if the Claude for Chrome extension is not available.
3. **WebSearch + WebFetch tools** as a last resort (less thorough on feed scrolling).

Pick the best available path and continue.

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

Drive the browser through these actions in order. Verify publish dates on every item. Exclude anything older than 7 days from today without exception.

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
3. Open full threads for niche-relevant tweets.
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

No prose outside the table.

## Step 5. Offer the next move

After the table, ask:

> Any row here you want me to turn into a LinkedIn post? Call the post-writer skill with the row number, or the post-formatter skill to apply a framework.

## Rules

- Never invent links, metrics, or dates.
- Exclude anything older than 7 days without exception.
- Verify every publish date before including an item. No shortcuts.
- Table only at the end. No commentary, no summary paragraph.
- If fewer than 20 themes pass the filter, say so. Do not pad with weak items.
- If Claude for Chrome is not available and neither Playwright MCP nor WebSearch can cover feed scrolling properly (Reddit and X), tell the user what is missing rather than faking the scan.
- British English throughout. DD/MM/YYYY date format.
- Never use em dashes.
