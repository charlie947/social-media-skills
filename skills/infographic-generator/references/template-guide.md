# Template Selection Guide

## When to Use Each Template

### Comparison Template (`comparison-template.html`)
**Use when:** Comparing two concepts, approaches, or methods side by side

**Best for:**
- X vs Y comparisons
- Traditional vs Modern approaches
- Tool A vs Tool B
- Before/After scenarios
- Pros/Cons visualizations

**Structure:**
- Two equal columns
- Icon circles at top of each column
- Characteristics sections
- Examples boxes at bottom
- Clear visual separation

**Example use cases:**
- "AI Agents vs Agentic AI"
- "Manual Process vs Automated Process"
- "Old Method vs New Method"

### Process Template (`process-template.html`)
**Use when:** Showing sequential steps or a workflow

**Best for:**
- Step-by-step guides
- Workflows and processes
- Sequential methodologies
- Implementation guides
- Timeline visualizations

**Structure:**
- Numbered steps in vertical flow
- Arrows between steps
- Step descriptions
- Optional footer note

**Example use cases:**
- "5 Steps to AI Implementation"
- "Content Creation Workflow"
- "From Idea to Launch Process"

### Framework Template (`framework-template.html`)
**Use when:** Explaining a methodology, system, or concept with multiple components

**Best for:**
- Frameworks (SCALE, VIRAL, etc.)
- Methodologies
- Systems with 4-6 components
- Concept breakdowns
- Principle explanations

**Structure:**
- 2×2 or 2×3 grid layout
- Icon for each component
- Key points per component
- Summary footer

**Example use cases:**
- "The SCALE Framework"
- "4 Pillars of AI Marketing"
- "Core Components of Automation"

## Template Variable Reference

### Comparison Template Variables
- `{{TITLE}}`: Document title (not displayed)
- `{{LEFT_TITLE}}`: Left column main title
- `{{RIGHT_TITLE}}`: Right column main title
- `{{SUBTITLE}}`: Explaining subtitle below main title
- `{{LEFT_SUBTITLE}}`: Left column subtitle
- `{{RIGHT_SUBTITLE}}`: Right column subtitle
- `{{LEFT_ICON}}`: Left column icon (emoji or symbol)
- `{{RIGHT_ICON}}`: Right column icon (emoji or symbol)
- `{{LEFT_FLOW_CONTENT}}`: Left column flow diagram HTML
- `{{RIGHT_FLOW_CONTENT}}`: Right column flow diagram HTML
- `{{LEFT_CHARACTERISTICS}}`: Left column characteristics HTML
- `{{RIGHT_CHARACTERISTICS}}`: Right column characteristics HTML
- `{{LEFT_EXAMPLES}}`: Left column examples text
- `{{RIGHT_EXAMPLES}}`: Right column examples text

### Process Template Variables
- `{{TITLE}}`: Main process title
- `{{SUBTITLE}}`: Process description
- `{{STEPS}}`: HTML for all steps (repeating structure)
- `{{FOOTER_NOTE}}`: Optional footer note

### Framework Template Variables
- `{{TITLE}}`: Framework name
- `{{SUBTITLE}}`: Framework description
- `{{FRAMEWORK_ITEMS}}`: HTML for all framework components (repeating structure)
- `{{FOOTER_TITLE}}`: Summary/conclusion title
- `{{FOOTER_TEXT}}`: Summary/conclusion text

## Generating Content for Templates

### Step 1: Analyze the Request
Determine which template fits best based on:
- Content structure (comparison, process, framework)
- Number of elements (2 items = comparison, 3-6 items = framework, sequential = process)
- Relationship between elements (opposing, sequential, complementary)

### Step 2: Extract Content
Parse the input to identify:
- Main concepts/titles
- Descriptions and details
- Characteristics or features
- Examples or use cases
- Icons/emojis that represent concepts

### Step 3: Structure the HTML
Generate clean, properly formatted HTML for:
- Repeating elements (characteristics, steps, framework items)
- Proper nesting and indentation
- Semantic HTML structure

### Step 4: Quality Check
Verify:
- All variables replaced
- No placeholder text remains
- HTML is valid and properly closed
- Text length is appropriate
- Content fits within design constraints

## HTML Snippet Patterns

### Characteristic Block (for Comparison Template)
```html
<div class="characteristic">
    <div class="char-icon">☑</div>
    <div class="char-content">
        <h4>Title Here:</h4>
        <p>Description text here.</p>
    </div>
</div>
```

### Process Step (for Process Template)
```html
<div class="step">
    <div class="step-number">1</div>
    <div class="step-content">
        <div class="step-title">Step Title</div>
        <div class="step-description">Step description text here.</div>
    </div>
</div>
<div class="arrow">↓</div>
```

### Framework Item (for Framework Template)
```html
<div class="framework-item">
    <div class="item-icon">📊</div>
    <div class="item-title">Component</div>
    <div class="item-description">Description here.</div>
    <div class="key-points">
        <div class="key-point"><span>Key point 1</span></div>
        <div class="key-point"><span>Key point 2</span></div>
        <div class="key-point"><span>Key point 3</span></div>
    </div>
</div>
```

## Icons and Emojis

### Recommended Icons by Category
- **Technology**: 🤖 💻 ⚙️ 🔧 📱 🖥️
- **Process**: ➡️ ↓ ↑ ⚡ 🔄 ⭐
- **People**: 👤 👥 🎯 💡 🧠 📊
- **Success**: ✅ ☑️ 💪 🚀 📈 🎯
- **Learning**: 📚 🎓 💡 🧩 📝 🔍

### Icon Placement Rules
- Use simple, recognizable icons
- One icon per section maximum
- Ensure good contrast with background
- Size appropriately for context
