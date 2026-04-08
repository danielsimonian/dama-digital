---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with exceptional design quality, avoiding generic AI aesthetics. Use when building web components, pages, or applications. Requires confirmed design context before implementation.
source: https://github.com/pbakaus/impeccable
license: MIT
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

## Context Gathering Protocol

Design skills produce generic output without project context. You MUST have confirmed design context before doing any design work.

Required context — every design skill needs at minimum:
- **Target audience**: Who uses this product and in what context?
- **Use cases**: What jobs are they trying to get done?
- **Brand personality/tone**: How should the interface feel?

Gathering order:
1. **Check current instructions (instant)**: If your loaded instructions already contain a Design Context section, proceed immediately.
2. **Check .impeccable.md (fast)**: If not in instructions, read `.impeccable.md` from the project root. If it exists and contains the required context, proceed.
3. **Run teach-impeccable (REQUIRED)**: If neither source has context, you MUST run `/teach-impeccable` NOW before doing anything else.

## Design Direction

Commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

CRITICAL: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is intentionality, not intensity.

## Frontend Aesthetics Guidelines

### Typography
- Consult typography reference for scales, pairing, and loading strategies
- Choose fonts that are beautiful, unique, and interesting
- Pair a distinctive display font with a refined body font
- DO: Use a modular type scale with fluid sizing (clamp)
- DO: Vary font weights and sizes to create clear visual hierarchy
- DON'T: Use overused fonts — Inter, Roboto, Arial, Open Sans, system defaults
- DON'T: Use monospace typography as lazy shorthand for "technical/developer" vibes
- DON'T: Put large icons with rounded corners above every heading

### Color & Theme
- Commit to a cohesive palette. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- DO: Use modern CSS color functions (oklch, color-mix, light-dark) for perceptually uniform, maintainable palettes
- DO: Tint your neutrals toward your brand hue
- DON'T: Use gray text on colored backgrounds — use a shade of the background color instead
- DON'T: Use pure black (#000) or pure white (#fff) — always tint
- DON'T: Use the AI color palette: cyan-on-dark, purple-to-blue gradients, neon accents on dark backgrounds
- DON'T: Use gradient text for "impact" — especially on metrics or headings
- DON'T: Default to dark mode with glowing accents

### Layout & Space
- DO: Create visual rhythm through varied spacing — tight groupings, generous separations
- DO: Use fluid spacing with clamp() that breathes on larger screens
- DO: Use asymmetry and unexpected compositions; break the grid intentionally for emphasis
- DON'T: Wrap everything in cards — not everything needs a container
- DON'T: Nest cards inside cards
- DON'T: Use identical card grids — same-sized cards with icon + heading + text, repeated endlessly
- DON'T: Use the hero metric layout template — big number, small label, supporting stats, gradient accent
- DON'T: Center everything — left-aligned text with asymmetric layouts feels more designed
- DON'T: Use the same spacing everywhere — without rhythm, layouts feel monotonous

### Visual Details
- DO: Use intentional, purposeful decorative elements that reinforce brand
- DON'T: Use glassmorphism everywhere — blur effects used decoratively rather than purposefully
- DON'T: Use rounded elements with thick colored border on one side
- DON'T: Use sparklines as decoration — tiny charts that look sophisticated but convey nothing
- DON'T: Use rounded rectangles with generic drop shadows
- DON'T: Use modals unless there's truly no better alternative

### Motion
- Focus on high-impact moments: one well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions
- DO: Use motion to convey state changes — entrances, exits, feedback
- DO: Use exponential easing (ease-out-quart/quint/expo) for natural deceleration
- DON'T: Animate layout properties (width, height, padding, margin) — use transform and opacity only
- DON'T: Use bounce or elastic easing — they feel dated and tacky

### Interaction
- DO: Use progressive disclosure — start simple, reveal sophistication through interaction
- DO: Design empty states that teach the interface, not just say "nothing here"
- DO: Make every interactive surface feel intentional and responsive
- DON'T: Repeat the same information — redundant headers, intros that restate the heading
- DON'T: Make every button primary — use hierarchy

### Responsive
- DO: Use container queries (@container) for component-level responsiveness
- DO: Adapt the interface for different contexts — don't just shrink it
- DON'T: Hide critical functionality on mobile — adapt the interface, don't amputate it

## The AI Slop Test

Critical quality check: If you showed this interface to someone and said "AI made this," would they believe you immediately? If yes, that's the problem. A distinctive interface should make someone ask "how was this made?" not "which AI made this?"

Review the DON'T guidelines above — they are the fingerprints of AI-generated work from 2024-2025.

## Implementation Principles

Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices across generations.

Remember: the model is capable of extraordinary creative work. Don't hold back — show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
