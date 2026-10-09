---
name: ai-design-smells
description: Audit a website's visual design and copy for "AI design smells" — generic patterns that make a site look/read like an unedited AI-generated template rather than a bespoke product. Covers purple/violet gradients, gradient-clipped text, glossy sweeping-highlight buttons, glassmorphism, generic decorative icons, monospace misuse, and templated marketing copy (em dashes, middle dots, "not just X but Y", buzzwords, rule-of-three padding). Use when asked to review/clean up a site's design, "make it look less AI-generated", or audit UI/copy for generic template patterns.
---

# AI Design Smell Audit

A two-phase skill: **find** concrete instances with file:line evidence, then **fix** only what's confirmed to be a smell — not everything that merely resembles one. A hover-lift on a card or a hero section is not automatically a smell; the smell is the *specific generic implementation* (unused leftover gradient tokens, sweeping sheen animations, gradient-clipped headings, filler copy), not the general existence of a hero or a button hover state.

## Phase 1: Find

Grep the codebase (`src/`, styles, theme files, marketing/landing copy, README) for each category below. Skip `node_modules`/`build`/`dist`. Report every hit as `file:line — quote — category`, and explicitly say "none found" for empty categories rather than omitting them.

### Visual smells

| Smell | How to detect | Grep starting point |
|---|---|---|
| Purple/violet gradient tokens | `linear-gradient` using colors like `#667eea`, `#764ba2`, `#8b5cf6`, `#a855f7`, `#4facfe`/`#00f2fe` (cyan sibling) that don't match the site's actual brand palette | `grep -rn "linear-gradient" src` then compare hex values against `palette.primary`/`palette.secondary` |
| Gradient-clipped text | `backgroundClip: 'text'` / `background-clip: text` + `WebkitTextFillColor: transparent` applied to headings | `grep -rn "backgroundClip\|background-clip" src` |
| Glossy/"flowing" buttons | A `::before`/`::after` pseudo-element that slides a translucent white gradient across the element on hover (`left: -100%` → `100%`, or `rgba(255,255,255,0.2)` sweep) | `grep -rn "rgba(255,255,255" src` then inspect surrounding `::before`/hover rules |
| Glassmorphism | `backdrop-filter: blur(...)` combined with a semi-transparent white/black background | `grep -rn "backdrop-filter\|backdropFilter" src` |
| Monospace misuse | `font-family: monospace` / named mono fonts on headings, body copy, or labels — **not** on code blocks, IDs, or tabular stat data, which is legitimate | `grep -rn "monospace\|Courier\|JetBrains Mono\|Fira Code" src`, then check each hit's context |
| Generic decorative icons | The same sparkle/rocket/lightning/target icon (or ✨🚀⚡🎯 emoji) repeated across unrelated cards/sections regardless of relevance | `grep -rniE "sparkle|rocket|zap|lightning|gpsfixed" src`, plus emoji search |
| Pill-everything | `border-radius: 9999px` or fully-rounded buttons/badges applied indiscriminately (not avatars/logos, which legitimately use `50%`) | `grep -rn "9999px\|borderRadius.*999" src` |
| Generic hero template | Centered headline + subheadline + two CTA buttons + blurred gradient blob background, especially if duplicated near-verbatim elsewhere on the same site | Manual read of landing/home page |
| Blanket hover-elevation | Every single card in the app sharing one global `translateY` + shadow hover rule with no differentiation between interactive and static cards | Check global theme component overrides (e.g. `MuiCard` style overrides) |

### Copy smells

| Smell | Detect |
|---|---|
| Em dash as stylistic tic | `grep -rn "—" src` — check user-facing strings (JSX text, labels, tooltips), not code comments |
| Middle dot separator | `grep -rn "·" src` — inline separator used instead of a colon, dash, or plain words |
| "Not just X, it's Y" / "more than just X" | `grep -rniE "not just|more than just" src` |
| "Whether you're X or Y" | `grep -rniE "whether you" src` |
| Marketing buzzwords | `grep -rniE "unlock|unleash|elevate|empower|supercharge|seamless|leverage|streamline|cutting-edge|game-chang|revolutioniz" src` — exclude literal feature names (e.g. "unlock the season" as a real scheduling action is fine; "unlock your potential" is not) |
| Abstract value-prop talk instead of concrete features | Read hero/about copy: does it describe what the product *does* (concrete) or what pain it *solves* (abstract, generic)? |
| Formulaic bold-lead-in bullets | `- **Word**: sentence.` repeated as a list — distinguish from legitimate data-field labels (e.g. "**Wins:** 8") |
| Rule-of-three padding | Lists or taglines forced into exactly three parallel clauses, especially if the same three-part phrase is duplicated across multiple pages | Read hero/CTA copy across pages for verbatim or near-verbatim repeats |
| "In today's ___ world/landscape" intros | `grep -rniE "in today's" src` |

## Phase 2: Fix

For each confirmed finding:

1. **Dead/unused generic tokens** (a gradient, color, or style defined but never referenced): delete outright. Verify with a repo-wide grep for the token name before removing.
2. **Gradient text / glossy sweeps / glassmorphism**: replace with the plain brand color / a simple solid hover state. Don't invent a new visual effect to replace one smell with another.
3. **Brand-colored gradients that ARE used intentionally** (e.g. a two-tone gradient built from the site's actual primary color): leave alone — the smell is genericness, not gradients as a concept.
4. **Em dashes**: rewrite the sentence with the punctuation that best fits — a colon when introducing something, a comma or "to" for a range, parentheses for an aside, or a period to split into two sentences. Don't mechanically substitute a hyphen everywhere.
5. **Middle dots**: replace with the separator the surrounding UI already uses elsewhere (colon, "•" only if it's the site's existing convention, or plain words).
6. **Duplicated templated marketing phrases**: vary the wording per page instead of repeating the same three-clause tagline verbatim; keep the brand voice but make each instance distinct.
7. After fixing, re-grep to confirm the pattern is gone and run the project's lint/build to confirm nothing broke.

Do not perform a wholesale redesign (e.g. deleting an entire hero section or a card's hover feedback) unless the specific finding calls for it — fix the smell, not the surrounding legitimate design.
