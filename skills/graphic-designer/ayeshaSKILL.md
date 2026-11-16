---
name: graphic-designer
description: >
  Create LinkedIn post graphics. Decides between an HTML/CSS structured graphic or an AI-generated infographic based on the post content. Use this skill whenever the user says "design a graphic", "create a visual", "make an image", "graphic for my post", "LinkedIn image", or wants any visual content to pair with a LinkedIn post. Also trigger when the user finishes writing a post and wants a matching graphic.
---

# Graphic Designer

## Codex and Claude runtime

- Use this skill in Codex or Claude with the tools actually available in the current task. `AskUserQuestion` examples describe the questions, not a required API: use an available question tool within its limits, or ask in chat. Reuse answers and source material already supplied.
- Work in the user-selected project. Read its `about-me.md`, `voice.md` and relevant brand files before personalised work. Confirm the intended author if files conflict or contain starter defaults. Ask for missing facts or run `voice-builder`; never inherit the maintainer's identity, accounts or private files.
- Resolve bundled `references/` relative to this skill folder. For an explicitly requested profile refresh, read and update the canonical `about-me.md`, `voice.md` or `newsletter-voice.md` in place, preserving unrelated user facts and rules. Consumers must reread those canonical files. Use a new filename only for new deliverables that would collide with unrelated existing files. Installation alone never starts an interview or writes files. Do not write persistent learnings unless requested.
- Use supplied evidence first. Verify external claims through available search/source tools when needed. If a source or integration is unavailable, name the missing capability and offer supplied text/export input. Never invent facts, first-person experience, metrics or a successful tool run.
- Connect only services needed for the chosen route through the user's existing account. Never print credentials or overwrite connections. Drafting, saving and reviewing do not authorise publishing, sending messages or changing accounts.

## Visual completion state

This skill's image prompts are **prompt-ready**, not generated or visually reviewed assets. Keep its named Gemini workflow unless the user requests another generator. A missing image service does not block writing a prompt. When images are supplied or generated, open and inspect each export at full size and feed size (about 360px wide, 320px for thumbnails). Check exact copy, dimensions, clipping, legibility, brand colours, font appearance, logos and reference fidelity. Fix and re-inspect failed exports. Record any unavailable export or inspection as pending. An image prompt or raster export is not an editable design file.

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1. Do not summarise. Do not explain options. Start immediately.

## Step 1. Read the post

Use the supplied post or exact file named by the user. If only project drafts exist, confirm which one is intended before using it. Otherwise say:

> Paste the post you want a graphic for.

Wait for the post, then call AskUserQuestion:

```json
[
  {
    "question": "What type of graphic fits this post best?",
    "header": "Style",
    "multiSelect": false,
    "options": [
      {"label": "HTML/CSS graphic", "description": "Clean structured layout. Framework, comparison, steps, data. Fully editable, screenshot to export."},
      {"label": "Whiteboard infographic", "description": "Hand-drawn marker style on a whiteboard or notebook page. Recaps the post visually. Generated in Gemini."},
      {"label": "Branded infographic", "description": "Professional infographic using your brand colours. Recaps the post visually. Generated in Gemini."},
      {"label": "You decide", "description": "Analyse the post and pick the best format automatically"}
    ]
  }
]
```

If "You decide": analyse the post. If it contains numbered steps, frameworks, comparisons, or data tables, go Path A (HTML/CSS). If it recaps a workflow, shares tips, teaches a concept, or tells a story, go Path B (image prompt) and pick whichever style fits better.

## Path A: HTML/CSS structured graphic

Design constraints:
Two styles, nothing else

-Twilight (default, 4 posts a week)Background gradient at 155°: #E4D7FF (lilac) → #F3DDF1 (pink) → #FFE6D6 (peach)Accent (D++ “++”, question line, key number, main bar): #6B3FD0Secondary bar / highlight: #B98CFFText: #1E2130; small text and sources: #5A6270Data card: white at about 78% opacity, white border, rounded corners
-Electric violet (1 big post a week: a headline number or an announcement)Gradient at 150°: #3A1FB8 → #7B3FF2 → #E86FC1All text white; highlight color #FFE27A (yellow)Card: white at about 12% opacity with a thin white border
-No dark navy backgrounds, no decorative circles or half-moons, no other colors.

Layout (same on every post)
-Size: 1080 × 1350 (4:5 portrait, which takes up more of the mobile feed than a square)
-Margins: 90 px on all sides
-Top to bottom:D++ logo, top leftA short question in purple (the hook)Headline, max 2 linesWhite data card (numbers, bars or 3 short points)A UAE line at the bottom of the card whenever the stat is globalFooter: source on the left, dplpl.com on the right
-Font: Space Grotesk only. Headline about 84–96 px, bold. Numbers 56 px or bigger. Body text 30–34 px. Nothing smaller than 22 px, so it’s readable on a phone.

