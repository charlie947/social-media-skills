# Social Media Skills

The full set of Claude skills behind Charlie Hills' content system. 350,000+ followers across LinkedIn, Instagram, Substack, X, and YouTube. 100m+ views this year. All run through one system that starts with the newsletter and flows out to every other channel.

If you want the full story of how this system runs, read the newsletter issue here: https://charliehills.substack.com

## How the system flows

```
Newsletter (source)
    ├── LinkedIn post      (graphic first, then caption, then scored)
    ├── Instagram Reel     (script, voice, avatar, motion graphics)
    ├── YouTube thumbnail  (generated before the script)
    └── Pin comment        (meme caption + image prompt)
```

Every skill in this repo plugs into one of those layers.

## Install

Each folder is a standalone Claude skill. Zip the folder and upload it to Claude (Customise skills → Upload skill file), or drop the SKILL.md directly into `~/.claude/skills/` if you are running Claude Code.

```bash
# Zip a single skill for upload to the Claude desktop app
cd social-media-skills
zip -r voice-builder.skill voice-builder

# Or copy every skill into Claude Code
cp -r */ ~/.claude/skills/
```

## Layer 1: Voice foundation

Install these first. Every other skill references the files they produce.

| Skill | What it does |
|---|---|
| [voice-builder](./voice-builder) | Interview + sample analysis. Writes `about-me.md` and `voice.md` into your project root |
| [newsletter-voice](./newsletter-voice) | Adds newsletter-specific rules on top of voice-builder. Writes `newsletter-voice.md` |

Run voice-builder first. Then newsletter-voice.

## Layer 2: LinkedIn

The graphic-first workflow: design the visual before you write the caption, then score the whole thing against your own post history.

| Skill | What it does |
|---|---|
| [profile-optimizer](./profile-optimizer) | Rebuilds headline, about, experience, featured section, plus 4 image generation prompts |
| [post-writer](./post-writer) | Drafts posts in your voice using the voice files |
| [graphic-designer](./graphic-designer) | Picks between HTML/CSS graphic or AI-generated infographic |
| [infographic-generator](./infographic-generator) | The full Claude Code infographic workflow with templates, brand rules, and layout guides |
| [post-scorer](./post-scorer) | Pulls your post history via Apify and scores any draft against what actually works for you |

Run profile-optimizer first. Traffic from posts lands on your profile, so fix that before shipping.

## Layer 3: Video

| Skill | What it does |
|---|---|
| [linkedin-to-reels](./linkedin-to-reels) | Repurposes top LinkedIn posts into Instagram Reel scripts |
| [youtube-thumbnail](./youtube-thumbnail) | Builds a branded YouTube thumbnail before you write the script |

## Layer 4: Community

| Skill | What it does |
|---|---|
| [pinned-comment](./pinned-comment) | Writes the pinned meme comment plus an image generation prompt |

## Standalone LinkedIn skills

Smaller skills for specific jobs. Install the ones you need.

| Skill | What it does |
|---|---|
| [hook-generator](./hook-generator) | Six clickbait-style hook variations per topic |
| [post-formatter](./post-formatter) | Turns a topic into a ready-to-publish post using PAS, AIDA, BAB, STAR, or SLAY frameworks |
| [content-matrix](./content-matrix) | Pairs pillars with 8 formats for 32+ post ideas in one table |
| [perplexity-research](./perplexity-research) | Surfaces the 20 most relevant stories in your niche from the last 7 days |
| [gemini-infographic](./gemini-infographic) | The whiteboard prompt that pulled 480k impressions from 3 posts |
| [gemini-carousel](./gemini-carousel) | Branded slide-by-slide carousel generator with approval step |
| [quote-post](./quote-post) | Claude writes the quote, Gemini recreates the image with the quote baked in |
| [analytics-dashboard](./analytics-dashboard) | Turns a LinkedIn export into a scatter plot, audience breakdown, growth projection, and 5 data-backed recommendations |

## Shortcut: use Stanley

If setting up this stack sounds like a lot, Stanley runs the whole Layer 2 flow for you. Give it a topic, get back a post in your voice with a matching graphic. 14-day free trial: https://www.stanleyhq.com

## License

MIT. Do whatever you like with these. If they help you, a link back to the newsletter is appreciated.

— Charlie Hills
