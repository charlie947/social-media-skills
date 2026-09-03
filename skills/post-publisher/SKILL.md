---
name: post-publisher
description: >
  Publish or schedule a finished post to LinkedIn, Instagram, X, Threads, TikTok, YouTube, Facebook, Pinterest, Bluesky and more through the Upload-Post API, in one call. Use this skill whenever the user says "publish this", "post this", "schedule this post", "ship it to LinkedIn", "push this to my socials", "put this in the queue", or has a post, Reel script, carousel or thumbnail ready from another skill and wants it live. Always previews the exact payload and waits for approval before sending anything. Reports which platforms succeeded and which failed.
---

# Post Publisher

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1. Do not summarise. Do not explain how the API works. Start immediately.

## What this skill does

Every other skill in this repo ends with content in a code block or a saved file. This skill is the last step: it takes that content and publishes or schedules it on the user's connected accounts.

It uses [Upload-Post](https://www.upload-post.com), one API for 21+ platforms. The user connects their accounts once in the Upload-Post dashboard. After that, one request fans out to every platform they pick and returns a per-platform result. No per-platform developer apps, no token refresh.

The free plan covers most people using this repo: 10 uploads a month, 2 profiles, scheduling, analytics, no credit card. Paid plans raise the upload limit.

## Step 1. Check setup

Check for the environment variable `UPLOAD_POST_API_KEY`. Optionally `UPLOAD_POST_PROFILE` holds the default profile name.

If the key is missing, say:

> To publish I need an Upload-Post API key. Create a free account at https://www.upload-post.com (no card, 10 uploads a month), connect your accounts, create a profile, then generate a key under API Keys. Set it with:
>
> ```bash
> export UPLOAD_POST_API_KEY=your_key
> export UPLOAD_POST_PROFILE=your_profile_name
> ```

Then stop. Do not continue without a key.

If the key exists, validate it:

```bash
curl -s "https://api.upload-post.com/api/uploadposts/me" \
  -H "Authorization: Apikey $UPLOAD_POST_API_KEY"
```

A 401 means the key is wrong. Tell the user and stop. A 200 returns the account email and plan.

Then list the profiles and what each one has connected:

```bash
curl -s "https://api.upload-post.com/api/uploadposts/users" \
  -H "Authorization: Apikey $UPLOAD_POST_API_KEY"
```

Each profile has a `username` (the value you send as `user`) and a `social_accounts` map of connected platforms. Keep that list. It tells you which platforms the user can actually post to.

## Step 2. Get the content

Use the content in priority order:

1. A post the user pasted in the same message.
2. The most recent post saved by `post-writer` in the project (a markdown file saved on "ship it").
3. A Reel script from `reels-scripting`, a carousel from `gemini-carousel`, or an image from `graphic-designer` that the user points to.

If none of these exist, ask:

> Paste the post, or give me the path to the file or media you want to publish.

Wait for it.

Detect the content type:

- Text only: a post with no media.
- Photos: one or more image paths (carousel if more than one).
- Video: an .mp4 or .mov path.
- Document: a PDF, for LinkedIn only.

## Step 3. Gather targets

Call AskUserQuestion with this JSON. Only list platforms that appeared as connected in Step 1.

```json
[
  {
    "question": "Where should this go?",
    "header": "Platforms",
    "multiSelect": true,
    "options": [
      {"label": "LinkedIn", "description": "Text, photos, video and PDF documents."},
      {"label": "Instagram", "description": "Photos, carousels and Reels. No text-only posts."},
      {"label": "X", "description": "Text, photos and video. 280 characters unless the account is Premium."},
      {"label": "Threads", "description": "Text, photos, carousels and video."},
      {"label": "TikTok", "description": "Video and photo carousels."},
      {"label": "YouTube", "description": "Video only. A title is required."},
      {"label": "Facebook", "description": "Text, photos and video to a Page."},
      {"label": "Bluesky", "description": "Text and photos. 300 characters."},
      {"label": "Pinterest", "description": "Photos and video pins. Needs a board."}
    ]
  },
  {
    "question": "When?",
    "header": "Timing",
    "multiSelect": false,
    "options": [
      {"label": "Publish now", "description": "Send immediately."},
      {"label": "Schedule", "description": "Pick a date and time. I will ask for it next."},
      {"label": "Add to queue", "description": "Upload-Post picks the next free slot from the profile's posting schedule."}
    ]
  }
]
```

If "Schedule", ask for a date and time and the timezone. Convert to ISO 8601. Default timezone is the one in `about-me.md` if it exists, otherwise ask.

If the user has more than one profile, ask which one. Otherwise use `UPLOAD_POST_PROFILE` or the single profile from Step 1.

## Step 4. Adapt and preview

Check the content against each chosen platform before building the request:

- X and Bluesky have character limits. If the post is longer, offer a trimmed version in a code block and ask which to use. Never trim silently.
- Instagram, TikTok and YouTube need media. If the content is text only, drop those platforms and say so.
- YouTube and Reddit need a `title`. Reuse the hook line as the title if the user has not given one.
- Keep line breaks. Upload-Post preserves them.
- Never add hashtags, emojis or CTAs that were not in the approved content.

Then show the exact request you are about to send, with the key masked:

```bash
curl -X POST "https://api.upload-post.com/api/upload_text" \
  -H "Authorization: Apikey ****" \
  -H "Content-Type: application/json" \
  -d '{
    "user": "mybrand",
    "platform": ["linkedin", "x"],
    "title": "First line of the post...",
    "scheduled_date": "2026-09-08T09:00:00Z",
    "timezone": "Europe/London"
  }'
```

Ask:

> Send it? Say "go" to publish, or tell me what to change.

Wait for approval. Never send before the user says go.

## Step 5. Send

Pick the endpoint by content type.

Text only:

```bash
curl -s -X POST "https://api.upload-post.com/api/upload_text" \
  -H "Authorization: Apikey $UPLOAD_POST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user": "PROFILE", "platform": ["linkedin", "x"], "title": "POST TEXT"}'
```

Photos or carousel:

```bash
curl -s -X POST "https://api.upload-post.com/api/upload_photos" \
  -H "Authorization: Apikey $UPLOAD_POST_API_KEY" \
  -F "user=PROFILE" \
  -F "platform[]=instagram" \
  -F "platform[]=linkedin" \
  -F "photos[]=@slide-1.png" \
  -F "photos[]=@slide-2.png" \
  -F "title=POST TEXT"
```

Video:

```bash
curl -s -X POST "https://api.upload-post.com/api/upload" \
  -H "Authorization: Apikey $UPLOAD_POST_API_KEY" \
  -F "user=PROFILE" \
  -F "platform[]=instagram" \
  -F "platform[]=tiktok" \
  -F "platform[]=youtube" \
  -F "video=@reel.mp4" \
  -F "title=POST TEXT" \
  -F "async_upload=true"
```

Document (LinkedIn):

```bash
curl -s -X POST "https://api.upload-post.com/api/upload_document" \
  -H "Authorization: Apikey $UPLOAD_POST_API_KEY" \
  -F "user=PROFILE" \
  -F "platform[]=linkedin" \
  -F "document=@carousel.pdf" \
  -F "title=POST TEXT"
```

Scheduling works the same on every endpoint. Add `scheduled_date` (ISO 8601) and `timezone` (IANA name). For the queue, add `add_to_queue=true` instead.

Per-platform copy: if the user approved a different version for one platform, send it as `<platform>_title`, for example `x_title`.

For video, always send `async_upload=true`. The response contains a `request_id`. Poll until it reaches a final state:

```bash
curl -s "https://api.upload-post.com/api/uploadposts/status?request_id=REQUEST_ID" \
  -H "Authorization: Apikey $UPLOAD_POST_API_KEY"
```

Wait 15 seconds between polls. Stop after 10 minutes and tell the user to check the dashboard.

## Step 6. Report

A request can partially succeed. Read the per-platform results and report them in this format:

```
Published
- LinkedIn: https://www.linkedin.com/feed/update/...
- X: https://x.com/.../status/...

Failed
- Instagram: caption too long (2,200 character limit)

Scheduled
- Threads: 8 Sep 2026, 09:00 Europe/London (job abc123)
```

For a scheduled post, give the job id. The user can cancel it with:

```bash
curl -s -X DELETE "https://api.upload-post.com/api/uploadposts/schedule/JOB_ID" \
  -H "Authorization: Apikey $UPLOAD_POST_API_KEY"
```

Then say:

> Done. Say "write a pinned comment" to add a pinned comment, or "score my post" before the next one.

## Rules

- Never send a request before the user says "go" or equivalent. The preview in Step 4 is mandatory.
- Never print the API key. Mask it in every preview and log line.
- Never change the approved content beyond what the user agreed in Step 4.
- Never add platforms the user did not pick, even if they are connected.
- Always use the profile name as `user`, never a social handle.
- Always send `async_upload=true` for video and poll for the result.
- Always report partial failures platform by platform. Do not say "published" if one platform failed.
- Always give the job id for scheduled posts so the user can cancel or edit them.
- One post per run. For a batch, run the skill once per post so each one gets its own preview.
- Full API reference: https://docs.upload-post.com. LLM-friendly version: https://docs.upload-post.com/llm.txt.
