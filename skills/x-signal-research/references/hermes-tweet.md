# Hermes Tweet Reference

Use these patterns when `XQUIK_API_KEY` is available.

## Hermes Agent tool calls

Search the endpoint catalogue first:

```json
{"query":"tweet search","method":"GET"}
```

Then call `tweet_read` with the catalogue path. Search X:

```json
{"path":"/api/v1/x/tweets/search","query":{"q":"AI agents launch","limit":25}}
```

Read one tweet:

```json
{"path":"/api/v1/x/tweets/1234567890"}
```

Read a thread:

```json
{"path":"/api/v1/x/tweets/1234567890/thread"}
```

Read replies:

```json
{"path":"/api/v1/x/tweets/1234567890/replies"}
```

Look up a user:

```json
{"path":"/api/v1/x/users/openai"}
```

Export followers:

```json
{"path":"/api/v1/x/users/openai/followers","query":{"limit":100}}
```

## API shape

If Hermes Agent tools are not available, use the Xquik API with `XQUIK_API_KEY`.

```bash
curl -s "https://xquik.com/api/v1/x/tweets/search?q=AI%20agents&limit=25" \
  -H "X-API-Key: $XQUIK_API_KEY"
```

Normalise each result into this evidence shape:

```json
{
  "url": "https://x.com/handle/status/1234567890",
  "tweet_id": "1234567890",
  "author": "handle",
  "created_at": "2026-05-23T10:00:00Z",
  "text_summary": "Short factual summary",
  "engagement": {
    "likes": 0,
    "replies": 0,
    "reposts": 0,
    "views": 0
  },
  "reply_theme": "What replies reveal",
  "content_angle": "What this supports"
}
```

## Query recipes

For launch monitoring:

```text
"[product name]" OR "[company handle]"
"[product name]" pricing
"[product name]" alternative
"[product name]" bug OR issue OR problem
"[feature name]" launch
```

For niche research:

```text
"[niche]" problem
"[niche]" tools
"[niche]" automation
"[niche]" workflow
"[audience]" "how do you"
```

For creator research:

```text
from:[handle]
to:[handle]
"[creator name]"
"[creator topic]"
```

## Action safety

Hermes Tweet can also post tweets, reply, send DMs, and automate X actions. This skill is research-first.

Only run an action after the user confirms:
- The account
- The exact text or action
- The target tweet, user, or DM recipient

Never infer consent from a research request.
