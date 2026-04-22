---
name: post-scorer
description: >
  Score a LinkedIn post using real performance data. Pulls the user's own post history via Apify (or uses cached data) to identify what actually performs, then scores the draft against those patterns. Use this skill whenever the user says "score my post", "review my post", "rate this post", "give me feedback", "how good is this post", or pastes a LinkedIn post and asks for critique. Scores against real data, not generic advice. Designed for live scoring at events and everyday post review.
---

# Post Scorer

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1. Do not summarise. Do not explain the scoring method. Start immediately.

## Step 1. Get the post

If the user already pasted a post in the same message, use it. Otherwise say:

> Paste the LinkedIn post you want scored.

Wait for the post.

## Step 2. Load scoring data

The scorer needs two things: the user's voice system and real performance data.

### Voice system

Read about-me.md and voice.md from the project if they exist. If missing, note it and score without voice matching.

### Performance data

Check for cached LinkedIn data in the project or outputs folder. Look for files matching *-all-posts.json or *-posts.txt.

If cached data exists, use it. If not, ask the user:

```json
[
  {
    "question": "To score your post against real data, I need your LinkedIn history. How should I get it?",
    "header": "Data source",
    "multiSelect": false,
    "options": [
      {"label": "Scrape my posts", "description": "Pull my last 100 posts from LinkedIn via Apify. Takes 1 to 2 minutes, costs about $0.50."},
      {"label": "Use Charlie Hills data", "description": "Score against Charlie Hills benchmarks (1,872 avg engagement, 500 posts analysed). Good fallback."},
      {"label": "Skip data scoring", "description": "Score against generic best practices only. Less accurate but instant."}
    ]
  }
]
```

If "Scrape my posts":
1. Ask for their LinkedIn username
2. Call Apify actor apimaestro/linkedin-profile-posts with input: { "username": "[their-username]", "total_posts": 100 }
3. Download results (do NOT use the fields parameter, it strips engagement data)
4. Save as [username]-all-posts.json in the project
5. Proceed to analysis

If "Use Charlie Hills data":
Look for cached Charlie data at **/linkedin-data/charlie-all-posts.json. If found, use it. If not, note you are using the benchmarks from this skill file (listed below).

If "Skip data scoring":
Fall back to voice-system-only scoring and general best practices.

## Step 3. Analyse the top performers

When performance data is available, run this analysis before scoring:

1. Calculate engagement score for every post: total_reactions + (comments x 3)
2. Identify the top 10% of posts by engagement score
3. From those top posts, extract:
   - Hook types that appear most often (contrarian, number-led, bold claim, personal story, question, news)
   - Average post length (word count)
   - Format distribution (text only, image, carousel, video)
   - CTA patterns (newsletter mention, comment gate, repost ask, question, none)
   - Topic clusters that over-index on engagement
   - Sentence rhythm (average sentence length, paragraph breaks per post)
4. Also note the bottom 10% patterns to identify what fails

Save these patterns as a "scoring profile" you reference for each criterion.

## Step 4. Score the post

Score across 5 criteria. Each scored 1 to 10.

### Hook strength (1 to 10)

Compare the draft's opening line to the hook types in the top 10%.
- Does it use a hook type that historically performs for this author?
- Is it specific with a number, name, or concrete detail?
- Would it stop a scroll based on what actually stops scrolls in their data?
- Score 8+ only if the hook type matches a pattern in their top 10%

### Voice match (1 to 10)

If voice.md exists:
- Does the post match tone, rhythm, sentence length from voice.md?
- Does it violate any rule in voice.md's absence patterns section (what the voice never does)?
- Does the sentence length match the average from their top performers?
If no voice files: score against the patterns extracted from their post data.

### Value density (1 to 10)

Compare to the user's top-performing posts:
- Do their best posts teach, give steps, share data, or tell stories?
- Does this draft match that value pattern?
- Is the takeaway specific enough that someone would save or share it?
- Compare word count to their top 10% average. Flag if way over or under.

### Structure and format (1 to 10)

Based on their data:
- What format (text, image, carousel) gets the most engagement for them?
- Does the draft's structure match the line break and paragraph rhythm of top posts?
- Is the post scannable on mobile?
- Does the CTA match patterns from their best performers?

### Publish readiness (1 to 10)

- Did the user actually write this or does it read like unedited AI output?
- Would this post blend naturally into their feed based on their posting history?
- Are there any red flags: banned words from voice.md, generic phrases, corporate tone?
- Is it the right length compared to their top performers?

## Step 5. Output the scorecard

Output in a code block:

```
LINKEDIN POST SCORE

Data source: [their posts / Charlie Hills benchmarks / generic]
Posts analysed: [number]
Top 10% avg engagement: [number]

Hook strength:         [X] / 10  [hook type detected]
Voice match:           [X] / 10
Value density:         [X] / 10
Structure and format:  [X] / 10  [format: text/image/carousel]
Publish readiness:     [X] / 10
----------------------------------------
TOTAL:                 [XX] / 50

VERDICT: [One sentence referencing specific data]

TOP PERFORMER COMPARISON:
Your top posts average [X] words, use [hook type] hooks,
and include [CTA pattern]. This draft [matches/differs] because [specific reason].

FIXES:
1. [Specific fix backed by data, e.g. "Your top 10% posts open with numbers. This opens with a question. Switch to a stat."]
2. [Second fix backed by data]
3. [Third fix if needed]
```

Every fix must reference the user's actual data. Not "improve the hook" but "your top 10% posts use number-led hooks (42% of hits). This draft uses a question hook (12% of hits). Lead with the stat instead."

## Step 6. Offer next steps

After the scorecard:

> Want me to rewrite the weakest section using patterns from your top posts, or ship it?

If rewrite requested, apply the fixes and output the revised post in a code block.

## Fallback benchmarks (when no data available)

Use these Charlie Hills benchmarks as the scoring baseline when the user picks "Use Charlie Hills data" and no cached file is found:

Average engagement: 1,872 (reactions + comments x 3)
Average reactions: 808
Average comments: 355
Average reposts: 61
Comment-to-reaction ratio: 44%

Top hook types: number-led (31%), bold claim (27%), contrarian (18%)
Top formats: carousel (33%), image (29%), text only (22%)
Average post length top 10%: 180 to 250 words
CTA rate: 45% mention newsletter
Comment gate rate: 5%

## Rules

- Always try to use real data before falling back to generic advice.
- Every score and every fix must reference specific data points, not subjective opinions.
- Never score higher than 8 unless the draft genuinely matches top 10% patterns.
- Be honest. A generous scorer is useless.
- If data is stale (14+ days old), suggest a refresh before scoring.
- Inform the user before running an Apify scrape (costs money).
- Never use em dashes in any output.
- British English throughout.
- Keep the scorecard compact. It needs to look good on a big screen at events.
