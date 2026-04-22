# Infographic Design Guidelines

## Color Palette

### Primary Colors
- **Primary Blue**: `#4285f4` (main brand color, used for titles, borders, accents)
- **Light Blue Background**: `#e8f0fe` (used for boxes, backgrounds, subtle highlights)
- **Dark Text**: `#1a1a1a` (primary text color, headings)
- **Medium Text**: `#5f6368` (secondary text, descriptions, body copy)
- **White**: `#ffffff` (backgrounds, clean space)

### Color Usage Rules
- Use Primary Blue for all main titles, borders, and call-to-action elements
- Light Blue Background for boxes, examples sections, footer notes
- Dark Text for all headings and important labels
- Medium Text for body copy, descriptions, and supporting text
- Maintain high contrast ratios for accessibility (4.5:1 minimum)

## Typography

### Font Stack
Use system fonts for performance and consistency:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
```

### Font Sizes
- **Main Title**: 56px (bold, primary blue)
- **Column/Section Titles**: 42px (bold, primary blue)
- **Subsection Titles**: 28px (bold, dark text)
- **Body Text**: 18px (regular, medium text)
- **Small Labels**: 16px (regular, medium text)
- **Subtitles**: 20px (regular, medium text)

### Font Weights
- 700 (bold): Titles, headings, labels
- 500 (medium): Subtitles, emphasis
- 400 (regular): Body text, descriptions

## Layout Specifications

### Canvas Dimensions
- **Standard Size**: 1200px × 1400px
- **Padding**: 40px on all sides
- **Maintains LinkedIn carousel aspect ratio**

### Grid Systems
- **Comparison Layout**: 2-column grid with 60px gap
- **Process Flow**: Single column, centered, max-width 900px
- **Framework**: 2×2 or 2×3 grid with 30px gaps

### Spacing
- Section margins: 30-50px
- Element margins: 15-25px
- Internal padding: 25-40px
- Line height: 1.4-1.6 for readability

## Component Styles

### Boxes and Cards
- Border: 3px solid Primary Blue
- Border radius: 15px
- Background: White or Light Blue
- Padding: 30px

### Icon Circles
- Diameter: 80-140px depending on hierarchy
- Background: Light Blue Background
- Border: 2px solid Primary Blue
- Center icon/emoji with good contrast

### Buttons and CTAs
Not typically used in infographics but if needed:
- Background: Primary Blue
- Text: White
- Padding: 15px 30px
- Border radius: 8px

## Content Structure

### Hierarchy
1. Main title (largest, most prominent)
2. Subtitle (explains the content)
3. Section titles (organize content)
4. Body content (details and descriptions)
5. Examples/notes (supporting information)

### Text Length Guidelines
- Main title: 2-6 words
- Subtitles: 5-10 words
- Section titles: 2-4 words
- Body text: 10-25 words per paragraph
- Keep everything scannable and concise

## Export Settings

### For LinkedIn
- Format: PNG
- Resolution: 2x (2400px × 2800px) for clarity
- Compression: Medium quality (balance size and clarity)
- Color space: sRGB

### For Web
- Format: PNG or SVG
- Resolution: 1x (1200px × 1400px)
- Optimize file size for loading speed

## Professional Standards

### Quality Checklist
☑ All text is readable at actual size
☑ Proper contrast ratios maintained
☑ No overlapping elements
☑ Consistent spacing throughout
☑ Aligned elements on grid
☑ No orphaned text
☑ Proper hierarchy visible at a glance
☑ Brand colors used consistently
☑ Professional, clean aesthetic

### Common Mistakes to Avoid
- Too much text (keep concise)
- Poor contrast (ensure readability)
- Inconsistent spacing (use grid system)
- Cluttered layouts (embrace white space)
- Too many colors (stick to palette)
- Misaligned elements (use CSS Grid/Flexbox)
