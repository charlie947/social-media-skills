---
name: content-matrix
description: >
  Generate 32+ LinkedIn post ideas in a single table by pairing the user's content pillars with 8 proven content formats. Based on the Justin Welsh content matrix. Use this skill whenever the user says "give me post ideas", "content matrix", "what should I post about", "generate post ideas", "content ideation", or "map out my content for the month". Pulls from about-me.md and voice.md if they exist, otherwise asks for pillars and context.
---

# Content Matrix

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1. Do not summarise. Start input gathering immediately.

## Step 1. Gather inputs

Check the project for about-me.md. If it exists, read it and pre-fill the description of who the user is. Skip that question and tell the user what you pulled.

If about-me.md is missing, ask:

> Give me at least two paragraphs describing who you are, what you do, and what you like to discuss. The more specific you are, the more relevant the ideas.

Wait for response.

Then call AskUserQuestion:

```json
[
  {
    "question": "What are your content pillars?",
    "header": "Pillars",
    "multiSelect": false,
    "options": [
      {"label": "I will type them", "description": "I have 3 to 4 content pillars to use"},
      {"label": "Pull from voice.md", "description": "Use the topics already defined in my voice files"},
      {"label": "Suggest them for me", "description": "Based on my about-me.md, recommend 4 pillars"}
    ]
  }
]
```

If the user types their own, accept 3 to 5 pillars. If fewer than 3, ask for more.

If the user picks "Suggest them for me", read about-me.md, propose 4 pillars covering their positioning, and ask them to confirm or edit before continuing.

## Step 2. Build the matrix

Generate a markdown table with:

- X axis (columns): 8 content formats, always in this order:
  1. Actionable
  2. Motivational
  3. Analytical
  4. Contrarian
  5. Observation
  6. X vs Y
  7. Present vs Future
  8. Listicle
- Y axis (rows): the user's 3 to 5 pillars

Every cell contains one specific, concrete post idea tailored to the pillar and format. Not generic. Not reusable across pillars.

Format definitions to apply when filling each cell:

- **Actionable**: Ultra-specific how-to. Teaches the reader to do one thing.
- **Motivational**: Inspirational story about someone who did something extraordinary in the niche.
- **Analytical**: Breakdown of why something works the way it does.
- **Contrarian**: Go against the common advice in the niche and back it up.
- **Observation**: A hidden, silent, or underdiscussed trend the user has noticed.
- **X vs Y**: Compare two entities (tools, styles, frameworks, companies).
- **Present vs Future**: Current state vs a specific prediction, with the why.
- **Listicle**: A list of resources, tips, mistakes, lessons, or steps.

Each cell's idea should be a specific headline, not a theme. Good: "The 3-line hook formula I stole from David Ogilvy". Bad: "Hooks".

## Step 3. Output

Output the full table in a markdown code block so the user can copy it into Notion.

Below the table, add one sentence naming the single strongest idea across the matrix and why.

## Step 4. Offer the next move

Ask:

> Any cell here you want me to write as a full post? Call the post-writer or post-formatter skill with the cell reference.

## Rules

- Minimum 3 pillars, maximum 5. More than 5 dilutes the matrix.
- Every cell idea must be specific to that pillar AND that format. Do not reuse the same idea across pillars.
- Tune the language to the user's voice if voice.md exists.
- British English unless voice.md specifies American.
- Never use em dashes.
