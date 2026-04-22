---
name: post-formatter
description: >
  Turn a topic into a ready-to-publish LinkedIn post using PAS, AIDA, BAB, STAR, or SLAY frameworks. 200 to 250 words, 20 lines max, mobile-formatted with blank lines between sentences. Use this skill whenever the user says "format this as a post", "turn this into a LinkedIn post", "write it as PAS" or any named framework, or wants a properly structured post from a topic. Different from post-writer: post-formatter applies a strict framework. post-writer drafts in the user's voice without framework constraints.
---

# Post Formatter

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1. Do not summarise. Start input gathering immediately.

## Step 1. Gather inputs

Call AskUserQuestion:

```json
[
  {
    "question": "What topic do you want to post about?",
    "header": "Topic",
    "multiSelect": false,
    "options": [
      {"label": "I will type the topic", "description": "Single sentence describing the subject"},
      {"label": "Paste a context dump", "description": "Notes, stats, transcripts to turn into a post"}
    ]
  },
  {
    "question": "Which framework?",
    "header": "Framework",
    "multiSelect": false,
    "options": [
      {"label": "PAS", "description": "Problem, Agitation, Solution"},
      {"label": "AIDA", "description": "Attention, Interest, Desire, Action"},
      {"label": "BAB", "description": "Before, After, Bridge"},
      {"label": "STAR", "description": "Situation, Task, Action, Result"},
      {"label": "SLAY", "description": "Story, Lesson, Actionable advice, You"},
      {"label": "Pick for me", "description": "Recommend the best framework based on the topic"}
    ]
  }
]
```

Ask one follow-up:

> Anything else I should know? Facts, stats, tone notes, or who this is for.

Wait for response.

## Step 2. Write the post

Apply these global rules to every output:

- Maximum 20 lines, 200 to 250 words total (~1,200 characters)
- Blank line after every line
- Most lines: one sentence, 55 characters or fewer
- Up to 4 lines may be mini-paragraphs (2 to 3 sentences, 110 characters or fewer)
- Grade 6 words. Zero adverbs, zero jargon, zero fluff
- No em dashes
- No questions unless the hook itself is a question
- No emojis except checkmarks for numbered lists (1. 2. 3.) and the recycle symbol in the CTA
- Rule of Three: use at most two trios per post
- Vary sentence starts. Do not over-use "I"

## Step 3. Structure

- **Line 1 (Hook)**: Bold. 50 characters or fewer.
- **Line 2 (Twist / Contrast)**: 50 characters or fewer. Opposes or surprises the hook.
- **Lines 3 to 18 (Core)**: The chosen framework, split across 3 to 5 lines per stage. Any list inside a stage must have exactly three items (1. 2. 3.). Use arrows to show flow where useful.

Framework maps:

- **PAS**: Problem -> Agitation -> Solution
- **AIDA**: Attention -> Interest -> Desire -> Action
- **BAB**: Before -> After -> Bridge
- **STAR**: Situation -> Task -> Action -> Result
- **SLAY**: Story -> Lesson -> Actionable advice -> You

- **Lines 19 to 20 (Wrap and CTA)**: 2 to 3 lines that lock the lesson. Close with one of these phrases followed by the recycle symbol: "Repost if", "Repost this", or "If this helped, repost".

## Step 4. Output

Output the finished post inside a code block. No preamble, no trailing notes.

## Step 5. Offer the next move

After the post, ask:

> Want a matching graphic (graphic-designer skill) or want me to score it against your post history (post-scorer skill)?

## Rules

- Return the finished post only. No meta-commentary.
- Enforce line length, word count, and lines count limits. Count them.
- Never use em dashes.
- British English unless voice.md specifies otherwise.
- If the user has voice.md in the project, tune tone and rhythm to match it.
- If a trio is used, it has exactly three items. Not two, not four.
