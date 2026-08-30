# Dopa integration (optional)

These skills are platform-agnostic. They run on any capable LLM agent (Claude, Gemini, DeepSeek, OpenRouter models, and others) with no external product required.

This file documents an **optional** adapter for teams running on the [Dopa](https://dopa.solutions) platform. It maps Dopa's native tools onto each skill so an agent with those tools can act directly (publish, generate images, read brand assets, read analytics) instead of handing prompts back to the user.

Nothing here changes how the skills behave on Claude or any other agent. If the Dopa tools are not present, ignore this file: every skill works unchanged.

## Dopa tools

| Tool | What it does |
|---|---|
| `publish_social_post` | Publish a post or comment to LinkedIn, Instagram, or X |
| `create_canva_design` / `generate_ad_creative` | Render an image or creative from a prompt |
| `get_brand_assets` | Read the tenant's brand colours, logo, fonts, tone words |
| `get_analytics` / `analyze_campaigns` | Read post and campaign performance metrics |

## Mapping per skill

| Skill | Dopa tools | How it helps |
|---|---|---|
| voice-builder | `get_brand_assets` | Seed about-me.md and voice.md from the tenant's brand voice. Confirm with the user. |
| newsletter-voice | `get_brand_assets` | Tune archetype defaults with the tenant's tone and pillars. |
| profile-optimizer | `get_brand_assets`, `create_canva_design` / `generate_ad_creative` | Fill the visual brief with real brand colours and render the 4 profile images. |
| post-writer | `get_brand_assets`, `publish_social_post` | Reinforce voice with brand terms, then publish the approved post. |
| post-formatter | `publish_social_post` | Publish the finished framework post. |
| graphic-designer | `get_brand_assets`, `create_canva_design` / `generate_ad_creative` | Use real brand colours and render the graphic directly. |
| post-scorer | `get_analytics` / `analyze_campaigns` | Build the scoring profile from real performance instead of an Apify scrape. |
| hook-generator | none direct | Hooks feed post-writer / post-formatter, which publish via `publish_social_post`. |
| content-matrix | `analyze_campaigns` | Rank matrix cells by what has performed for the tenant. |
| niche-research | none direct | Any output row feeds post-writer / post-formatter, which publish via `publish_social_post`. |
| gemini-infographic | `get_brand_assets`, `create_canva_design` / `generate_ad_creative` | Use real brand colours and render the infographic. |
| gemini-carousel | `get_brand_assets`, `create_canva_design` / `generate_ad_creative` | Use real brand colours and render each slide. |
| quote-post | `create_canva_design` / `generate_ad_creative`, `publish_social_post` | Render the quote graphic and publish it. |
| reels-scripting | `create_canva_design` / `generate_ad_creative`, `publish_social_post` | Render a Reel cover and publish the Reel and caption. |
| youtube-thumbnail | `get_brand_assets`, `create_canva_design` / `generate_ad_creative` | Use real brand colours and render the thumbnail. |
| pinned-comment | `create_canva_design` / `generate_ad_creative`, `publish_social_post` | Render the image and post the comment as the first comment. |
| analytics-dashboard | `get_analytics` / `analyze_campaigns` | Build the dashboard from live metrics instead of an uploaded export. |

## Rules for the optional layer

- Always confirm the target channel and show the final text or image before calling `publish_social_post`.
- Treat anything from `get_brand_assets` as a draft the user confirms, not a final decision.
- Never invent metrics. If `get_analytics` cannot fill a panel or a fix, say so rather than guessing.
- If a Dopa tool is unavailable, fall back to the skill's default behaviour (output the prompt, save the file, ask the user).
