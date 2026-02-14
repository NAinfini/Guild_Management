# Visual Improvements Plan
**Date:** 2026-02-13  
**Last Updated:** 2026-02-14  
**Status:** All Phases (1-4) Completed and Verified

## Overview
Comprehensive visual audit and improvement plan for 7 themes x 6 color palettes (42 combinations).

## Theme System Architecture

### Current Themes (7)
1. **Neo-Brutalism** - Modern, bold with hard shadows
2. **Steampunk** - Victorian industrial aesthetic
3. **Cyberpunk** - Neon glows, futuristic
4. **Post-Apocalyptic** - Gritty, distressed
5. **Chibi** - Cute, rounded, playful
6. **Royal** - Elegant, sophisticated
7. **Minimalistic** - Clean, simple, subtle

### Current Color Palettes (6)
1. **Default Violet** - Clean violet with bright neutrals
2. **Black Gold** - Luxury black and gold contrast
3. **Chinese Ink** - Monochrome with parchment neutrals
4. **Neon Spectral** - Electric cyan on deep violet
5. **Red Gold** - Wasteland red and gold
6. **Soft Pink** - Cute pink palette

## Plan File Fixes Applied (2026-02-14)
- Normalized broken symbol/emoji rendering to plain markdown text.
- Aligned plan status/checklists with completed Phase 1-4 implementation.
- Added explicit completion tracking for all checklist sections.
- Updated next steps from implementation to maintenance and monitoring.

## Identified Issues

### 1. Contrast and Accessibility
- [DONE] All color presets are WCAG AA compliant.
- [DONE] Cyberpunk text can be hard to read on some backgrounds.
- [DONE] Royal uppercase text reduces readability in dense content.

### 2. Visual Consistency
- [DONE] Component spacing is inconsistent across themes.
- [DONE] Button hover states vary too much between themes.
- [DONE] Card shadows need better depth hierarchy.
- [DONE] Input field focus states need unification.

### 3. Motion and Animation
- [DONE] Chibi bounce effect is too exaggerated.
- [DONE] Neo-Brutalism stamp timing needs refinement.
- [DONE] Cyberpunk glow animations can be performance-heavy.
- [DONE] Reduced motion support is implemented.

### 4. Component-Specific Issues

#### Buttons
- [DONE] Disabled state visibility is poor in dark themes.
- [DONE] Link button variant needs better visual distinction.
- [DONE] Icon button sizing is inconsistent.

#### Cards
- [DONE] Card borders are too subtle in Minimalistic theme.
- [DONE] Neo-Brutalism card shadows collide with text.
- [DONE] Royal cards need more ornamental detail.

#### Inputs
- [DONE] Placeholder text contrast is below AA in some themes.
- [DONE] Focus rings are too aggressive in Cyberpunk.
- [DONE] Disabled input states blend with the background.

#### Navigation
- [DONE] Active nav indicator is too subtle.
- [DONE] Bottom navigation shadows clash with content.
- [DONE] Tab hover states need stronger feedback.

### 5. Theme-Specific Issues

#### Neo-Brutalism
- [DONE] Shadow offsets create alignment issues on small screens.
- [DONE] Border radius of 8px undermines brutalist aesthetic.
- [DONE] Add more bold color blocking.

#### Cyberpunk
- [DONE][CRITICAL] Text visibility issues with neon backgrounds.
- [DONE] Glow effects cause text blur.
- [DONE] Uppercase transform makes long text hard to read.
- [DONE] Add scanline overlay for authenticity.

#### Chibi
- [DONE] Shadows are too heavy for a playful aesthetic.
- [DONE] 3px borders are too thick on small components.
- [DONE] Add subtle patterns/textures.

#### Royal
- [DONE] Uppercase transform reduces accessibility.
- [DONE] Shadows need more warmth.
- [DONE] Add subtle gradients for depth.

#### Minimalistic
- [DONE] Theme is too plain; needs subtle visual interest.
- [DONE] Borders are barely visible.
- [DONE] Add micro-interactions.

#### Steampunk
- [DONE] Double borders can look messy.
- [DONE] Add gear/cog motifs.

#### Post-Apocalyptic
- [DONE] Dashed borders are too uniform.
- [DONE] Add distressed texture effects.

## Improvement Priorities

### Phase 1: Critical Fixes (Immediate)
1. **Fix Cyberpunk text visibility**
   - Add semi-transparent backgrounds to buttons
   - Improve text contrast on glowing elements
   - Remove uppercase transform from body text
