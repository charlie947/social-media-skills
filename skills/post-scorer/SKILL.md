---
name: post-scorer
description: >
  Score a LinkedIn post using real performance data. Pulls the user's own post history via Apify (or uses cached data) to identify what actually performs, then scores the draft against those patterns. Use this skill whenever the user says "score my post", "review my post", "rate this post", "give me feedback", "how good is this post", or pastes a LinkedIn post and asks for critique. Separates historical comparisons from an explicitly labelled editorial-only fallback. Designed for live scoring at events and everyday post review.
---

# Post Scorer

## Codex and Claude runtime

- Use this skill in Codex or Claude with the tools actually available in the current task. `AskUserQuestion` examples describe the questions, not a required API: use an available question tool within its limits, or ask in chat. Reuse answers and source material already supplied.
- Work in the user-selected project. Read its `about-me.md`, `voice.md` and relevant brand files before personalised work. Confirm the intended author if files conflict or contain starter defaults. Ask for missing facts or run `voice-builder`; never inherit the maintainer's identity, accounts or private files.
- Resolve bundled `references/` relative to this skill folder. For an explicitly requested profile refresh, read and update the canonical `about-me.md`, `voice.md` or `newsletter-voice.md` in place, preserving unrelated user facts and rules. Consumers must reread those canonical files. Use a new filename only for new deliverables that would collide with unrelated existing files. Installation alone never starts an interview or writes files. Do not write persistent learnings unless requested.
- Use supplied evidence first. Verify external claims through available search/source tools when needed. If a source or integration is unavailable, name the missing capability and offer supplied text/export input. Never invent facts, first-person experience, metrics or a successful tool run.
- Connect only services needed for the chosen route through the user's existing account. Never print credentials or overwrite connections. Drafting, saving and reviewing do not authorise publishing, sending messages or changing accounts.

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

Check for user-supplied exports or cached post data in the selected project. Verify the author, collection date and coverage before using it. Never search another user's folders or fall back to the maintainer's benchmarks.

If data is missing, offer:

1. Use an uploaded export of the user's posts and aggregate engagement counts.
2. Fetch the user's post bodies and aggregate counts with their authorised Apify connection. Confirm the account, scope and current cost before a paid run. Verify the actor's current documented input schema before calling it; do not guess fallback actor inputs.
3. Give an editorial review now, with performance comparison marked unavailable.

For an Apify run, `apimaestro/linkedin-profile-posts` is the existing provider route. Use a small requested batch (up to 100 posts). Request **post bodies and aggregate counts only**. Never scrape comments or replies, including through `deepScrape` or `numComments`. If the actor cannot exclude comment bodies, use a different verified post-only route or request an export. Do not run a comments scrape then discard it afterwards.

Opt-in alternate provider route: `johnvc/linkedin-posts-api`. Use it only when the user chooses it, or when the existing route cannot meet the post-only / no-comment-body constraint. Keep the same batch cap (up to 100 posts), cost confirmation, and schema verification. Pass the author's public profile URL in `profileUrls` and set `maxPostsPerProfile` to the requested batch size. Read post body text plus aggregate reaction and comment counts from each row. Do not request or store comment reply bodies. Do not silently substitute this provider for the existing route.

Save the resulting permitted post data under `outputs/post-scorer/` in the project with the author and collection date. If Apify is unavailable, preserve the draft and offer the export/editorial routes. Do not claim the history was fetched.

## Step 3. Analyse the top performers

When performance data is available, run this analysis before scoring:

1. Calculate engagement score for every post: total_reactions + (aggregate_comment_count x 3), an editorial weighting rather than private reach analytics
2. Identify the top 10% of posts by engagement score
3. From those top posts, extract:
   - Hook types that appear most often (contrarian, number-led, bold claim, personal story, question, news)
   - Average post length (word count)
   - Format distribution (text only, image, carousel, video)
   - CTA patterns (newsletter mention, comment gate, repost ask, question, none)
   - Topic clusters that over-index on engagement
   - Sentence rhythm (average sentence length, paragraph breaks per post)
4. Also note the bottom 10% patterns to identify what fails

Record the source, date, sample size and patterns in this review. Do not write persistent memory unless requested. Unknown counts are missing, not zero; say when the sample is too small or selected to support a performance comparison.

## Step 4. Score the post

Score across 5 criteria, each 1 to 10. Separate editorial judgement from measured historical comparisons. If neither a voice profile nor confirmed author samples exist, mark Voice match unavailable and report the total over 40; otherwise use 50. No numerical total implies predicted performance.

### Hook strength (1 to 10)

Compare the draft's opening line to the hook types in the top 10%.
- Does it use a hook type that historically performs for this author?
- Is it specific with a number, name, or concrete detail?
- Would it stop a scroll based on what actually stops scrolls in their data?
- With history, cite the relevant pattern; without it, label the hook score editorial and leave historical fit unavailable

### Voice match (1 to 10)

If voice.md exists:
- Does the post match tone, rhythm, sentence length from voice.md?
- Does it violate any rule in voice.md's absence patterns section (what the voice never does)?
- Does the sentence length match the average from their top performers?
If no voice files: use confirmed author samples from their post data. If neither is available, mark this criterion unavailable.

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

- Are all claims supported, required items covered, and edits complete? Do not infer authorship from style.
- Would this post blend naturally into their feed based on their posting history?
- Are there any red flags: banned words listed in voice.md's absence patterns, generic phrases, corporate tone?
- Is it the right length compared to their top performers?

## Step 5. Output the scorecard

Output in a code block:

```
LINKEDIN POST SCORE

Data source: [verified author export / verified Apify results / editorial only]
Posts analysed: [number or unavailable]
Top 10% avg engagement: [measured number or unavailable]

Hook strength:         [X] / 10  [hook type detected]
Voice match:           [X] / 10
Value density:         [X] / 10
Structure and format:  [X] / 10  [format: text/image/carousel]
Publish readiness:     [X] / 10
----------------------------------------
TOTAL:                 [XX] / [50 or 40, excluding unavailable voice]

VERDICT: [One sentence referencing specific data]

TOP PERFORMER COMPARISON:
Your top posts average [X] words, use [hook type] hooks,
and include [CTA pattern]. This draft [matches/differs] because [specific reason].

FIXES:
1. [Specific fix backed by data, e.g. "Your top 10% posts open with numbers. This opens with a question. Switch to a stat."]
2. [Second fix backed by data]
3. [Third fix if needed]
```

Cite actual evidence for historical comparisons. For editorial-only review, omit the top-performer comparison and give specific copy/structure fixes labelled editorial. Never fill the template with invented metrics. Check every required roster item or step against the exact draft before scoring.

## Step 6. Offer next steps

After the scorecard:

> Want me to rewrite the weakest section using patterns from your top posts, or ship it?

If rewrite requested, apply the fixes and output the revised post in a code block.

## Rules

- Always try to use real data before falling back to generic advice.
- Mark each finding as sourced/history-based or editorial judgement.
- A high editorial score does not establish historical fit or predict reach.
- Be honest. A generous scorer is useless.
- If data is stale (14+ days old), suggest a refresh before scoring.
- Inform the user before running an Apify scrape (costs money).
- Never use em dashes in any output.
- British English throughout.
- Keep the scorecard compact. It needs to look good on a big screen at events.
