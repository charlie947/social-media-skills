# Foundations

The deep reference docs the agent reads before producing content. The rules for *when* to
read each one live in [`../CLAUDE.md`](../CLAUDE.md) (Section 1).

| File | What it is |
|---|---|
| `VOICE_PROFILE_SAL_v2.md` | The canonical, deep voice profile — samples, openers/closers, signature artifact formats, the agent system prompt and output checklist. **Source of truth** when it disagrees with the quick-reference files. |
| `ANTI AI WRITING STYLE.md` | Field guide to AI writing tells. The blacklist of patterns to scrub before shipping any copy. |
| `COPYWRITING.md` | Six copywriting masters + a diagnostic framework for persuasive copy. |
| `CLAUDE PROMPTING COOKBOOK.md` | Prompting best practices, for building image/video prompts or chaining complex tasks. |

The quick-reference voice files [`about-me.md`](../about-me.md) and [`voice.md`](../voice.md)
stay at the repo root: the skills in `skills/` look for them there by name, so moving them
would break those skills.