Carousels (for longer stories, like the “strategy is right” post)
-Same Twilight background on every slide, one idea per slide, headline at least 60 px
-Slide 1 = hook, last slide = takeaway + “Follow D++ for more”
-5–7 slides max


- Let the post content dictate how many sections the graphic has. 3 steps = 3 blocks. 10 tips = 10 blocks. The constraint is legibility, not a fixed number. Every element must be large enough to read on a mobile screen.

Single self-contained HTML file with inline CSS. Include viewport meta tag.

Extract the core framework or steps from the post. Do not copy the full post. Distil into:
- A short headline (5 to 8 words)
- Key points as visual blocks (Unicode icons fine)
- Footer with author name from about-me.md if available

Save the HTML and export a PNG using the available browser screenshot or existing local renderer. Wait for fonts and images to load. Open the actual PNG at full resolution and at 360px feed width; inspect headline, every item, clipping, contrast, fonts and attribution. Fix the HTML and re-export until those checks pass. Preserve the editable HTML alongside the inspected PNG. If browser/render access is unavailable, return the HTML as **render pending**, name the missing capability and give the user the browser screenshot step. Never call unrendered HTML visually verified.

## Path B: Image generation prompt

The graphic must recap the post content visually. It is not an abstract illustration or stock photo. It summarises the key information from the post in a visual format the reader can scan.

First, extract the content for the infographic from the post:
- The main headline or hook (shortened to 5 to 10 words)
- All required key points, steps or takeaways in the requested order. Aim for concise lines; propose a split if accurate content will not fit.
- Any numbers, stats, or data worth highlighting
- A footer line (author name and CTA if appropriate)

Then build the prompt based on the chosen style.

### Style 1: Whiteboard infographic

Use this prompt template. Fill in the content sections from the post.

```
Generate a single image of a physical, hand-drawn infographic on a large whiteboard or notebook page.

Crucial Style Instructions (Read First):
Medium: The image must look like a photograph of a real whiteboard or large paper notepad.
Texture: All elements must look created by hand using colored marker pens (twilight theme, or electric violet theme) and highlighters (yellow/orange). Lines should be slightly imperfect, wobbly, and have the texture of ink on a surface.
No Digital Fonts: All text, headings, and bullet points must appear handwritten or hand-printed in marker pen.

Layout: Structure the 1080x1350 image as follows:

TITLE (large, bold marker, top of page):
[Insert headline from the post]

CONTENT (hand-drawn sections with marker pen):
[Insert 3 to 6 key points, each as a short hand-written line with a bullet, number, or small icon drawn next to it]

[If there are stats or numbers, draw them large with a circle or box around them]

Use multi-colored markers for emphasis. Keep text large and legible. Make everything look hand-drawn with slight imperfections. Make it look like a photograph of an actual notebook page.

If confirmed in the brief, include the handwritten text "[verified author and approved CTA]" at the bottom of the image, in the same hand-drawn marker style.
```

### Style 2: Branded infographic

Ask the user for brand colours if not already known. If about-me.md exists, check there first.

```
Generate a professional infographic image at 1080x1350 pixels.

Style: Clean, modern, editorial. Flat design with sharp edges and strong typography. No 3D effects, no gradients, no stock photos.

Colour palette:
- Background: [twilight theme, or electic blue]
- Text: [white or high-contrast colour]
- Accent: [secondary brand colour]

Layout:
HEADLINE (top, large bold text):
[Insert headline from the post]

BODY (structured sections, each with an icon or number):
[Insert 3 to 6 key points as short lines, each with a visual marker: numbered circle, checkmark, or simple icon]

[If there are stats, display them as large feature numbers with a label underneath]

FOOTER:
[Author name from about-me.md] | [CTA or tagline if appropriate]

Keep text large and scannable. Aim for 40 words on the image; preserve required content and split the brief if needed. No decorative borders. No watermarks. No logos unless the user provides one.
```

Output the complete prompt in a code block. Tell the user:

> Paste this into Gemini or your image generator. The prompt is ready to go.

## After either path

Report the actual state: **HTML render pending**, **HTML + inspected PNG**, or **Gemini prompt-ready**. Link the files that actually exist. List any unresolved visual defects. Post scoring reviews copy and does not substitute for image inspection.

## Rules

- Always read the post before designing. The graphic must recap the post content, not illustrate an abstract concept.
- Structured graphics (Path A) must be a single HTML file with inline CSS.
- Image prompts (Path B) must be fully self-contained. The user pastes it cold into Gemini and gets the graphic.
- Extract and distil the post content into the graphic. No copying the full post text.
- Whiteboard style: always hand-drawn marker look, imperfect lines, coloured pens, notebook/whiteboard texture.
- Branded style: always clean, flat, modern, using the user's brand colours.
- Never use em dashes in any output.
- American English throughout.
