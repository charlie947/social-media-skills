# Output

Everything the agent produces lands here — never loose in the repo root. Files are
sorted by channel/type and named so you can tell what each one is at a glance.

## Folders

| Folder | Holds |
|---|---|
| `linkedin/` | LinkedIn text posts |
| `x/` | X / Twitter posts and threads |
| `artifacts/` | Reusable templates: experiment briefs, leak audits, offer teardowns, loop maps, scorecards |
| `carousels/` | Carousel slide copy + image prompts |
| `graphics/` | Infographic / quote-post / graphic-designer prompts and specs |
| `reels/` | Instagram Reels scripts |
| `youtube/` | YouTube thumbnail prompts + titles |
| `research/` | Niche-research digests, content-matrix idea tables |
| `analytics/` | Analytics dashboards + post-scorer reports |
| `profile/` | LinkedIn profile rebuilds |
| `community/` | Pinned comments, DM/comment drafts |

## Naming convention

```
YYYY-MM-DD__<channel>__<type>__<slug>.<ext>
```

- **date** — when it was produced.
- **channel** — linkedin, x, instagram, youtube, newsletter, or `general` if cross-channel.
- **type** — post, artifact, carousel, infographic, quote, reel-script, thumbnail, research, dashboard, profile, pinned-comment.
- **slug** — a short kebab-case description (not a generic label).
- **ext** — `.md` for copy/specs, `.html`/`.jsx` for dashboards/graphics, `.json` for data.

Examples:

```
linkedin/2026-06-23__linkedin__post__cac-isnt-the-problem.md
artifacts/2026-06-23__general__artifact__growth-experiment-brief.md
carousels/2026-06-23__linkedin__carousel__5-attribution-myths.md
reels/2026-06-23__instagram__reel-script__faster-spam-ai-outbound.md
analytics/2026-06-23__linkedin__dashboard__q2-performance.html
```

## File header

Every saved markdown deliverable starts with a metadata block so the folder stays scannable:

```
---
date: 2026-06-23
channel: linkedin
type: post
topic: CAC isn't the problem
status: draft   # draft | approved | published
skill: post-writer
---
```

The rules that govern all of this live in [`../CLAUDE.md`](../CLAUDE.md).
