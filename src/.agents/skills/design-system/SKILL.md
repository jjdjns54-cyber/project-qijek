---
name: design-system-qoves
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# QOVES

## Mission
Deliver implementation-ready design-system guidance for QOVES that can be applied consistently across marketing site interfaces.

## Brand
- Product/brand: QOVES
- URL: https://www.qoves.com/
- Audience: readers and knowledge seekers
- Product surface: marketing site

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=ppNeueMontreal`, `font.family.stack=ppNeueMontreal, ppNeueMontreal Fallback`, `font.size.base=14px`, `font.weight.base=400`, `font.lineHeight.base=20px`
- Typography scale: `font.size.xs=5.63px`, `font.size.sm=6.75px`, `font.size.md=6.93px`, `font.size.lg=7.88px`, `font.size.xl=9px`, `font.size.2xl=10px`, `font.size.3xl=11.59px`, `font.size.4xl=12px`
- Color palette: `color.text.primary=#ffffff`, `color.text.secondary=#233137`, `color.text.tertiary=#515255`, `color.text.inverse=#758084`, `color.surface.base=#000000`, `color.surface.raised=#fafafa`
- Spacing scale: `space.1=4px`, `space.2=7px`, `space.3=10px`, `space.4=16px`
- Radius/shadow/motion tokens: `radius.xs=7.88px`, `radius.sm=99px` | `motion.duration.instant=300ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
