---
name: newsletter-voice
description: >
  Build newsletter writing instructions inside a Cowork project. Runs after voice-builder. Produces newsletter-voice.md, a single file Claude references when drafting newsletters in the user's voice. Works with or without existing newsletter samples: if the user has past issues, the skill analyses them; if not, the skill offers 6 archetypes tuned to the user's voice. Trigger whenever the user says "build my newsletter voice", "learn my newsletter style", "set up my newsletter system", "train on my newsletters", "newsletter onboarding", or drops newsletter samples into chat asking for an analysis. Requires voice-builder to have run first: the skill needs voice.md and about-me.md in the project to work.
---

# Newsletter Voice

## Prerequisites check

The moment this skill is triggered, check the project root for voice.md and about-me.md.

If either file is missing, tell the user:

> Newsletter voice sits on top of your general voice profile. Run voice-builder first (upload the skill or say "build my voice"), then come back here once about-me.md and voice.md are in the project.

Then stop. Do not continue until both files exist.

If both files exist, read them fully, then go straight to Step 1.

## Step 1. Check for samples

Ask the user in chat:

> Do you have 2 to 3 past newsletter issues I can learn from?
>
> Yes: paste them here (one per message or all at once)
> No: type "archetype" and I will build from a template tuned to your voice

Wait for response.

If the user pastes 2 or more newsletters, go to Step 2a.
If the user types "archetype", go to Step 2b.
If the user pastes 1 newsletter, ask for at least one more. If they only have one, offer: "One sample is not enough for pattern detection. Want me to switch to archetype mode and use your one newsletter as a reference point?"

## Step 2a. Sample-based analysis

Read every newsletter fully. Look for patterns across issues, not one-off quirks. Extract:

**Opening formula**
- What the first 3 sentences do (specific result, cultural observation, claim, scene, question)
- Length of the opening section before the first structural break
- Credibility move (how the author establishes authority early)
- Value promise (what the reader is told they will get)

**Section structure**
- Problem or contrast setup
- Named framework or free prose
- Numbered steps, methods, or continuous argument
- Examples and evidence patterns
- Bonus or extension section
- Closing formula and signoff

**Data philosophy**
- Specific numbers per issue (count them)
- Source attribution style (linked, named, uncredited)
- Example-to-abstraction ratio
- Limitation or failure acknowledgements

**Formatting**
- Header usage (frequency, hierarchy)
- List usage (numbered, bulleted, arrows)
- Bold and italic usage
- Prompt, code block, or blockquote formatting
- Visual markers (arrows, checkmarks, emojis if any)

**Length**
- Word count range across samples
- Section word counts

**Voice markers unique to newsletter format**
- Pro tips or callouts (frequency, format)
- Forward-looking closings
- Signoff phrase if consistent across samples
- Meta-transparency (does the author reflect on the process or ask for feedback)

**Absence signals**
- Words, constructions, or structures absent from every sample
- Closing moves the author never uses
- Topics the author never touches

Then go to Step 3.

## Step 2b. Archetype selection

Call the AskUserQuestion tool with a single question:

```json
[
  {
    "question": "Which newsletter archetype fits what you want to write?",
    "header": "Archetype",
    "multiSelect": false,
    "options": [
      {"label": "Data tutorial", "description": "Numbers, frameworks, step-by-step methods with prompts"},
      {"label": "Contrarian essay", "description": "Take a position, defend it, name the opposition"},
      {"label": "Case study teardown", "description": "One subject per issue, unpacked in depth"},
      {"label": "Curated digest", "description": "5 to 7 links with your commentary each week"},
      {"label": "Personal essay", "description": "Reflection on a theme, story-first"},
      {"label": "Interview or profile", "description": "One person per issue, Q and A or narrative"}
    ]
  }
]
```

After the user picks an archetype, load the matching defaults from `references/archetypes.md` inside this skill folder. Tune every field using voice.md and about-me.md before writing newsletter-voice.md. Flag inside the output file that archetype defaults were used and the file should be revisited after 5 published issues.

## Step 3. Write newsletter-voice.md

Create newsletter-voice.md in the project root. Single file, 800 to 1,200 words target. Use this structure:

```
# Newsletter Voice

## Source
[Sample-based: analysed X newsletter issues] OR [Archetype-based: [archetype name] tuned to voice.md. Revisit after 5 published issues.]

## Audience and purpose
[Who reads this newsletter and what they get from it. Written from about-me.md and voice.md. 2 to 3 sentences.]

## Voice principles
[3 to 5 core principles the writing always holds. Each one a short declarative sentence. Tuned to this user's voice.md.]

## Opening formula
[How issues start. Include 2 concrete templates with bracketed placeholders, e.g. "[Specific result with number]. [Credibility marker]. [Value promise for this issue]." Target word count for the opening section.]

## Section flow
[Standard structure of an issue, section by section, 5 to 8 sections max. Brief notes on what each section does and how long it runs.]

## Data and evidence
[How numbers and examples are used. Specific rules, e.g. "every claim needs a number", "sources linked inline", "example-to-abstraction ratio roughly 3:1".]

## Formatting rules
[Headers, lists, bold, italic, code blocks, visual markers. What to use, what to avoid. Drawn from samples or archetype defaults.]

## Closing and signoff
[How issues end. Forward-looking statement versus summary. Signoff phrase if a consistent one exists across samples (do not invent one).]

## What this newsletter never does
[1 short paragraph or 3 to 5 items. Drawn from absence patterns across samples or archetype defaults. Behaviours only, not a banned-words list.]

## Length
[Word count target for standard issues. Separate target for longer comprehensive guides if the user writes both formats.]
```

Fill every section from the samples (or tuned archetype defaults). No generic filler. If the samples do not cover something, say "no clear pattern across samples" rather than guessing.

## Step 4. Confirm and hand off

Tell the user:

> Your newsletter voice is built. newsletter-voice.md is in your project root alongside about-me.md and voice.md. When you want to draft an issue, say "write a newsletter" and I will use all three files together.
>
> [If archetype mode: Remember this file was built from archetype defaults. After 5 or so published issues, re-run this skill with your real samples for a sharper profile.]

## What this skill produces

One file in the project root:

- newsletter-voice.md: newsletter-specific writing instructions covering audience, voice principles, opening formula, section flow, data philosophy, formatting, closing, absence patterns, and length targets

## Rules

- Require voice.md and about-me.md in the project root before running. Stop and redirect to voice-builder if either is missing.
- Minimum 2 newsletter samples if the user chooses sample-based mode. Offer archetype mode if fewer.
- Keep newsletter-voice.md under 1,200 words. Tight beats exhaustive.
- Do not invent voice signals. Work only from samples or archetype defaults tuned to voice.md.
- Do not duplicate content from voice.md. Reference it where relevant. newsletter-voice.md adds newsletter-specific rules only.
- Do not bake in the user's specific names, URLs, or signoff phrases unless they appear consistently across 2 or more samples.
- Do not produce a separate voice or banned-words file. Absence patterns live inside newsletter-voice.md as a single section.
- British English throughout unless samples are clearly American.
- Never use em dashes in any output file or in any draft.
