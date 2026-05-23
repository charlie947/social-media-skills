---
name: x-signal-research
description: >
  Research live X signals with Hermes Tweet for content strategy. Use this skill whenever the user says "research X", "find Twitter signals", "what are people saying on X", "find posts in my niche", "monitor a launch", "read replies", "research creators", "export followers", or asks for X-backed post angles. Searches tweets, reads threads and replies, looks up users, exports followers, and turns evidence into content angles.
---

# X Signal Research

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1. Do not summarise. Start by getting the research target.

## Prerequisites

This skill uses Hermes Tweet through Xquik for live X data.

Required:
- `XQUIK_API_KEY`

Optional:
- `XQUIK_ACCOUNT` for account-scoped bookmarks, timeline, and approved actions
- `XQUIK_BASE_URL` if using a non-default Xquik endpoint

Before running live research, check that `XQUIK_API_KEY` is available. If not, tell the user:

> Set XQUIK_API_KEY, then ask me again. I need Hermes Tweet access to search X, read replies, and collect follower signals.

Do not ask for X login details.

## Step 1. Gather the research target

Call AskUserQuestion:

```json
[
  {
    "question": "What X signal do you want to research?",
    "header": "Target",
    "multiSelect": false,
    "options": [
      {"label": "Niche trend", "description": "Find current X posts, accounts, and arguments in a niche"},
      {"label": "Launch monitor", "description": "Track reactions to a product, campaign, or announcement"},
      {"label": "Creator research", "description": "Study one account, its posts, replies, and followers"}
    ]
  }
]
```

Then ask for the exact niche, brand, launch phrase, account handle, or tweet URL.

If about-me.md exists, read it and use the user's audience, niche, and positioning to filter what matters.

## Step 2. Build the query plan

Create 5 to 8 searches before collecting data.

For a niche trend:
- Core niche phrase
- Pain point phrase
- Tool or category phrase
- Contrarian phrase
- Buyer or audience phrase
- Competitor or adjacent category phrase

For a launch monitor:
- Product or brand name
- Exact announcement phrase
- Founder or company handle
- Feature names
- Common complaint phrases
- Comparison phrases

For creator research:
- The creator handle
- The creator name
- Recent post keywords
- Audience problem phrases
- Reply and quote themes from their best posts

Use the Hermes Tweet reference at `references/hermes-tweet.md` for command patterns.

## Step 3. Collect X evidence

Run Hermes Tweet searches and reads in this order:

1. Search recent tweets for every planned query.
2. Keep posts with clear relevance, recent timing, and visible engagement signals.
3. Open the strongest threads with `thread`.
4. Read replies for posts where the replies reveal objections, questions, or user language.
5. Look up the key user profiles behind repeated arguments.
6. For creator research, export followers or following only when the user asks for audience mapping.
7. For launch monitoring, repeat the search with complaint, pricing, alternative, and comparison phrases.

Capture at least:
- Tweet URL or ID
- Author handle
- Text or summary
- Created date
- Engagement signals when available
- Reply theme
- Why it matters for the user's audience

Never invent metrics, authors, dates, or URLs.

## Step 4. Cluster signals

Group the evidence into 5 to 10 signal clusters.

A signal cluster should have at least two of:
- Repeated wording across posts or replies
- Strong engagement on one or more posts
- Clear disagreement or confusion
- Useful customer language
- A new product, feature, policy, or market shift
- A credible creator or buyer account discussing it

Discard isolated weak posts unless they contain unusually useful phrasing.

## Step 5. Turn signals into content angles

For each cluster, create 2 to 3 content angles:

- One LinkedIn post angle
- One X post or thread angle
- One newsletter or short-form video angle when relevant

Tie each angle to evidence. Do not output generic ideas.

## Step 6. Output

First line:

```
As of [DD/MM/YYYY]
```

Then output this table:

```
| Signal Cluster | Evidence From X | Key Accounts or Communities | Reply Language | What People Are Asking or Arguing | Why It Matters | Content Angles |
```

Under the table, add:

```
NEXT MOVES
1. [Best angle to hand to post-writer]
2. [Best angle to hand to content-matrix]
3. [Best account, query, or tweet to monitor next]
```

## Step 7. Offer the next move

Ask:

> Which signal should I turn into content? Give me the row number and I will hand it to post-writer, post-formatter, or content-matrix.

If the user asks to monitor or post from the research, confirm the exact account and action first. X actions are never automatic.

## Rules

- Always use Hermes Tweet for X data when `XQUIK_API_KEY` is available.
- Never ask for X login material.
- Never invent links, metrics, dates, authors, replies, or screenshots.
- Prefer recent posts. If a post is older than 30 days, say why it still matters.
- Quote only short snippets. Summarise the rest.
- Always separate evidence from interpretation.
- Do not post, reply, like, retweet, follow, or send DMs unless the user explicitly confirms the exact action.
- British English throughout.
- Never use em dashes.
