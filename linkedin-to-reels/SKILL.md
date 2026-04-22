---
name: linkedin-to-reels
description: Repurpose top LinkedIn posts into Instagram Reel scripts. Scrapes LinkedIn posts via Apify, ranks by engagement, scrapes competitor Reels to find trending topics, reverse-engineers patterns, writes Reel scripts, and generates a tracker. Use when the user wants to turn LinkedIn content into Instagram Reels.
disable-model-invocation: false
user-invocable: true
argument-hint: [linkedin-profile-url]
allowed-tools: Read, Grep, Bash(node *), Bash(mkdir *), Bash(open *), Bash(npm *)
---

# LinkedIn to Reels

Repurpose top-performing LinkedIn posts into trend-aligned Instagram Reel scripts.

## Prerequisites

- **APIFY_TOKEN** must be set as an environment variable
- **Node.js** installed (v18+)
- The `apify-client` npm package (installed automatically if missing)

If APIFY_TOKEN is not set, ask the user to run: `! export APIFY_TOKEN=their_token_here`

## Arguments

- `$0` — LinkedIn profile URL (required). Example: `https://www.linkedin.com/in/charlie-hills/`

If no argument is provided, ask for the LinkedIn profile URL before proceeding.

## Workflow

Run these steps in order. Confirm the output of each step before moving to the next.

### Step 1: Set up workspace

Create the output directory and install dependencies:

```
mkdir -p ~/Desktop/Reels
cd ~/Desktop/Reels
npm init -y
npm install apify-client
```

### Step 2: Scrape LinkedIn posts

Write and run a Node.js script (`~/Desktop/Reels/scrape-posts.js`) that:

1. Uses the `apify-client` package to call actor `harvestapi/linkedin-profile-posts`
2. Input: `{ profileUrls: [$0], postsLimit: 20 }`
3. Saves raw JSON to `~/Desktop/Reels/raw-posts.json`
4. Field mapping for this actor:
   - Post text: `item.content`
   - Reactions: `item.engagement.likes`
   - Comments: `item.engagement.comments`
   - Shares: `item.engagement.shares`
   - Date: `item.postedAt.date`
   - URL: `item.linkedinUrl`
5. Ranks posts by `reactions + comments` descending
6. Picks the top 5
7. Saves `~/Desktop/Reels/top-5-summary.md` with a table and full text of each
8. Saves `~/Desktop/Reels/top-5.json`

Present the top 5 to the user with rank, engagement, and first line of each post.

### Step 3: Ask for Instagram details

Ask the user:

1. Their Instagram profile URL or handle
2. A list of competitor Instagram handles in their niche (as many as they want)

### Step 4: Scrape the user's own Reels

Write and run a script (`~/Desktop/Reels/scrape-reels.js`) that:

1. Calls actor `apify/instagram-reel-scraper`
2. Input: `{ username: ['handle'], resultsLimit: 10 }`
3. Field mapping:
   - Caption: `item.caption`
   - Views: `item.views` or `item.videoViewCount`
   - Likes: `item.likesCount`
   - Comments: `item.commentsCount`
   - Duration: `item.videoDuration`
   - Date: `item.timestamp`
   - URL: `item.url` or construct from `item.shortCode`
4. Ranks by views descending
5. Saves `~/Desktop/Reels/reels-analysis.md` with a table of all 10 and full breakdowns of the top 3
6. Saves `~/Desktop/Reels/ranked-reels.json`

### Step 5: Reverse-engineer Reel patterns

Analyse the user's top 3 performing Reels. Write `~/Desktop/Reels/pattern-analysis.md` covering:

- **Hook patterns**: How do the top Reels open? Brand names, numbers, provocative statements?
- **Structure patterns**: Duration, pacing, number of points
- **CTA patterns**: Comment triggers, follow CTAs, link-in-bio?
- **Content type**: Tutorial, showcase, personal story, listicle?

Distil into 3-5 concrete rules to apply to the new scripts.

### Step 6: Scrape competitor Reels

Write and run a script (`~/Desktop/Reels/scrape-competitors.js`) that:

1. Calls `apify/instagram-reel-scraper` with all competitor usernames in one batch
2. Input: `{ username: [array of handles], resultsLimit: 5 }` (5 per account)
3. Filters results to the last 7 days only
4. Ranks by views descending, picks top 20
5. Saves `~/Desktop/Reels/competitor-trends.md` with a table and full captions
6. Saves `~/Desktop/Reels/top-20-trending.json`

### Step 7: Write Reel scripts

For each of the top 5 LinkedIn posts, create a script file `~/Desktop/Reels/reel-N-[slug].md`:

**Structure:**
```
# Reel: [Title]

## Original LinkedIn post (X reactions, Y comments)
"[first line]" — DD/MM/YYYY

## Patterns applied
[Which patterns from Step 5 were used]

---

## Script (~30-40 seconds)

### HOOK (0-3s)
[Pattern interrupt. Under 5 seconds. Lead with a brand name + specific number where possible.]

### KEY POINT 1 (3-15s)
[Core insight from the original post]

### KEY POINT 2 (15-25s)
[Supporting point or actionable takeaway]

### CTA (25-35s)
[Comment-trigger keyword + promised deliverable, if that pattern applies]

---

**Visual notes:** [Suggested visuals, cuts, text overlays]
```

**Writing rules:**
- British English throughout
- Short sentences. No em dashes. No semicolons.
- Never use: "leverage", "deep dive", "unlock", "game-changer", "groundbreaking", "tapestry", "landscape", "notably", "furthermore"
- Conversational tone. Natural sentences, not staccato fragments.
- Target 30-40 seconds duration
- 2 key points, not 3 (tighter pacing)
- One core idea per script

### Step 8: Cross-reference with trends

Write `~/Desktop/Reels/trend-crossref.md` that:

1. Compares each of the 5 scripts against the top 20 trending competitor Reels
2. Flags topic overlaps (strong / moderate / low)
3. Assigns a priority order (1-5) based on trend alignment
4. Explains why each script ranks where it does
5. Includes bonus observations from the competitor data

### Step 9: Build the tracker

Create `~/Desktop/Reels/tracker.html` — a single-file HTML tracker with:

- Dark theme UI
- One row per script, sorted by trend priority
- Columns: Priority (#), Script title, Hook, Trend overlap badge, Status dropdown (To record / Recorded / Posted), Post date picker, Notes (editable textarea)
- Pre-fill notes with trend overlap insights
- Auto-save to localStorage on every change
- Open the file in the browser when done

### Step 10: Present results

Summarise to the user:
- Top 5 LinkedIn posts selected and why
- Key patterns found in their existing Reels
- Priority order based on competitor trends
- Remind them the tracker is open in their browser
- Ask what they want to adjust