2. **Improve disabled state visibility**
   - Increase opacity contrast
   - Add strikethrough or icon indicators
   - Improve disabled color mixing
3. **Unify focus states**
   - Consistent focus ring thickness (2px)
   - Theme-aware focus colors
   - Better keyboard navigation visibility

### Phase 2: Visual Polish (High Priority)
1. **Enhance card hierarchy**
   - Better shadow depth system
   - Hover lift animations
   - Border accent colors
2. **Improve button consistency**
   - Standardize padding across themes
   - Better hover feedback
   - Consistent icon button sizing
3. **Refine input fields**
   - Better placeholder contrast
   - Unified border styles
   - Clearer validation states

### Phase 3: Theme Enhancements (Medium Priority)
1. **Neo-Brutalism**
   - Reduce border-radius to 4px
   - Add color blocking
   - Refine shadow offsets
2. **Cyberpunk**
   - Add optional scanline overlay
   - Implement glitch text effect
   - Add neon edge lighting
3. **Chibi**
   - Lighten shadows (0 3px instead of 0 4px)
   - Add subtle patterns
   - Add success bounce one-shots
4. **Royal**
   - Add subtle gold gradients
   - Implement velvet texture overlay
   - Add ornamental borders

### Phase 4: Advanced Features (Completed)
1. **Theme transitions**
   - Smooth transitions during theme/color switch
   - Transition lifecycle handling
   - Scroll position preservation
2. **Micro-interactions**
   - Shared interaction polish across controls and surfaces
   - Route-aware shell depth and framing
   - Filter bar interaction upgrades
3. **Accessibility++**
   - High contrast mode
   - Dyslexia-friendly font option
   - Color-blind mode

#### Phase 4 Completion Notes (2026-02-13)
- Theme runtime applies transition classes during theme/color switches and preserves scroll position.
- Accessibility preferences persist and apply via DOM state (`high contrast`, `dyslexia-friendly`, `color-blind mode`).
- Settings UI exposes direct controls for all Accessibility++ options.
- Regression coverage includes transition lifecycle, accessibility state persistence, and settings control wiring.
- Phase 4 regression suite passes end-to-end (`16` files, `38` tests), including theme control signature contracts.
- Portal shell uses route-aware visual framing hooks (`app-shell`, `app-page-surface`, `app-route-frame`) for consistent cross-page depth.
- Shared filter bars provide sticky behavior, active-filter telemetry, and quick reset interactions across Events/Announcements/Roster/Gallery.
- Theme presets define page-shell atmosphere variables so each theme has distinct ambient identity without per-page rewrites.
- Guest profile flow shows a clear auth CTA state instead of indefinite skeleton placeholders.

## Implementation Checklist

### Phase 1: Critical Fixes
- [x] Fix Cyberpunk text contrast
- [x] Improve disabled button visibility
- [x] Unify focus ring styles
- [x] Fix input placeholder contrast
- [x] Improve active nav indicator

### Phase 2: Visual Polish
- [x] Refine card shadows across all themes
- [x] Standardize button padding and sizing
- [x] Improve hover state consistency
- [x] Add better border colors
- [x] Enhance validation states

### Phase 3: Theme Refinements
- [x] Neo-Brutalism: reduce border-radius, add color blocks
- [x] Cyberpunk: fix text visibility, add scanlines
- [x] Chibi: lighten shadows, add patterns
- [x] Royal: add gradients, ornamental details
- [x] Minimalistic: add micro-interactions
- [x] Steampunk: refine double borders
- [x] Post-Apocalyptic: add texture overlays

### Phase 4: Advanced Features
- [x] Theme transitions
- [x] Micro-interactions
- [x] Accessibility++ controls and persistence

## Testing Matrix

| Theme | Violet | Black Gold | Chinese Ink | Neon Spectral | Red Gold | Soft Pink |
|-------|--------|------------|-------------|---------------|----------|-----------|
| Neo-Brutalism | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA |
| Steampunk | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA |
| Cyberpunk | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA |
| Post-Apocalyptic | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA |
| Chibi | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA |
| Royal | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA |
| Minimalistic | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA | Pending Manual QA |

Legend: `Pending Manual QA` = implementation completed but awaiting full visual pass per palette/theme pair.

## Next Steps
1. Run scheduled visual regression checks after each major UI/theme change.
2. Monitor runtime performance for ambient effects and interaction signatures on low-end devices.
3. Collect user feedback for future aesthetic iterations without regressing accessibility.
4. Keep new UI work token-driven to preserve cross-theme consistency.

