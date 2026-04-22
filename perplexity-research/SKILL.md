---
name: perplexity-research
description: >
  Surface the 20 most relevant stories in a niche from the last 7 days. Verified dates, real links, shareable angles. Use this skill whenever the user says "research my niche", "what's trending", "find stories", "this week's news", "content research", "perplexity research", or drops a niche and asks what's happening in it. Works two ways: runs the research directly using web search tools, or prints a ready-to-paste Perplexity Pro prompt so the user can run it there instead.
---

# Perplexity Research

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1. Do not summarise. Do not explain the research method. Start input gathering immediately.

## Step 1. Gather inputs

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
  },
  {
    "question": "Where should the research run?",
    "header": "Where",
    "multiSelect": false,
    "options": [
      {"label": "Run it here", "description": "Use web search tools and produce the table in this chat"},
      {"label": "Give me the Perplexity prompt", "description": "Output a ready-to-paste prompt to run in Perplexity Pro"}
    ]
  }
]
```

If the user picks "Pull from about-me.md", read the file from the project. If it does not exist, fall back to asking them to type the niche.

## Step 2a. Run the research here

Only reach this step if the user picked "Run it here".

Perform web searches across multiple angles:

- `[NICHE] news` (past 7 days)
- `[NICHE] launch` (past 7 days)
- `[NICHE] controversy` (past 7 days)
- `[NICHE] research` (past 7 days)
- `[NICHE] regulation` (past 7 days)

For every candidate story:

1. Open the page using WebFetch
2. Locate the visible publish date
3. Verify it falls within the last 7 days from today
4. If the date is missing, unclear, or older than 7 days, exclude it

Group verified items into themes. Each theme should show at least two of:

- Strong attention or discussion
- Clear disagreement or debate
- Novel insight or new information
- Real-world implications for the niche

Target 20 themes. Fewer is acceptable if genuinely limited.

## Step 2b. Output the Perplexity prompt

Only reach this step if the user picked "Give me the Perplexity prompt".

Output the following prompt in a code block with the niche filled in. Tell the user to paste it into Perplexity Pro with web search enabled.

```
Your task is to discover and synthesize the most relevant and interesting stories for the following niche:

[NICHE]

You must behave like a human researcher:

- Scroll feeds
- Open items
- Search the web
- Verify dates
- Then synthesize stories

STRICT TIME WINDOW (MANDATORY)

Only include items that were:
- Posted or published within the last 7 days from now

For EVERY candidate item:
- Open the page
- Locate the visible post date or publish date
- Verify it falls within the last 7 days
- If the date is missing, unclear, or older than 7 days, EXCLUDE it

Do NOT rely on feed position, resurfacing, or recent engagement alone.

BROWSING BEHAVIOUR (MANDATORY)

You must actively perform ALL of the following actions.

1) REDDIT FEED SCANNING
- Visit Reddit Home feed.
- Scroll and load more posts.
- Open niche-relevant posts.
- On each post, check the "posted X days ago" timestamp.
- Immediately discard posts older than 7 days.
- Repeat with Reddit Popular feed.

2) X FEED SCANNING
- Visit the X "For You" feed.
- Scroll multiple screens.
- Open full threads.
- Check the post timestamp for each thread.
- Discard posts older than 7 days, even if engagement is high.

3) WEB SEARCH (GOOGLE-LIKE BEHAVIOUR)
- Perform multiple searches related to the niche:
  "[NICHE] news"
  "[NICHE] launch"
  "[NICHE] controversy"
  "[NICHE] research"
  "[NICHE] regulation"
- Open search results.
- Verify publish dates on each article.
- Exclude anything older than 7 days.

STORY SELECTION LOGIC

- Collect a broad pool of VERIFIED, in-window items.
- Group related items into THEMES.
- Each theme may combine social discussion and news coverage.

Select themes that show at least TWO of:
- Strong attention or discussion
- Clear disagreement or debate
- Novel insight or new information
- Real-world implications for the niche

OUTPUT FORMAT (STRICT)

You MUST output a MARKDOWN TABLE.
No prose outside the table.

First line:
As of [DATE]

Then output a table using this EXACT structure:

| Theme / Emerging Story | Platforms Used (Reddit, X, News) | Key Communities / Accounts / Sources | Representative Links | Attention Signals (if visible) | What's Happening or Being Debated | Why It Matters for [NICHE] | Shareable Angle |

Target:
- Aim for ~20 themes
- Fewer is acceptable if genuinely limited

Constraints:
- Do not invent links, metrics, or dates.
- Exclude anything older than 7 days without exception.
- Table only. No commentary.
```

## Step 3. Output format

Always use a markdown table with these exact columns:

| Theme / Emerging Story | Platforms | Sources | Links | Attention Signals | What's Happening | Why It Matters for [NICHE] | Shareable Angle |

First line before the table: `As of [DATE]`

No prose outside the table.

## Step 4. Offer the next move

After the table, ask:

> Any row here you want me to turn into a LinkedIn post? Call the post-writer skill with the row number.

## Rules

- Never invent links, metrics, or dates.
- Exclude anything older than 7 days without exception.
- Table only. No commentary, no summary paragraph.
- If fewer than 20 themes pass the filter, say so. Do not pad with weak items.
- British English throughout.
- Never use em dashes.
