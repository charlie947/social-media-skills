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

Then ask the user about their content pillars. If your agent has an interactive multiple-choice tool (for example Claude's `AskUserQuestion`), use it; otherwise ask in chat with the same options:

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

## Step 3. Output (surface-aware)

Pick the output mode based on the capabilities your agent has. Do not output the table in a fenced markdown code block — that renders as monospace plain text and makes a 5×8 grid hard to scan.

- **Agent can render interactive charts or tables (e.g. a chat surface with widget support):** render the matrix as an interactive chart / interactive table widget. Pillars as rows, formats as columns, each cell holding one specific headline. The user should be able to click a cell to see the full headline and any expansion notes. Do not also dump the table as markdown — the widget is the deliverable.
- **Agent can write files (has file-system or write/edit tools):** save the matrix to `content-matrix-YYYY-MM-DD.md` in the current working directory and print the same table inline in the response as a plain markdown table (no triple-backtick wrap). Confirm the file path so the user can open it.
- **Fallback (no interactive widget, no file-system tools):** output a plain markdown table inline. Still no code-fence wrap.

Below the table or chart, add one sentence naming the single strongest idea across the matrix and why.

## Step 4. Offer the next move

Ask:

> Any cell here you want me to write as a full post? Reference the cell by pillar + format (for example "Hooks × Contrarian") and I will hand it to the post-writer or post-formatter skill.

If your agent can write files, also offer to append the drafted post into the same `content-matrix-YYYY-MM-DD.md` file under the cell reference.

## Rules

- Minimum 3 pillars, maximum 5. More than 5 dilutes the matrix.
- Every cell idea must be specific to that pillar AND that format. Do not reuse the same idea across pillars.
- Tune the language to the user's voice if voice.md exists.
- British English unless voice.md specifies American.
- Never use em dashes.

## Dopa integration (optional)

Additive layer for Dopa users. Skip it if you run this on Claude or any other agent: the skill works unchanged without it.

- `analyze_campaigns` — rank the matrix cells by which pillars and formats have performed for the tenant, so the "single strongest idea" call in Step 3 is data-backed rather than a guess.
