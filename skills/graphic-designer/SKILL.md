---
name: graphic-designer
description: >
  Create LinkedIn post graphics. Decides between an HTML/CSS structured graphic or an AI-generated infographic based on the post content. Use this skill whenever the user says "design a graphic", "create a visual", "make an image", "graphic for my post", "LinkedIn image", or wants any visual content to pair with a LinkedIn post. Also trigger when the user finishes writing a post and wants a matching graphic.
---

# Graphic Designer

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1. Do not summarise. Do not explain options. Start immediately.

## Step 1. Read the post

Check the project for the most recent post file. If found, read it. If not, say:

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
- 1200 x 1400 pixels (LinkedIn optimal)
- Dark background (#1a1a2e or user's brand colour) with high contrast text
- Clean sans-serif font (Inter, system-ui)
- White or light text on dark background
- One accent colour for highlights and dividers
- 40px minimum padding on all sides
- No stock photo backgrounds
- Let the post content dictate how many sections the graphic has. 3 steps = 3 blocks. 10 tips = 10 blocks. The constraint is legibility, not a fixed number. Every element must be large enough to read on a mobile screen.

Single self-contained HTML file with inline CSS. Include viewport meta tag.

Extract the core framework or steps from the post. Do not copy the full post. Distil into:
- A short headline (5 to 8 words)
- Key points as visual blocks (Unicode icons fine)
- Footer with author name from about-me.md if available

Save the HTML file. Tell the user:

> Open the HTML in your browser and screenshot it.

## Path B: Image generation prompt

The graphic must recap the post content visually. It is not an abstract illustration or stock photo. It summarises the key information from the post in a visual format the reader can scan.

First, extract the content for the infographic from the post:
- The main headline or hook (shortened to 5 to 10 words)
- 3 to 6 key points, steps, or takeaways (one short line each)
- Any numbers, stats, or data worth highlighting
- A footer line (author name and CTA if appropriate)

Then build the prompt based on the chosen style.

### Style 1: Whiteboard infographic

Use this prompt template. Fill in the content sections from the post.

```
Generate a single image of a physical, hand-drawn infographic on a large whiteboard or notebook page.

Crucial Style Instructions (Read First):
Medium: The image must look like a photograph of a real whiteboard or large paper notepad.
Texture: All elements must look created by hand using colored marker pens (black, blue, red, green) and highlighters (yellow/orange). Lines should be slightly imperfect, wobbly, and have the texture of ink on a surface.
No Digital Fonts: All text, headings, and bullet points must appear handwritten or hand-printed in marker pen.

Layout: Structure the 1080x1350 image as follows:

TITLE (large, bold marker, top of page):
[Insert headline from the post]

CONTENT (hand-drawn sections with marker pen):
[Insert 3 to 6 key points, each as a short hand-written line with a bullet, number, or small icon drawn next to it]

[If there are stats or numbers, draw them large with a circle or box around them]

Use multi-colored markers for emphasis. Keep text large and legible. Make everything look hand-drawn with slight imperfections. Make it look like a photograph of an actual notebook page.

Always include the handwritten text "[Author name from about-me.md] | Repost" at the bottom of the image, in the same hand-drawn marker style.
```

### Style 2: Branded infographic

Ask the user for brand colours if not already known. If about-me.md exists, check there first.

```
Generate a professional infographic image at 1080x1350 pixels.

Style: Clean, modern, editorial. Flat design with sharp edges and strong typography. No 3D effects, no gradients, no stock photos.

Colour palette:
- Background: [primary brand colour or dark neutral]
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

Keep text large and scannable. Maximum 40 words on the entire image. No decorative borders. No watermarks. No logos unless the user provides one.
```

Output the complete prompt in a code block. Tell the user:

> Paste this into Gemini or your image generator. The prompt is ready to go.

## After either path

Say:

> Graphic ready. Say "score my post" when you want feedback before publishing.

## Rules

- Always read the post before designing. The graphic must recap the post content, not illustrate an abstract concept.
- Structured graphics (Path A) must be a single HTML file with inline CSS.
- Image prompts (Path B) must be fully self-contained. The user pastes it cold into Gemini and gets the graphic.
- Extract and distil the post content into the graphic. No copying the full post text.
- Whiteboard style: always hand-drawn marker look, imperfect lines, coloured pens, notebook/whiteboard texture.
- Branded style: always clean, flat, modern, using the user's brand colours.
- Never use em dashes in any output.
- British English throughout.
