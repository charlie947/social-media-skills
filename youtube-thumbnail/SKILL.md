---
name: youtube-thumbnail
description: >
  Generate a branded YouTube thumbnail from a video title. Uses a reference photo of the creator, high-CTR thumbnail principles, and brand colours to produce a ready-to-generate image prompt for Gemini. Use this skill whenever the user says "thumbnail", "youtube thumbnail", "build me a thumbnail", or wants a video cover image before writing the script. The thumbnail-first workflow mirrors the graphic-first approach for LinkedIn: sells the video before anyone hears a word of the script.
---

# YouTube Thumbnail

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1.

## Step 1. Gather inputs

Check the project for a reference photo config. Look in this order:

1. `thumbnail-config.md` in the project root
2. `brand-kit.md` — look for a reference image path and brand colours
3. `about-me.md` — for the creator's name and positioning

If a reference photo path is stored, pre-fill it. Otherwise ask:

> Upload or provide the path to the reference photo of yourself you want used in the thumbnail. Ideally a clear headshot with distinctive lighting and expression you plan to reuse across videos for brand consistency.

Then call AskUserQuestion:

```json
[
  {
    "question": "What is the video title?",
    "header": "Title",
    "multiSelect": false,
    "options": [
      {"label": "I will type the title", "description": "Type the full working title"},
      {"label": "Suggest one", "description": "Given the topic, propose 3 click-worthy titles first"}
    ]
  },
  {
    "question": "Emotional tone?",
    "header": "Tone",
    "multiSelect": false,
    "options": [
      {"label": "Shock / surprise", "description": "Wide eyes, open mouth, bold reaction"},
      {"label": "Curious / thinking", "description": "Slight smirk, raised eyebrow, gaze off-frame"},
      {"label": "Confident / direct", "description": "Eye contact, calm, assertive"},
      {"label": "Frustrated / strong take", "description": "Intense gaze, hand gesture, tension"}
    ]
  }
]
```

## Step 2. Apply thumbnail best practices

Every thumbnail must follow these rules:

- **Face fills 30 to 50 percent** of the frame. Readable at small sizes.
- **3 to 5 words maximum** of large text. 6 if absolutely necessary.
- **Two colours dominate**. Brand primary + one high-contrast accent (yellow, red, cyan work well).
- **One clear focal element** besides the face. Tool logo, bold number, arrow, or prop.
- **High contrast** between face, text, and background. Test by squinting.
- **Text is not a sentence**. It is a hook phrase. Examples: "I fired my team", "Claude can now...", "Don't do this".
- **No small text, no logos bottom-right** (watch time icon sits there).

## Step 3. Build the thumbnail brief

Output a concise brief the user can review:

```
THUMBNAIL BRIEF: [video title]

Composition: [face position, % of frame, direction of gaze]
Text: "[hook phrase, 3-5 words]"
Text placement: [left, right, top, wraps around face]
Colour palette: [primary hex], [accent hex], [background hex]
Supporting element: [logo / prop / arrow / number]
Emotional tone: [tone from Step 1]
```

Then ask:

> Here's the brief. Say "generate" to output the image prompt or tell me what to change.

## Step 4. Output the Gemini prompt

Once approved, output the image generation prompt in a code block:

```
Using the attached reference photo of me, generate a YouTube thumbnail at 1280 x 720 pixels (16:9).

Composition:
- Place me [left / right / centre] filling [30-50]% of the frame
- My expression: [tone details — e.g., shocked with wide eyes and open mouth]
- My gaze: [direction — e.g., looking directly at camera / looking off-frame toward the text]

Text:
- Display "[hook phrase]" in large bold sans-serif typography
- Text colour: [hex]
- Text outline: [colour, thickness for readability]
- Text placement: [specific area]

Colour palette:
- Primary: [hex]
- Accent: [hex]
- Background: [hex] — [describe treatment: flat, gradient, blurred scene, etc.]

Supporting element: [specific description of the supporting visual]

Constraints:
- Face must be clear and sharp
- Text must be readable at 320px wide (YouTube mobile size)
- No watermarks, no YouTube UI elements, no bottom-right corner text
- High contrast between face, text, and background
```

Tell the user:

> Paste this into a new Gemini chat, attach your reference photo, enable Create Image, and select Nano Banana. Generate at 1280x720.

## Step 5. Offer the next move

> Want me to outline the video next? Hook, mid, CTA from the thumbnail. Or call the create skill if you have one.

## Rules

- 1280x720 pixels (16:9). YouTube's native thumbnail size.
- Never include the reference photo path in the prompt itself — the user attaches the photo separately.
- Never allow more than 6 words of text, 5 is ideal, 3 is best.
- Face must always be a visible focal point. No face-hidden compositions.
- Never use em dashes.
- British English unless voice.md specifies otherwise.
- If brand-kit.md is in the project, read it and use exact brand colours.
- Recommend the user keep a consistent thumbnail style across videos for channel recognition.
