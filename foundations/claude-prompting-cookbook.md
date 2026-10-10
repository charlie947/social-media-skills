# HOW TO PROMPT CLAUDE & CLAUDE COWORK — COMPLETE REFERENCE

> **Purpose**: This document is a machine-readable reference file. Upload it to Claude so it understands Anthropic's official best practices for prompting itself and leveraging Cowork. All content is synthesized from Anthropic's documentation at docs.anthropic.com (February 2026). Non-coding focus.

---

## TABLE OF CONTENTS

1. [Core Prompting Philosophy](#1-core-prompting-philosophy)
2. [Be Clear, Direct, and Detailed](#2-be-clear-direct-and-detailed)
3. [Use Examples (Multishot Prompting)](#3-use-examples-multishot-prompting)
4. [Let Claude Think (Chain of Thought)](#4-let-claude-think-chain-of-thought)
5. [Use XML Tags to Structure Prompts](#5-use-xml-tags-to-structure-prompts)
6. [Give Claude a Role (System Prompts)](#6-give-claude-a-role-system-prompts)
7. [Chain Complex Prompts](#7-chain-complex-prompts)
8. [Long Context Tips](#8-long-context-tips)
9. [Extended Thinking & Adaptive Thinking](#9-extended-thinking--adaptive-thinking)
10. [Reduce Hallucinations](#10-reduce-hallucinations)
11. [Increase Output Consistency](#11-increase-output-consistency)
12. [Control Output Format & Verbosity](#12-control-output-format--verbosity)
13. [Claude 4.x / 4.5 / Opus 4.6 — Model-Specific Best Practices](#13-claude-4x--45--opus-46--model-specific-best-practices)
14. [Claude Cowork — Complete Guide](#14-claude-cowork--complete-guide)
15. [Prompt Templates & Patterns](#15-prompt-templates--patterns)
16. [Anti-Patterns to Avoid](#16-anti-patterns-to-avoid)

---

## 1. CORE PROMPTING PHILOSOPHY

Claude is a brilliant but context-free assistant. Each conversation starts with zero knowledge of user preferences, norms, styles, or workflows. Every prompt must supply all relevant context from scratch.

**The golden rule**: If a colleague with minimal context on your task would be confused by your instructions, Claude will be too.

**Prompting hierarchy** (most broadly effective → most specialized):

1. Be clear, direct, and detailed
2. Use examples (multishot)
3. Let Claude think (chain of thought)
4. Use XML tags for structure
5. Give Claude a role via system prompts
6. Chain complex prompts together
7. Optimize for long context
8. Use extended / adaptive thinking

Apply these techniques in order when troubleshooting. The actual impact depends on the use case.

---

## 2. BE CLEAR, DIRECT, AND DETAILED

### Principles

- **Provide contextual information**: Tell Claude what the output will be used for, who the audience is, where this task fits in a larger workflow, and what a successful result looks like.
- **Be specific**: If you want only a summary and nothing else, say so. If you want exactly 3 bullet points, state that.
- **Use sequential steps**: Numbered instructions ensure Claude follows the exact intended sequence.

### What to include in every prompt

| Element | Example |
|---|---|
| Task purpose | "This will be used in a board presentation" |
| Target audience | "Written for non-technical executives" |
| Workflow position | "This is step 2 of 5 in our content pipeline" |
| Success criteria | "A good result includes specific metrics and actionable recommendations" |
| Format requirements | "Respond in 3 paragraphs, no bullet points" |
| Constraints | "Stay under 200 words" |

### Add context to improve performance

Explaining WHY an instruction matters helps Claude generalize better than raw commands alone.

**Less effective:**
```
NEVER use ellipses
```

**More effective:**
```
Your response will be read aloud by a text-to-speech engine, so never use ellipses since the text-to-speech engine will not know how to pronounce them.
```

Claude is smart enough to generalize from the explanation.

---

## 3. USE EXAMPLES (MULTISHOT PROMPTING)

Examples are the single most powerful shortcut for getting Claude to produce exactly what you need. Few-shot / multishot prompting is especially effective for structured outputs, specific formats, tone matching, and classification tasks.

### Rules for high-quality examples

- **Include 3–5 diverse examples** covering edge cases and variations.
- **Use realistic examples** that reflect actual inputs Claude will encounter.
- **Wrap examples in XML tags** like `<example>` for clear separation.
- **Show both input and output** for each example.
- **Include negative examples** when appropriate — show Claude what NOT to do.

### Template

```xml
I want you to [TASK DESCRIPTION].

Here are some examples:

<example>
<input>[EXAMPLE INPUT 1]</input>
<output>[EXAMPLE OUTPUT 1]</output>
</example>

<example>
<input>[EXAMPLE INPUT 2]</input>
<output>[EXAMPLE OUTPUT 2]</output>
</example>

<example>
<input>[EXAMPLE INPUT 3]</input>
<output>[EXAMPLE OUTPUT 3]</output>
</example>

Now, please process the following:
<input>[ACTUAL INPUT]</input>
```

### Key insight

More examples = better performance, especially for complex tasks. If the task is nuanced, 5+ examples are worth the token cost.

---

## 4. LET CLAUDE THINK (CHAIN OF THOUGHT)

When Claude faces complex tasks — research, analysis, problem-solving, multi-factor decisions — giving it space to reason step-by-step dramatically improves accuracy.

### Three levels of chain of thought

**Level 1 — Basic (least structured)**
Simply add "Think step-by-step" to your prompt. Quick but provides no reasoning guidance.

**Level 2 — Guided (recommended for most tasks)**
Outline specific steps Claude should follow in its thinking process.

```
Before writing the email, work through these steps:
1. Identify the recipient's likely concerns based on their role
2. Determine the 2-3 most compelling points from our data
3. Consider potential objections and how to preemptively address them
4. Choose a tone that matches the relationship dynamic
5. Draft the email incorporating all of the above
```

**Level 3 — Structured (most powerful)**
Use XML tags to separate reasoning from the final answer.

```
Please analyze this market trend.

Put your step-by-step reasoning in <thinking> tags and your final analysis in <answer> tags.
```

### Critical rule

Claude cannot think privately. If you don't ask it to output its thinking, no step-by-step reasoning occurs. The thinking MUST be written out to have any effect.

### When to use CoT

- Complex analysis or multi-step reasoning
- Writing that requires planning (long-form content, strategy documents)
- Decisions with many competing factors
- Any task a human would need to think through before acting

### When NOT to use CoT

- Simple factual questions
- Direct translation or reformatting
- Tasks where latency matters more than depth

---

## 5. USE XML TAGS TO STRUCTURE PROMPTS

XML tags are Claude's native structuring mechanism. They prevent Claude from mixing up instructions, context, examples, and data.

### Benefits

- **Clarity**: Clean separation of prompt components
- **Accuracy**: Reduces misinterpretation
- **Flexibility**: Easy to add, remove, or modify sections
- **Parseability**: Makes Claude's output easy to extract programmatically

### Common tags

```xml
<instructions>Your task instructions here</instructions>
<context>Background information</context>
<input>The data or content to process</input>
<example>Input-output pairs</example>
<formatting>How the output should look</formatting>
<constraints>Limitations and boundaries</constraints>
<thinking>Claude's reasoning space</thinking>
<answer>Final output</answer>
<document>Source material</document>
<criteria>Evaluation standards</criteria>
```

### Rules for XML tags

- **No canonical "best" tags exist** — use descriptive names that match the content.
- **Be consistent**: Use the same tag names throughout and reference them by name ("Using the contract in `<contract>` tags...").
- **Nest tags** for hierarchical content: `<outer><inner></inner></outer>`
- **Combine with other techniques**: `<examples>` with multishot prompting, `<thinking>` and `<answer>` with chain of thought.

### Power pattern: Combined XML + multishot + CoT

```xml
<instructions>
Analyze the customer feedback and categorize the sentiment.
</instructions>

<examples>
<example>
<input>The product broke after one week. Terrible quality.</input>
<output>Sentiment: Negative | Category: Product Quality | Urgency: High</output>
</example>
<example>
<input>Decent value for the price, though shipping was slow.</input>
<output>Sentiment: Mixed | Category: Shipping, Value | Urgency: Low</output>
</example>
</examples>

<formatting>
Use this exact format: Sentiment: [Positive/Negative/Mixed] | Category: [categories] | Urgency: [High/Medium/Low]
</formatting>

Now analyze this feedback:
<input>{{CUSTOMER_FEEDBACK}}</input>
```

---

## 6. GIVE CLAUDE A ROLE (SYSTEM PROMPTS)

Role prompting is the most powerful way to use system prompts. The right role transforms Claude from a general assistant into a domain expert.

### How roles improve output

- A "data scientist" role catches statistical anomalies a generic response would miss
- A "senior editor at The Economist" produces different prose than "friendly blog writer"
- A "CFO reviewing budgets" flags financial risks a general role would overlook

### Template

```
You are [ROLE WITH SPECIFICITY]. You have [YEARS/LEVEL] of experience in [DOMAIN].
Your communication style is [TONE]. You specialize in [NARROW FOCUS].

When analyzing [TYPE OF INPUT], you always [KEY BEHAVIORS].
```

### Examples of effective role assignments

| Weak | Strong |
|---|---|
| "You are a marketing expert" | "You are a senior growth marketer at a B2B SaaS company with 10 years of experience. You specialize in LinkedIn content strategy and have grown audiences from 0 to 500K+ followers." |
| "You are a data scientist" | "You are a seasoned data scientist at a Fortune 500 company, specializing in customer insight analysis. You always flag statistical significance issues and recommend sample sizes." |

### Key insight

Experiment with roles. A data scientist, marketing strategist, and journalist will see different insights in the same data. Adding specificity (industry, company type, years of experience) further refines the output.

---

## 7. CHAIN COMPLEX PROMPTS

When a task has multiple distinct steps that each require deep thinking, a single prompt often fails. Prompt chaining breaks complex work into manageable subtasks.

### Benefits

- **Accuracy**: Each subtask gets Claude's full attention
- **Clarity**: Simpler instructions, clearer outputs
- **Traceability**: Easy to pinpoint and fix issues

### When to chain

- Multi-step research synthesis
- Document analysis + recommendation
- Any task requiring multiple transformations
- Content creation with research → outline → draft → edit stages

### Pattern

```
Step 1 Prompt: Research and extract key findings from these sources.
                → Output becomes input for Step 2

Step 2 Prompt: Using the findings above, create an outline.
                → Output becomes input for Step 3

Step 3 Prompt: Using the outline above, write the full draft.
                → Output becomes input for Step 4

Step 4 Prompt: Edit the draft for tone, clarity, and accuracy.
```

### Implementation approaches

**Sequential chaining** (human in the loop): Run each prompt manually, review the output, then feed it to the next step. Best for high-stakes work.

**Automated chaining**: Feed outputs directly into the next prompt without human review. Best for established workflows with predictable results.

---

## 8. LONG CONTEXT TIPS

Claude supports context windows of 200K+ tokens. Proper structuring is critical for performance.

### Rule 1: Put longform data at the TOP

Place long documents and inputs (~20K+ tokens) near the top of your prompt, ABOVE your query, instructions, and examples. Queries at the end can improve response quality by up to 30%.

### Rule 2: Structure documents with XML

```xml
<documents>
  <document index="1">
    <source>annual_report_2023.pdf</source>
    <document_content>
      {{ANNUAL_REPORT}}
    </document_content>
  </document>
  <document index="2">
    <source>competitor_analysis.pdf</source>
    <document_content>
      {{COMPETITOR_ANALYSIS}}
    </document_content>
  </document>
</documents>

[Your instructions and questions go HERE, after the documents]
```

### Rule 3: Ground responses in quotes

For long document tasks, ask Claude to extract word-for-word quotes FIRST, then perform its analysis. This cuts through "noise" and reduces hallucinations.

```
Find quotes from the documents above that are relevant to answering this question.
Place them in <quotes> tags.
Then, based on these quotes, provide your analysis in <analysis> tags.
```

### Rule 4: Use few-shot examples for long context

Include example Q&A pairs about other sections of the document. This calibrates Claude's recall and response format.

---

## 9. EXTENDED THINKING & ADAPTIVE THINKING

### Extended Thinking

Extended thinking gives Claude enhanced reasoning for complex tasks by allowing it to think step-by-step before delivering a final answer. It is especially useful for:

- Complex multi-step reasoning
- Tasks requiring reflection after processing information
- Analysis with many competing factors
- Any task requiring deep, iterative reasoning

### Adaptive Thinking (Recommended for Opus 4.6)

Adaptive thinking (`thinking: {type: "adaptive"}`) is the recommended approach for Claude Opus 4.6. Instead of manually setting a thinking token budget, Claude dynamically decides when and how much to think based on the complexity of each request.

Adaptive thinking reliably drives better performance than fixed-budget extended thinking.

### Prompting for extended thinking

```
After receiving information, carefully reflect on its quality and determine optimal next steps before proceeding.
Use your thinking to plan and iterate, then take the best action.
```

### Key notes

- When extended thinking is disabled, Claude Opus 4.5 is sensitive to the word "think" and its variants. Replace with "consider," "evaluate," or "assess."
- Extended thinking outputs are summarized for the user, but Claude reasons through the full process internally.
- The minimum thinking budget is 1,024 tokens. Start there and increase incrementally.

---

## 10. REDUCE HALLUCINATIONS

### Strategy 1: Give Claude permission to say "I don't know"

```
If you are not confident in your answer, say "I'm not sure" rather than guessing.
If the answer cannot be determined from the provided documents, state that explicitly.
```

### Strategy 2: Ground responses in direct quotes

For tasks with source documents (>20K tokens), ask Claude to extract word-for-word quotes BEFORE performing its task. This grounds output in actual text.

### Strategy 3: Require citations

Make responses auditable by requiring Claude to cite quotes and sources for each claim. If it can't find a supporting quote, it must retract the claim.

### Strategy 4: Chain-of-thought verification

Ask Claude to explain its reasoning step-by-step before giving a final answer. This surfaces faulty logic or assumptions.

### Strategy 5: External knowledge restriction

```
Only use information from the provided documents. Do not use your general knowledge.
If the documents don't contain relevant information, say so.
```

### Strategy 6: Best-of-N verification

Run Claude through the same prompt multiple times. Compare outputs. Inconsistencies indicate potential hallucinations.

### Strategy 7: Iterative refinement

Use Claude's output as input for a follow-up prompt asking it to verify or expand on its claims. This catches and corrects inconsistencies.

---

## 11. INCREASE OUTPUT CONSISTENCY

- **Set temperature to 0.0** for maximum consistency (note: full determinism is never guaranteed).
- **Use detailed format specifications** in the prompt.
- **Provide examples** that demonstrate the exact format expected.
- **Use XML tags** to enforce structural consistency.
- **Include explicit constraints** on length, style, and tone.

---

## 12. CONTROL OUTPUT FORMAT & VERBOSITY

Claude 4.x models respond well to explicit formatting instructions. There are several proven methods:

### Method 1: Tell Claude what to DO (not what to avoid)

**Less effective:**
```
Do not use markdown in your response
```

**More effective:**
```
Your response should be composed of smoothly flowing prose paragraphs.
```

### Method 2: Use XML format indicators

```
Write the prose sections of your response in <smoothly_flowing_prose_paragraphs> tags.
```

### Method 3: Match prompt style to desired output

The formatting style of your prompt influences Claude's response style. Remove markdown from your prompt to reduce markdown in the output.

### Method 4: Explicit formatting control

```xml
<avoid_excessive_markdown_and_bullet_points>
When writing reports, documents, technical explanations, analyses, or any long-form content,
write in clear, flowing prose using complete paragraphs and sentences.
Use standard paragraph breaks for organization.
Reserve markdown primarily for inline code and code blocks.
Avoid using bold and italics.

DO NOT use ordered lists or unordered lists unless:
a) you're presenting truly discrete items where a list is the best option, or
b) the user explicitly requests a list or ranking

Instead of listing items with bullets, incorporate them naturally into sentences.
NEVER output a series of overly short bullet points.

Your goal is readable, flowing text that guides the reader naturally through ideas.
</avoid_excessive_markdown_and_bullet_points>
```

### Controlling verbosity

Claude 4.5 models are more concise by default. If you want more detailed updates:

```
After completing a task, provide a quick summary of the work you've done.
```

If you want Claude to be more concise:

```
Be direct and concise. Skip preambles, caveats, and unnecessary elaboration.
Respond in 2-3 sentences unless the topic genuinely requires more.
```

---

## 13. CLAUDE 4.x / 4.5 / OPUS 4.6 — MODEL-SPECIFIC BEST PRACTICES

These are techniques and behaviors unique to Claude's latest model generations.

### Be explicit with instructions

Claude 4.x follows instructions precisely. If you want "above and beyond" behavior, request it explicitly:

**Less effective:**
```
Create an analytics dashboard
```

**More effective:**
```
Create an analytics dashboard. Include as many relevant features and interactions as possible. Go beyond the basics to create a fully-featured implementation.
```

### Be vigilant with examples and details

Claude 4.x pays close attention to examples. Ensure examples align with desired behaviors and don't accidentally demonstrate behaviors you want to avoid.

### Communication style (4.5+)

- More direct and grounded: Fact-based progress reports over self-congratulatory updates
- More conversational: Fluent, colloquial, less machine-like
- Less verbose: May skip detailed summaries unless prompted

### Tool usage patterns

Claude 4.x follows instructions precisely. "Can you suggest some changes?" will produce suggestions. "Make these changes" will produce action.

**For proactive action by default:**
```xml
<default_to_action>
By default, implement changes rather than only suggesting them.
If the user's intent is unclear, infer the most useful likely action and proceed.
</default_to_action>
```

**For conservative action:**
```xml
<do_not_act_before_instructions>
Do not jump into implementation unless clearly instructed.
When the user's intent is ambiguous, default to providing recommendations rather than taking action.
</do_not_act_before_instructions>
```

### Tool usage triggering (Opus 4.5+)

Opus 4.5+ is more responsive to system prompts than previous models. If prompts were designed to reduce undertriggering, Opus may now overtrigger. Dial back aggressive language:

**Before:** "CRITICAL: You MUST use this tool when..."
**After:** "Use this tool when..."

### Prefill removal (Opus 4.6)

Starting with Claude Opus 4.6, prefilling assistant messages is no longer supported. Use structured outputs, system prompt instructions, or `output_config.format` instead.

### Document creation

Claude 4.5+ excels at presentations, animations, and visual documents with impressive creative flair and strong instruction following. Output is typically polished on the first try.

```
Create a professional presentation on [topic].
Include thoughtful design elements, visual hierarchy, and engaging animations where appropriate.
```

### Improved vision capabilities (Opus 4.5+)

- Better image processing and data extraction
- Improved multi-image analysis
- Better screenshot and UI element interpretation
- Can analyze videos broken into frames
- Performance boost from giving Claude a "crop tool" to zoom into relevant image regions

### Research and information gathering

Claude 4.5+ has exceptional agentic search capabilities. For optimal research:

```
Search for this information in a structured way.
As you gather data, develop several competing hypotheses.
Track your confidence levels. Regularly self-critique your approach.
Update a hypothesis tree or research notes to persist information.
Break down this complex research task systematically.
```

### Long-horizon reasoning and state tracking (4.5+)

Claude 4.5 maintains orientation across extended sessions by focusing on incremental progress. It works on a few things at a time rather than attempting everything at once. This capability especially emerges over multiple context windows or task iterations.

### Context awareness (4.5+)

Claude 4.5 can track its remaining context window throughout a conversation. If using a system that compacts or saves context:

```
Your context window will be automatically compacted as it approaches its limit,
allowing you to continue working indefinitely from where you left off.
Therefore, do not stop tasks early due to token budget concerns.
As you approach your token budget limit, save your current progress and state to memory
before the context window refreshes.
```

---

## 14. CLAUDE COWORK — COMPLETE GUIDE

### What is Cowork?

Cowork is Claude Code for non-coding knowledge work. It uses the same agentic architecture as Claude Code, accessible within Claude Desktop on macOS. Instead of responding to prompts one at a time, Claude takes on complex, multi-step tasks and executes them autonomously.

**Key difference from Chat**: In Chat, Claude responds to prompts. In Cowork, Claude executes tasks end-to-end — reading files, writing documents, coordinating sub-agents, and delivering finished work.

### Key capabilities

- **Direct local file access**: Read and write your local files without upload/download
- **Sub-agent coordination**: Breaks complex work into smaller tasks, coordinates parallel workstreams
- **Professional outputs**: Excel with working formulas, PowerPoint decks, formatted Word documents, PDFs
- **Long-running tasks**: Extended execution without conversation timeouts or context limits

### How Cowork executes tasks

1. Analyzes your request and creates a plan
2. Breaks complex work into subtasks
3. Executes work in a virtual machine (VM) environment
4. Coordinates multiple workstreams in parallel
5. Delivers finished outputs directly to your file system

### Requirements

- Claude Desktop app for macOS
- Paid Claude subscription (Pro, Max, Team, Enterprise)
- Active internet connection throughout the session
- Desktop app must remain open while Claude is working

### How to prompt Cowork effectively

Cowork prompts should describe OUTCOMES, not steps. Tell Claude what you want to end up with.

**Chat-style prompt (less effective in Cowork):**
```
Can you help me organize my files?
```

**Cowork-style prompt (outcome-focused):**
```
Organize my Downloads folder by type and date. Create subfolders for Documents,
Images, Spreadsheets, and Other. Rename each file with YYYY-MM-DD prefix based
on its modification date. Create a summary log of all changes made.
```

### Example prompts by use case

**File & document management:**
```
This folder contains 200+ receipt images. Create a formatted expense report
as an Excel spreadsheet with categories, dates, vendors, and amounts.
Include a summary sheet with totals by category and month.
```

**Research & analysis:**
```
Analyze all meeting transcripts in this folder.
Extract recurring themes, action items, and decisions.
Create a Word document report with an executive summary,
key themes section, and appendix of all action items with owners and dates.
```

**Data analysis:**
```
This folder contains Lichess's 2025 operating expenses.
Analyze the data and create a Word document report that covers:
- Total annual spending
- Breakdown by category with percentages
- The three largest expense categories
- Month-over-month trends
Format the report professionally with clear sections, tables, and an executive summary.
```

**Presentation creation:**
```
Create a 12-slide investor pitch deck from the business plan document in this folder.
Include competitive analysis, financial projections, and team overview slides.
Use a professional design with consistent branding.
```

### Plugins

Plugins are pre-built bundles that customize Claude's behavior for specific roles:

- **Productivity** — Tasks, calendars, daily workflows
- **Enterprise search** — Cross-tool information retrieval
- **Sales** — Prospect research, deal prep
- **Finance** — Financial analysis, modeling
- **Data** — Query, visualize, interpret datasets
- **Legal** — Document review, risk flagging, compliance
- **Marketing** — Content drafting, campaign planning
- **Customer support** — Issue triage, response drafting
- **Product management** — Specs, roadmaps, progress tracking
- **Biology research** — Literature search, experiment planning

Access via: Cowork tab → Plugins in left sidebar → Browse and install. Type `/` or click `+` to see available commands from installed plugins.

### Connectors in Cowork

Connectors link Claude to external services (Google Drive, Slack, etc.). In Cowork, connectors gain filesystem access — they can save data locally or use local files as input for external actions.

Browse connectors: Settings → Connectors → Browse connectors (Web and Desktop extensions tabs).

### Current limitations

- No Projects support
- No memory across sessions
- No chat or artifact sharing
- No GSuite connector support
- macOS only (no Windows, no mobile, no web)
- Desktop app must remain open for session to continue

### Usage optimization

Cowork consumes significantly more tokens than standard chat. To optimize:

- Batch related work into single sessions
- Use standard Chat for simple tasks
- Reserve Cowork for complex, multi-step work requiring file access
- Monitor usage in Settings → Usage

---

## 15. PROMPT TEMPLATES & PATTERNS

### The Universal Prompt Template

```xml
<role>
You are a [SPECIFIC ROLE] with [QUALIFICATIONS].
Your communication style is [TONE/STYLE].
</role>

<context>
[Background information Claude needs to understand the situation]
[Who the audience is]
[Where this fits in a larger workflow]
</context>

<instructions>
[Clear, numbered steps for what Claude should do]
1. First, [STEP 1]
2. Then, [STEP 2]
3. Finally, [STEP 3]
</instructions>

<constraints>
[Length limits, format requirements, things to avoid]
</constraints>

<examples>
<example>
<input>[EXAMPLE INPUT]</input>
<output>[EXAMPLE OUTPUT]</output>
</example>
</examples>

<input>
[THE ACTUAL CONTENT/DATA/QUESTION TO PROCESS]
</input>
```

### The Research & Analysis Template

```xml
<role>
You are a senior analyst specializing in [DOMAIN].
</role>

<task>
Analyze the following [DATA TYPE] and produce a [DELIVERABLE TYPE].
</task>

<methodology>
1. First, extract relevant quotes from the source material and place them in <quotes> tags.
2. Identify key patterns and themes in <patterns> tags.
3. Develop your analysis in <thinking> tags.
4. Present your final analysis in <analysis> tags.
</methodology>

<format>
[Specific formatting requirements]
</format>

<sources>
[DOCUMENT CONTENT HERE]
</sources>
```

### The Content Creation Template

```xml
<role>
You are a [CONTENT ROLE] who writes for [AUDIENCE].
Your tone is [TONE]. Your style references include [REFERENCES].
</role>

<brief>
Topic: [TOPIC]
Goal: [WHAT THIS CONTENT SHOULD ACHIEVE]
Format: [BLOG POST / EMAIL / SOCIAL POST / REPORT]
Length: [WORD COUNT OR PAGE COUNT]
Key points to cover: [POINTS]
</brief>

<examples>
[2-3 examples of similar content in the desired style]
</examples>

<constraints>
- [THINGS TO INCLUDE]
- [THINGS TO AVOID]
- [BRAND VOICE GUIDELINES]
</constraints>
```

### The Decision-Making Template

```xml
<context>
[SITUATION DESCRIPTION]
</context>

<options>
[LIST OF OPTIONS BEING CONSIDERED]
</options>

<criteria>
[WHAT MATTERS MOST IN THIS DECISION — ranked by importance]
</criteria>

<instructions>
Evaluate each option against the criteria above.
Put your reasoning in <thinking> tags.
Present a structured comparison in <analysis> tags.
Give your recommendation in <recommendation> tags.
</instructions>
```

---

## 16. ANTI-PATTERNS TO AVOID

### ❌ Vague instructions
```
Write something about AI trends.
```
✅ **Instead:**
```
Write a 600-word LinkedIn post about the 3 most impactful AI trends in content marketing for 2026. Target audience: marketing directors at mid-size B2B companies. Tone: authoritative but conversational. Include specific data points or examples for each trend.
```

### ❌ No context about purpose
```
Summarize this document.
```
✅ **Instead:**
```
Summarize this document for a busy CEO who needs to make a go/no-go decision about the project described. Focus on ROI projections, timeline risks, and resource requirements. Keep it under 300 words.
```

### ❌ Contradictory examples
Providing examples that demonstrate behaviors you want to avoid. Claude 4.x pays close attention to examples and will replicate patterns it sees, even undesirable ones.

### ❌ Telling Claude what NOT to do (without alternatives)
```
Don't use jargon.
```
✅ **Instead:**
```
Write in plain English that a high school student could understand. Replace technical terms with everyday equivalents.
```

### ❌ Assuming shared context
```
Update the report like last time.
```
✅ **Instead:**
```
Update the Q3 financial report. The format should be: executive summary (1 paragraph), revenue breakdown by region (table), key risks (3 bullet points), and outlook (2 paragraphs).
```

### ❌ Overcomplicating simple tasks
Not every prompt needs XML tags, roles, and chain of thought. For simple questions, just ask clearly.

### ❌ Using "think" when extended thinking is disabled
Claude Opus 4.5 is sensitive to the word "think" when extended thinking is off. Use "consider," "evaluate," or "assess" instead.

### ❌ Aggressive trigger language with Opus 4.5+
Prompts like "CRITICAL: You MUST ALWAYS..." worked for older models that undertriggered. Opus 4.5+ is more responsive and may overtrigger. Use natural language: "Use this tool when..."

---

## QUICK REFERENCE CARD

| Technique | When to use | Token cost |
|---|---|---|
| Be clear and direct | Always | Minimal |
| XML tags | Multi-component prompts | Minimal |
| Role prompting | Domain-specific tasks | Low |
| Multishot examples | Structured outputs, format matching | Medium |
| Chain of thought | Complex analysis, multi-factor decisions | Medium-High |
| Prompt chaining | Multi-step workflows | Medium (across prompts) |
| Long context optimization | Documents >20K tokens | Low (structural) |
| Extended thinking | Deep reasoning, complex problems | High |

---

## SOURCE

All content synthesized from official Anthropic documentation:
- docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/*
- docs.anthropic.com/en/docs/build-with-claude/extended-thinking
- docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/*
- docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices
- support.claude.com/en/articles/13345190-getting-started-with-cowork
- anthropic.com/engineering/claude-think-tool

Last updated: February 2026
