---
name: fact-checker
description: >
  Verify every claim in a drafted post against primary sources before it publishes. Extracts the numbers, quotes, prices, dates and capability claims, traces each one to its original source with live web search, then returns a per-claim verdict of verified, soften or cut. Use this skill whenever the user says "fact check this", "verify my claims", "check my facts", "are these numbers right", "is this accurate", or pastes a draft and asks whether the claims in it are true. Needs no API keys. Runs before post-formatter or reels-scripting output ships.
---

# Fact Checker

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1. Do not summarise. Do not explain why accuracy matters. Start immediately.

## Step 1. Get the draft

If the user pasted a draft in the same message (post, hook, reel script, carousel copy or newsletter section), use it and skip to Step 2.

Otherwise ask:

> Paste the draft you want fact checked.

Wait for the draft.

## Step 2. Extract every checkable claim

List each statement a reader could prove wrong. Hunt for:

- **Numbers**: statistics, percentages, prices, valuations, benchmark scores, user counts, revenue figures
- **Quotes**: anything in quotation marks attributed to a person or company
- **Dates**: launch dates, deadlines, "last week", "just announced"
- **Capability claims**: "X can now do Y", "X beats Y", "the first tool that..."
- **Availability**: is the thing usable today, or only announced
- **Superlatives**: "biggest", "fastest", "first". Each one is a checkable claim.

Number the claims. If the draft contains none, output `VERDICT: ACCURACY_PASS (no checkable claims)` and stop.

Sanity gate before searching: check any arithmetic the draft implies. Percentages that should sum to 100, growth that implies impossible baselines, totals that do not match their parts. Arithmetic fails faster than search.

## Step 3. Trace each claim to a primary source

For each claim, search the live web and open the actual origin:

- The company or lab's own blog post, changelog, pricing page or filing
- The actual tweet, repo, paper or video, not a screenshot of one
- For quotes: the interview, transcript or post where the words were said

A roundup, a newsletter or another creator's post is not a source. It is a lead. Follow it to the origin.

Two escalation rules:

1. **Primary blocked.** Some origin sites refuse automated fetches. Corroborate the specific fact across other reachable official pages (a co-maker, a press page, a store listing) plus at least three independent reputable outlets, and note that the primary was unreachable.
2. **Sources disagree.** If two sources give different figures, cite the range with attribution or cut the claim. Never pick the most dramatic number.

The full source hierarchy and failure-mode catalogue live in [references/verification-playbook.md](references/verification-playbook.md). Read it when a claim is hard to classify.

## Step 4. Assign a verdict to each claim

Read voice.md and about-me.md from the project root if they exist, so every rewrite keeps the user's voice. If they are missing, note it and match the draft's own register.

Three verdicts:

- **VERIFIED**: the primary source confirms it. Attach the URL.
- **SOFTEN**: directionally true but overstated. Supply a rewrite that downgrades the claim to what the source supports. The standard downgrades: "in my testing", "reportedly", "self-reported", "announced, not yet available".
- **CUT**: no source found, a source directly contradicts it, rumour, or the numbers do not add up. Supply the sentence with the claim removed, or a sourced replacement claim.

## Step 5. Output the report

```
FACT CHECK: [first line of the draft]

| # | Claim | Verdict | Source or rewrite |
|---|-------|---------|-------------------|
| 1 | "..." | VERIFIED | https://... |
| 2 | "..." | SOFTEN | suggested rewrite |
| 3 | "..." | CUT | reason + replacement |

VERDICT: [ACCURACY_PASS | N claims block publishing (see rows ...)]
```

The verdict line at report time: `ACCURACY_PASS` only when every row is VERIFIED. Every SOFTEN and CUT row counts as blocking until it is resolved in Step 6.

## Step 6. Offer the fix

Ask:

> Want me to apply the rewrites and return the corrected draft?

If yes, return the full corrected draft with every VERIFIED claim untouched and every SOFTEN or CUT row resolved, then re-issue the verdict line. A corrected draft earns `VERDICT: ACCURACY_PASS`.

If no, the blocking verdict stands. Say so plainly:

> The draft ships at your own risk. [N] claims did not survive verification.

## Rules

- Never fabricate or guess a number to fill a gap. A missing stat beats a wrong one.
- "Probably true" is not verification. If you cannot point at the source, it is unverified.
- Announced is not available. Check which one the draft claims.
- Distrust vendor benchmarks and income claims by default. They are marketing until a primary source confirms them.
- Never soften a claim its source fully supports. Confidence is earned by the check.
- Rewrites must match voice.md. An accurate line in the wrong voice gets rejected anyway.
- British English in reports. Rewrites follow voice.md, or the draft's own spelling when voice.md is missing.
