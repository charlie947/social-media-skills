# Versions

## Unreleased

Platform-agnostic pass. All 17 skills now work on any capable LLM agent, not just Claude.

- Replaced Claude-only assumptions with generic agent language: `AskUserQuestion` is now offered as one example with a plain-chat fallback, "Cowork project" reads as "project or workspace", "Claude for Chrome" reads as "any browser-automation capability", and surface names in content-matrix and analytics-dashboard describe agent capabilities rather than named products.
- Made voice-file lookups configurable: skills scan for equivalents when the default `about-me.md` / `voice.md` names are not used.
- pinned-comment de-branded from Claude/Anthropic specifics to generic "AI tool" while keeping the joke structure.
- Added an optional Dopa adapter: a "Dopa integration (optional)" section in each skill plus a master mapping in `dopa-adaptation.md`. Additive only, changes nothing for Claude.

## 1.0.0 — 2026-04-22

Initial release. 17 skills covering the full content system documented in the MarTech AI newsletter.

**Voice foundation**
- voice-builder
- newsletter-voice

**LinkedIn**
- profile-optimizer
- post-writer
- graphic-designer
- post-scorer
- post-formatter
- hook-generator
- content-matrix
- niche-research
- gemini-infographic
- gemini-carousel
- quote-post

**Instagram Reels**
- reels-scripting

**YouTube**
- youtube-thumbnail

**Community**
- pinned-comment

**Analytics**
- analytics-dashboard
