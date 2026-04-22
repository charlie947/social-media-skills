# Contributing

Thanks for your interest in improving these skills. This guide covers how to add new skills, improve existing ones, and submit changes.

## Quick start

1. Fork the repo
2. Create a feature branch (`feat/new-skill-name` or `fix/skill-name-issue`)
3. Make your changes
4. Run `./validate-skills.sh` to check your changes against the spec
5. Open a PR

## Adding a new skill

1. Create a new folder under `skills/` with a lowercase hyphenated name matching the skill's `name` field.
2. Add a `SKILL.md` file with YAML frontmatter.

Minimum frontmatter:

```yaml
---
name: my-new-skill
description: >
  One or two sentences explaining what the skill does and when to use it. Include specific trigger phrases the user might say, like "write a post about", "score my draft", or "build me a carousel". The first word of the description should be a verb or action.
---
```

3. Write the skill body. Most skills follow this structure:

```markdown
# Skill Name

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1. Do not summarise. Start immediately.

## Step 1. Gather inputs
[Use AskUserQuestion where possible]

## Step 2. [Main work]

## Step 3. Output
[Code block showing the exact output format]

## Rules
[Non-negotiables. Voice rules, word limits, what never to do]
```

4. Keep `SKILL.md` under 500 lines. Move reference material to `skills/my-new-skill/references/`.
5. If the skill has templates or assets, put them in `skills/my-new-skill/assets/`.
6. If the skill runs shell scripts, put them in `skills/my-new-skill/scripts/`.

## Improving an existing skill

- Keep the YAML frontmatter name matching the folder name.
- Do not break the skill's trigger phrases in the description. Others rely on them.
- If you change the output format, update the `## Output` section in the skill.
- Test the skill in your own Claude project before opening a PR.

## Style rules

These rules apply to every skill in the repo:

- British English throughout (spelling, "ise" not "ize")
- Short sentences. No em dashes. No semicolons.
- Never use: "leverage" (as a verb), "deep dive", "unlock", "game-changer", "groundbreaking"
- Use AskUserQuestion for input gathering where a tool call is better than typing questions
- Rules section at the bottom covers non-negotiables with "never" and "always" phrasing
- Every skill that produces a file (like voice-builder writing `about-me.md`) states the exact filename and location
- Every skill that depends on another skill's output checks for it before running

## Naming conventions

- Folder name = YAML `name` field = lowercase, hyphen-separated, no spaces
- Skill names read as verb-object or noun phrases describing the output (`post-writer`, not `writing-posts`)
- Keep names short. Three words max where possible.

## Testing locally

Copy your skill into Claude's skill directory:

```bash
cp -r skills/my-new-skill ~/.claude/skills/
```

Then trigger it in a new Claude conversation with the phrases listed in the description. Confirm:

- Claude picks up the skill on the trigger phrase
- Inputs are collected correctly (AskUserQuestion renders)
- Output matches the format in the skill
- All external dependencies (Apify, Gemini, etc.) are checked before use

## Submitting a PR

- Title: `feat: add [skill-name]` or `fix: [skill-name] [brief description]`
- Body: describe what changed and why, include sample input/output if relevant
- Link any related issue

Questions? Open a GitHub issue.
