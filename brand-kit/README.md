# DOODEE Brand Kit

Version 1.0 · 12 August 2026

## Brand intent

DOODEE helps people understand facial structure, explore possible treatment directions and improve with intention. The brand must feel like a calm analytical instrument, not a beauty-rating app or clinic advertisement.

## Personality

- Precise: measurements and explanations are specific.
- Calm: generous space, quiet surfaces and controlled motion.
- Premium: refined typography and disciplined details.
- Respectful: appearance is never treated as human worth.

## Visual direction

Reference: Apple-like restraint combined with FaceIQ-style analytical clarity. The interface is light-only. White and ice-blue fields create depth; near-black anchors hierarchy; electric blue appears only where it carries meaning.

## Core palette

| Role        | Token              |                   Value | Use                               |
| ----------- | ------------------ | ----------------------: | --------------------------------- |
| Canvas      | `--dd-canvas`      |               `#FFFFFF` | Main page background              |
| Ice         | `--dd-ice`         |               `#F7FBFF` | Quiet sections and panels         |
| Ice strong  | `--dd-ice-strong`  |               `#EDF4FC` | Hero and treatment fields         |
| Surface     | `--dd-surface`     | `rgba(255,255,255,.84)` | Functional glass surfaces         |
| Ink         | `--dd-ink`         |               `#0B0E14` | Headlines, primary CTA            |
| Text        | `--dd-text`        |               `#111116` | Body and controls                 |
| Muted       | `--dd-muted`       |               `#5B6778` | Supporting copy                   |
| Line        | `--dd-line`        |    `rgba(11,14,20,.10)` | Dividers and boundaries           |
| Blue        | `--dd-blue`        |               `#087BFF` | Focus, analysis and active states |
| Blue strong | `--dd-blue-strong` |               `#0064E8` | Active/high-contrast blue         |
| Blue soft   | `--dd-blue-soft`   |               `#E7F2FF` | Selected and analytical tint      |
| Teal        | `--dd-teal`        |               `#45C8C0` | Balanced metric region only       |

Purple, magenta, warm beige, gold and saturated clinic-green must not be introduced.

## Typography

- Family: Manrope, then Apple system fonts and Segoe UI.
- Display: 64–88px desktop, 48–60px tablet, 42–52px mobile.
- Section title: 44–64px.
- Lead: 18–19px with 1.65–1.7 line height.
- Body: 16px with 1.6 line height.
- UI: 13–15px.
- Small supporting labels must not go below 12px.
- Display tracking must stay between `-0.04em` and `-0.025em`.
- Sentence case is the default. Uppercase is reserved for rare, short labels.

## Spacing and layout

- Base spacing unit: 4px.
- Use the sequence 4, 8, 12, 16, 24, 32, 48, 64, 96 and 128px.
- Main content width: 1180px.
- Product demonstration width: 980px.
- Sections should use 112–160px vertical space on desktop and 72–96px on mobile.
- Each viewport should have one dominant idea.
- Prefer open compositions and dividers over repeated card grids.

## Shape and depth

- Controls: full pill or 8px radius.
- Cards: 12–16px radius.
- Large product frames: 16–22px radius.
- Do not use card radii above 22px.
- Shadows must be cool, low-opacity and shallow.
- Do not pair a decorative wide shadow with a visible one-pixel border.
- Glass surfaces should use white at 66–90% opacity with 18–22px backdrop blur.

## Components

### Navigation

- Fixed, centered and translucent white.
- It should shrink after scrolling while all links remain usable.
- Primary CTA is near-black with white text.

### Buttons

- Primary: near-black pill, white label and arrow.
- Secondary: white translucent pill with near-black label.
- Hover should be a small tonal shift or maximum 2px lift.
- Focus-visible must use a 3px blue outline with 4px offset.

### Analysis UI

- Analysis lines use white with a blue optical shadow over photography.
- Nodes use blue with a white edge.
- Metric scales place the preferred reference band at the center.
- Scores must be framed as proportional alignment, never personal worth.

### Treatment preview

- Background is an ice-blue field.
- Before/preview comparison must preserve identity and unchanged regions.
- Procedure selection uses real image crops or clear anatomical imagery.
- Copy must state that results vary and simulation is illustrative.

## Imagery

- Use natural, high-resolution frontal or profile portraits.
- Preserve pores, hair strands, asymmetry and ambient lighting.
- Avoid waxy skin, glam retouching, beauty filters and synthetic AI sheen.
- Facial overlays must align to visible anatomy.
- Treatment edits must use feathered regional masks; unrelated features and color must remain pixel-stable.

## Motion

- Use 240–700ms ease-out motion.
- Marquee cycle: 28–30 seconds.
- Avoid bounce and elastic easing.
- Every animation must have a reduced-motion fallback.

## Accessibility

- Text contrast must meet WCAG 2.2 AA.
- All controls must work by keyboard, pointer and touch.
- Focus indicators must always remain visible.
- Touch targets must be at least 44×44px.
- The page must remain usable at 200% zoom.

## Voice

- Concise, calm, direct and evidence-aware.
- Preferred: “Understand your facial structure.”
- Preferred: “Explore an illustrative treatment preview.”
- Avoid: “Fix your flaws.”
- Avoid: “Get the perfect face.”
- Avoid guarantees, diagnoses and unsupported social proof.

## QA checklist

- [ ] Light-only palette with no purple or warm beige.
- [ ] Manrope is loaded and used consistently.
- [ ] Primary CTA is near-black and readable.
- [ ] Body text is at least 16px; supporting labels at least 12px.
- [ ] Spacing follows the shared scale.
- [ ] Cards do not exceed 22px radius.
- [ ] Focus-visible, hover, active, disabled, loading and error states exist.
- [ ] Motion respects reduced-motion.
- [ ] Facial overlays align with anatomy.
- [ ] Treatment previews preserve unrelated pixels and color.
- [ ] Claims are specific, respectful and non-diagnostic.
