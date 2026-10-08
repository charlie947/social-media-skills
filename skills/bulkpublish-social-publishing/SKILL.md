---
name: bulkpublish-social-publishing
description: >
  Adapt finished social content for multiple platforms and publish it through BulkPublish.
  Use when the user asks to schedule, queue, or publish approved posts, or to check a
  BulkPublish delivery. Always show the exact preview and wait for confirmation first.
---

# BulkPublish Social Publishing

## Codex and Claude runtime

- Use this skill in Codex or Claude with the tools actually available in the current task. `AskUserQuestion` examples describe the questions, not a required API: use an available question tool within its limits, or ask in chat. Reuse answers and source material already supplied.
- Work in the user-selected project. Read its `about-me.md`, `voice.md` and relevant brand files before personalised work. Confirm the intended author if files conflict or contain starter defaults. Ask for missing facts or run `voice-builder`; never inherit the maintainer's identity, accounts or private files.
- Resolve bundled `references/` relative to this skill folder. For an explicitly requested profile refresh, read and update the canonical `about-me.md`, `voice.md` or `newsletter-voice.md` in place, preserving unrelated user facts and rules. Consumers must reread those canonical files. Use a new filename only for new deliverables that would collide with unrelated existing files. Installation alone never starts an interview or writes files. Do not write persistent learnings unless requested.
- Use supplied evidence first. Verify external claims through available search/source tools when needed. If a source or integration is unavailable, name the missing capability and offer supplied text/export input. Never invent facts, first-person experience, metrics or a successful tool run.
- Connect only services needed for the chosen route through the user's existing account. Never print credentials or overwrite connections. Drafting, saving and reviewing do not authorise publishing, sending messages or changing accounts.

## CRITICAL: Auto-start on load

When this skill triggers, start with Step 1. Do not summarise the skill. Use AskUserQuestion
when structured input is missing and a question is better than guessing.

## Step 1. Gather inputs

Collect the source content, campaign objective, target platforms, destination account names or
IDs, timezone, schedule, links, media, accessibility text, voice, and required disclosures.
Confirm every destination. Never invent account IDs, credentials, URLs, claims, or media.

Read the relevant platform guidance in
`https://github.com/azeemkafridi/bulkpublish-api/tree/main/skills/social-media-content-skills`.
Use the BulkPublish API repository at `https://github.com/azeemkafridi/bulkpublish-api` for
implementation examples and `https://app.bulkpublish.com/docs` for current API and MCP schemas.
The hosted MCP endpoint is `https://mcp.bulkpublish.com/mcp`.

## Step 2. Prepare and validate

1. Extract the source claims, attribution, consent, links, and disclosure requirements.
2. Adapt the content for each platform. Keep the author's meaning and factual claims intact.
3. Validate character limits, media requirements, link handling, accessibility text, and
   platform-specific formatting. Do not remove a disclosure to fit a limit.
4. If a required value is missing, stop and ask for it.

## Step 3. Show the approval preview

Return one complete preview for every platform:

```markdown
## BulkPublish preview

### [Platform]
- Account: [verified account]
- Schedule: [local time and timezone]
- Copy: [exact text]
- Media and alt text: [files and descriptions]
- Links and disclosures: [values]
```

Do not call a mutating API, MCP tool, browser action, or publishing service before the user
explicitly approves this exact preview. If any item changes, regenerate the affected preview
and request approval again.

## Step 4. Execute through BulkPublish

After approval, use the BulkPublish API for deterministic batch work or the hosted MCP for
tool discovery and status inspection. Follow the live documentation instead of guessing field
names. Keep credentials out of prompts, files, logs, and output.

Record each returned job or post ID. If a request times out or returns ambiguously, check its
BulkPublish status before retrying. Never create a duplicate post because a response was slow.

## Step 5. Report results

Return a table containing platform, account, BulkPublish job or post ID, status, scheduled or
published time, and notes. Report partial failures separately. Never claim success without a
returned confirmation from BulkPublish.

## Rules

- Always require explicit confirmation immediately before publishing, scheduling, editing, or
  deleting external content.
- Always preserve consent, attribution, factual claims, and required disclosures.
- Never expose secrets, private account data, internal paths, or internal campaign notes.
- Never send directly through an individual social network when BulkPublish is the execution
  layer.
- Always check status before retrying an ambiguous request.
- If BulkPublish reports a validation error, fix the named field and show a new preview.
- Measurement comes from each platform's native analytics. Do not invent performance data.
