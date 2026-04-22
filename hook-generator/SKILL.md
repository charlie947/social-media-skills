---
name: hook-generator
description: >
  Generate 6 clickbait-style LinkedIn hook variations for any topic. Two-line hooks built on the formula: a 40-char opening line, a 40-char bold contrast line. Includes digits, "How I" or "I" statements, and metrics. Use this skill whenever the user says "write me hooks", "hook ideas", "generate hooks", "I need a hook for a post about...", or pastes a topic and asks for openers. Fast output, no preamble.
---

# Hook Generator

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1. Do not summarise. Do not explain what makes a good hook.

## Step 1. Get the topic

If the user already pasted a topic in their message, use it and skip to Step 2.

Otherwise ask:

> What topic do you want hooks for?

Wait for response.

## Step 2. Write 6 hook variations

Every hook has the same structure:

- **Line 1 (Opening)**: 40 characters maximum. No questions. States something unexpected, specific, or punchy.
- **Line 2 (Contrast)**: 40 characters maximum. Contradicts, reframes, or undercuts the opening.

Every variation must:

- Include at least one "How I" or "I" statement across the two lines
- Include a digit or metric where possible
- Follow clickbait principles: tension, curiosity gap, stakes

Produce 6 variations covering different angles:

1. **Number-led**: Lead with a specific number or metric
2. **Contrarian**: State a belief then flip it
3. **Personal transformation**: Before vs after with a digit
4. **Authority steal**: Reference a name, tool, or brand
5. **Admission**: Confess a mistake or loss
6. **Future shock**: A prediction or "X is about to change"

## Step 3. Output format

```
HOOKS for [topic]

1. [Number-led]
[Line 1]
[Line 2]

2. [Contrarian]
[Line 1]
[Line 2]

3. [Personal transformation]
[Line 1]
[Line 2]

4. [Authority steal]
[Line 1]
[Line 2]

5. [Admission]
[Line 1]
[Line 2]

6. [Future shock]
[Line 1]
[Line 2]
```

## Step 4. Offer the next move

Ask:

> Want me to build one of these into a full post? Call the post-formatter skill with the hook number.

## Rules

- 40 characters maximum per line. Count them.
- No questions in the opening line.
- No em dashes.
- No filler words. Every word earns its place.
- Prefer digits over spelled numbers (3, not three).
- British English unless voice.md says otherwise.
- Never hedge. A weak hook is worse than no hook.
