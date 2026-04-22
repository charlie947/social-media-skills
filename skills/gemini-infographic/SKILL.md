---
name: gemini-infographic
description: >
  Generate the hand-drawn whiteboard infographic prompt that pulled 480k impressions across 3 posts. Takes source content (a post, newsletter, blog, research note) and returns a complete Gemini image generation prompt with a structured brief. Use this skill whenever the user says "whiteboard infographic", "gemini infographic", "hand-drawn graphic", "turn this into a whiteboard", or wants an AI-generated infographic for a post.
---

# Gemini Infographic

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1. Do not summarise the process.

## Step 1. Get the source content

Ask:

> Paste the content you want to turn into an infographic. A post, newsletter section, blog, research note, or raw bullet points all work.

Wait for the content.

## Step 2. Build the brief

Analyse the content and produce an infographic brief in plain language. Include:

- **Title** (6 words or fewer, punchy)
- **Subtitle** (optional, one line of context)
- **Core structure**: decide between steps, framework, comparison, stats, or list
- **Key points**: 3 to 7 bullets max, each 10 words or fewer
- **Visual suggestions**: arrows, boxes, highlighted numbers, icons, color accents. Be specific about placement and colour.
- **Footer CTA**: handwritten text reading "Follow [Name] [Tagline] for more helpful content | Repost ♻️"

Tell the user:

> Here is the brief. Tell me what to change, or say "generate" when you're happy.

Wait for approval.

## Step 3. Output the Gemini prompt

Once approved, output the full prompt in a code block, with the brief inserted into the `[INSERT YOUR INFOGRAPHIC CONTENT AND LAYOUT HERE]` placeholder:

```
Generate a single image of a physical, hand-drawn infographic on a large whiteboard or notebook page.

Crucial Style Instructions (Read First):

Medium: The image must look like a photograph of a real whiteboard or large paper notepad.

Texture: All elements must look created by hand using colored marker pens (black, blue, red, green) and highlighters (yellow/orange). Lines should be slightly imperfect, wobbly, and have the texture of ink on a surface.

No Digital Fonts: All text, headings, and bullet points must appear handwritten or hand-printed in marker pen.

Layout: Structure the 1080x1350 image as follows:

[INSERT THE BRIEF HERE — title, subtitle, core structure, key points, visual suggestions]

Use multi-colored markers for emphasis. Keep text large and legible. Make everything look hand-drawn with slight imperfections. Make it look like a photograph of an actual notebook page.

Always include the handwritten text "Follow [Name] [Tagline] for more helpful content | Repost ♻️" at the bottom of the image, in the same hand-drawn marker style.
```

Tell the user:

> Paste this into a new Gemini chat with Create Image enabled and Nano Banana selected. Generate at 1080x1350.

## Step 4. Offer iteration

After the prompt, offer:

> If the first generation misses, tell me what to adjust and I will rewrite the prompt. Common fixes: fewer colours, bigger title, different layout direction.

## Rules

- 1080x1350 pixel output is non-negotiable. Vertical format owns the LinkedIn feed.
- Footer CTA always includes the recycle symbol and "Repost".
- Never use em dashes in any output.
- Keep bullets under 10 words. Longer text loses legibility at the whiteboard scale.
- Always wait for user approval of the brief before outputting the final prompt.
- British English unless voice.md says otherwise.
- If the user has brand-kit.md or colours.md in the project, bake their brand colours into the visual suggestions.
