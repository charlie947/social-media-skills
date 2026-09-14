# Verification playbook

Reference for the fact-checker skill. Read when a claim is hard to classify.

## Source hierarchy (strongest first)

1. **The origin artefact.** The company or lab's own blog post, changelog, pricing page, model card, SEC filing or press release. The actual tweet or post, opened at its own URL. The repo. The paper.
2. **Platform-official policy or documentation.** What the platform itself publishes about its own rules or features.
3. **Large-sample studies with a published methodology.** An analytics vendor's study of millions of posts counts. Their marketing blog does not.
4. **Independent reputable outlets, in numbers.** Only when the origin is unreachable, and only when at least three of them agree on the specific fact.
5. **Everything else is a lead, not a source.** Roundups, newsletters, other creators' summaries and screenshots point you towards the origin. They never substitute for it.

## Failure-mode catalogue

The recurring ways confident posts turn out wrong. Check the draft against each.

| Failure mode | What it looks like | The check |
|---|---|---|
| Announced as available | "You can now use X" when X is waitlist-only or demo-only | Find the access page. Try the signup path in the source. |
| Mislabelled model or version | Benchmarks from one version attributed to another | Match the exact version string in the origin. |
| Cherry-picked benchmark | "X beats Y" from one favourable metric | Read the full table. Report the range or the caveat. |
| Rumour as fact | "X is acquiring Y" sourced to a single unsourced tweet | Origin or silence. No primary, no post. |
| Roundup as source | A stat cited to a newsletter that cited a blog that cited nothing | Walk the chain to the end. If it dead-ends, cut. |
| Self-reported as platform stat | One operator's income screenshot presented as a norm | Credit it as one person's claim or cut it. |
| Spiciest-number selection | Three outlets say 3 different revenue figures, draft uses the biggest | Cite the range with attribution or cut. |
| Arithmetic that fails | Percentages that sum past 100, growth that implies impossible baselines | Add the numbers up before searching anything. |
| Stale claim | True at launch, false now (pricing, free tiers, limits change fast) | Check the date on the source. Re-verify anything older than the news cycle. |
| Fabricated-looking precision | "$4,732 per month by day 90" style tables with no methodology | Demand the methodology. None found means cut. |

## The blocked-primary protocol

Origin sites often refuse automated fetches. When that happens:

1. Do not drop down to a single roundup.
2. Corroborate each individual fact across the maker's other reachable official pages (a co-maker, a press page, a store listing) plus at least three independent reputable outlets.
3. Every fact must appear in multiple independent places. Outlets quoting the same wire story count once.
4. Note in the report that the primary was unreachable and list what corroborated it.

Treat this playbook's examples as illustrations only. Every verdict comes from a live search, never from a remembered or pattern-matched figure.

## Worked example

Draft claim: "NoteLoop's new plan costs $8 a month and already has 2 million users."

1. Search for the maker's pricing page. It refuses automated fetch.
2. The maker's press page (reachable) says $11 a month. Its launch post says "2 million registered accounts", which is not the same thing as users.
3. Three independent outlets confirm $11 and quote the "registered accounts" figure with that exact wording.
4. Verdict: CUT the price and replace with the sourced figure. SOFTEN the user claim to "2 million registered accounts, self-reported". The false precision would have been the top comment.

## Softening vocabulary

When a claim is directionally true but the source will not carry its full weight:

- Capability you tried yourself: "in my testing"
- Unconfirmed reporting: "reportedly", with the outlet named
- Operator income or growth claims: "self-reported"
- Launched on paper only: "announced, not yet available"
- Disputed figures: "estimates range from X to Y", with attributions

A softened claim keeps the story. A cut claim keeps the credibility. Both beat a confident error.
