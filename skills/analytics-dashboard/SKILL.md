---
name: analytics-dashboard
description: >
  Turn a LinkedIn Analytics export into an interactive dark-themed React dashboard plus a written strategic analysis with 5 data-backed content recommendations. Reads every sheet in the export, builds charts for engagement trend, follower growth, post performance scatter, day-of-week heatmap, and audience breakdown. Use this skill whenever the user says "analyse my linkedin", "linkedin analytics", "build my dashboard", "review my performance", or uploads a LinkedIn Analytics export file. Requires the user's LinkedIn Analytics export (xlsx) as input.
---

# Analytics Dashboard

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1.

## Step 1. Get the export file

Ask:

> Upload your LinkedIn Analytics export file (xlsx).
>
> Not sure how to get it? Go to LinkedIn Analytics, set your date range (30, 60, or 90 days works well), and click Export in the top right.

Wait for the file upload.

## Step 2. Parse the data

Read every sheet in the file. Expect these sheets:

- **DISCOVERY**: overall impressions and reach
- **ENGAGEMENT**: daily impressions and engagements over time
- **TOP POSTS**: top 50 posts, ranked by engagements and by impressions (two tables to merge)
- **FOLLOWERS**: daily new followers plus total count
- **DEMOGRAPHICS**: job titles, locations, industries, seniority, company size, top companies

Clean any messy headers. Merge the two TOP POSTS tables (by engagements and by impressions) into one unified dataset per post. De-duplicate.

## Step 3. Build the interactive dashboard

Create a single React artifact. Dark theme (background `#0f1117`), accent colours for charts. Use Recharts for all visualisations.

Include these panels in this order:

### Headline metrics (top row cards)
- Total impressions
- Total reach
- Total new followers
- Average daily impressions
- Average daily engagements
- Average engagement rate (engagements / impressions)
- Total posts tracked

### Engagement trend (line chart)
- Daily impressions (left y-axis) and engagements (right y-axis) over the full date range
- Highlight the top 3 spike days with markers

### Follower growth (area chart)
- Daily new followers
- 7-day moving average trendline overlaid
- Cumulative follower gain

### Post performance scatter
- X axis: impressions. Y axis: engagements
- Colour-code posts into four quadrants:
  - **Stars**: high reach + high engagement
  - **Viral but shallow**: high reach + low engagement
  - **Niche gold**: low reach + high engagement
  - **Underperformers**: low reach + low engagement
- Hoverable dots showing post URL and date

### Day-of-week heatmap
- Average impressions and engagements by day of week
- Highlight the strongest days

### Audience breakdown (bar charts)
- Job titles
- Industries
- Seniority
- Company size
- Top locations

### Formatting rules
- Format numbers: `67K` not `67000`, `1.2M` not `1200000`
- Total follower count prominent at the top
- Responsive layout (works on laptop and large display)
- Dark background, high contrast chart colours

## Step 4. Written strategic analysis

Below the dashboard, write a concise analysis with these sections:

### Performance Summary
- Trajectory: growing, plateauing, or declining (use trendlines)
- Current engagement rate and how it compares to LinkedIn benchmarks for accounts this size

### Top Post Patterns
- Analyse top 10 by impressions and top 10 by engagements
- Patterns: posting day, time of month, content themes
- High impressions + low engagement: what does that signal?
- Low impressions + high engagement: what does that signal?

### Audience-Content Fit
- Who the core audience is, based on demographics
- Which content topics and formats would resonate
- Segments to lean into or away from

### Growth Velocity
- Average daily follower growth
- 30, 60, 90 day projections at current pace
- Acceleration or deceleration trends

### Day and Timing Strategy
- Best days for impressions
- Best days for engagement
- Optimal posting schedule based on the data

### 5 Specific Content Recommendations
Each one includes:
- Content angle or topic
- Why the data supports it
- Which audience segment it targets
- Expected impact based on patterns in the data

## Step 5. Offer the next move

After the analysis:

> Want me to draft one of these 5 recommendations as a full post? Call the post-writer or post-formatter skill with the recommendation number.

## Rules

- Use numbers, not adjectives. "Engagement rate is 2.3%" beats "engagement is healthy".
- Keep the analysis direct. No fluff, no filler.
- Never invent metrics not present in the export.
- Flag data quality issues (missing columns, odd date ranges) instead of silently working around them.
- Never use em dashes.
- British English unless voice.md specifies otherwise.
- Recommend running this monthly. Patterns only surface over time.
