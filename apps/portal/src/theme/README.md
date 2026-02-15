# Portal Theme Architecture

## Overview

The Guild Management Portal uses a layered CSS architecture that combines:
- **Tailwind CSS** for utility-first styling
- **MUI (Material-UI)** for component library
- **Custom theme system** for 7 unique visual themes with color customization

---

## CSS Loading Order (Critical)

The CSS loads in this specific order to prevent conflicts:

### 1. Base Layer (`index.css`)
```css
@import "tailwindcss" source(".");  /* Tailwind utilities */
@import './theme/layout.css';       /* Layout utilities */
```

- Tailwind base styles and utilities
- Layout utility classes
- CSS custom properties (variables)
- Global resets

### 2. Theme Layer (`theme/presets/index.css`)
```css
/* Component token definitions */
@import './_component-tokens.css';
/* Visual improvements */
@import './_global-improvements.css';
/* Base interactions */
@import './_interactions-base.css';
/* Theme-specific effects */
@import '../effects.css';
/* Individual themes */
@import './neo-brutalism.css';
@import './steampunk.css';
/* ... other themes */
```

- Component tokens (buttons, inputs, cards, etc.)
- Theme-specific styles (Cyberpunk, Royal, Chibi, etc.)
- Control animations
- Theme transitions

### 3. Component Layer (React components)
- MUI component styles (automatically injected)
- Component-specific CSS modules
- Inline sx prop styles (highest specificity)

---

## Key Architectural Principles

### 1. **Avoid Global Selectors**
❌ **Bad:**
```css
* { overflow: visible; }
button { border-radius: 8px; }
input:disabled { opacity: 0.6; }
```

✅ **Good:**
```css
.ui-button { border-radius: var(--shape-button); }
[data-ui="input"]:disabled { opacity: var(--cmp-input-disabled-opacity); }
```

**Why:** Global selectors (`*`, `button`, `input`) override MUI's carefully tuned styles and cause unpredictable cascading issues.

---

### 2. **Minimize `!important` Usage**

Only use `!important` when absolutely necessary (e.g., utility classes that must override everything).

❌ **Bad:**
```css
.layout-full-width {
  max-width: 100% !important;
  margin: 0 !important;
}
```

✅ **Good:**
```css
.layout-full-width {
  max-width: 100%;
  margin: 0;
}
```

**Current Status:** Reduced from 69 to ~20 instances (only where truly needed).

---

### 3. **Use CSS Custom Properties (Variables)**

All colors, spacing, and component styles use CSS variables for theme flexibility.

❌ **Bad:**
```css
.my-button {
  background: #6366f1;
  border-radius: 8px;
}
```

✅ **Good:**
```css
.my-button {
  background: var(--sys-interactive-accent);
  border-radius: var(--cmp-button-radius);
}
```

**Token Categories:**
- `--sys-*` - System tokens (colors, surfaces, borders)
- `--cmp-*` - Component tokens (button, input, card styles)
- `--theme-*` - Theme-specific tokens (motion, shadows, effects)

---

### 4. **Scope Styles by Component**

Use data attributes or class prefixes to scope styles to specific components.

❌ **Bad:**
```css
button:hover { transform: scale(1.05); }
```

✅ **Good:**
```css
[data-ui="button"]:hover:not(:disabled) {
  transform: scale(1.05);
}
```

---

### 5. **Respect Component Ownership**

Each component library "owns" certain aspects:

| Aspect | Owner | How to Customize |
|--------|-------|------------------|
| Layout | Tailwind / MUI Box | Use utility classes or sx prop |
| Component structure | MUI | Use MUI props |
| Theme colors | Theme system | Use CSS variables |
| Animations | Theme presets | Use data-theme attributes |
| Typography | MUI Theme | Use variant prop |

---

## File Structure

```
apps/portal/src/
├── index.css                 # Entry point, imports Tailwind + layout
├── theme/
│   ├── README.md            # This file
│   ├── layout.css           # Layout utilities (grids, containers)
│   ├── effects.css          # Theme effects (disabled for performance)
│   ├── ThemeController.tsx  # Theme state management
│   ├── colors/
│   │   └── color-tokens.css # Color system tokens
│   ├── presets/
│   │   ├── index.css                    # Theme import aggregator
│   │   ├── _component-tokens.css        # Component CSS variables
│   │   ├── _global-improvements.css     # Cross-theme polish (simplified)
│   │   ├── _interactions-base.css       # Base interaction styles
│   │   ├── _control-animations.css      # Theme-specific animations
│   │   ├── _theme-transitions.css       # Theme switching transitions
│   │   ├── _shape-unification.css       # Border-radius standards
│   │   ├── neo-brutalism.css            # Neo-Brutalism theme
│   │   ├── cyberpunk.css                # Cyberpunk theme
│   │   ├── steampunk.css                # Steampunk theme
│   │   ├── royal.css                    # Royal theme
│   │   ├── chibi.css                    # Chibi theme
│   │   ├── minimalistic.css             # Minimalistic theme
│   │   └── post-apocalyptic.css         # Post-Apocalyptic theme
│   └── fx/
│       ├── ThemeFXLayer.tsx             # Advanced visual effects layer
│       └── postFxGates.ts               # Effect quality gating
└── components/
    ├── button/Button.tsx       # Custom button component
    ├── input/Input.tsx         # Custom input component
    └── layout/
        ├── Card.tsx                    # Custom card component
        ├── DecorativeBackground.tsx    # Background effects
        └── ThemeAmbientEffects.tsx     # Ambient animations (disabled)
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Layout Breaking
**Symptom:** Content overlaps, margins collapse, or pages look "squished"

**Cause:** Global CSS rules overriding MUI's layout system

**Solution:**
- Remove global rules like `#main-content > div > * { max-width: 100% !important; }`
- Let pages manage their own constraints
- Use layout utility classes (`.layout-standard`, `.layout-wide`) explicitly

---

### Pitfall 2: Styles Not Applying
**Symptom:** Custom styles don't show up or get overridden

**Cause:** CSS specificity issues (MUI styles have higher specificity)

**Solution:**
- Use `sx` prop for MUI components (highest specificity)
- Use data attributes instead of classes
- Check CSS loading order in browser DevTools

---

### Pitfall 3: Theme Colors Not Working
**Symptom:** Colors don't change when switching themes

**Cause:** Hardcoded colors instead of CSS variables

**Solution:**
```tsx
// ❌ Bad
<Box sx={{ background: '#6366f1' }} />

// ✅ Good
<Box sx={{ background: 'var(--sys-interactive-accent)' }} />
```

---

### Pitfall 4: Effects Not Rendering
**Symptom:** Animations or visual effects missing

**Cause:** Effects disabled for performance or incorrect data attributes

**Solution:**
1. Check if effects are enabled: `ThemeController.tsx` → `fxOff` state
2. Verify component has `data-theme` attribute
3. Check `ThemeFXLayer.tsx` for quality gating rules

---

## Debugging CSS Issues

### Step 1: Check Loading Order
```bash
# Build and check for CSS warnings
npm run build --workspace=apps/portal
```

Look for warnings like:
- `@import must precede all other statements`
- PostCSS errors

### Step 2: Inspect in Browser
1. Open DevTools → Elements
2. Select the broken element
3. Check "Computed" tab to see which styles won
4. Look for crossed-out styles (overridden)

### Step 3: Check Specificity
```css
/* Specificity score: 0-0-1 */
.button { }

/* Specificity score: 0-1-0 */
#main-button { }

/* Specificity score: 0-1-1 */
[data-ui="button"] { }

/* Specificity score: 0-2-1 */
.MuiButton-root.MuiButton-contained { }
```

MUI uses high-specificity selectors. To override:
- Use `sx` prop (always wins)
- Use equally specific selectors
- Use `data-*` attributes

### Step 4: Check CSS Variables
```javascript
// In browser console
getComputedStyle(document.documentElement).getPropertyValue('--sys-interactive-accent')
```

---

## Making Changes Safely

### Before Editing CSS:

1. **Read this README** - Understand the architecture
2. **Check Knowledge_Base.md** - Follow established patterns
3. **Identify scope** - Component-specific or global?
4. **Build first** - Ensure clean state

### When Adding Styles:

1. **Use CSS variables** - Don't hardcode colors
2. **Scope appropriately** - Target specific components
3. **Test all themes** - Switch themes in UI
4. **Check responsive** - Test mobile, tablet, desktop

### After Changes:

1. **Build** - `npm run build --workspace=apps/portal`
2. **Test visually** - Check all 7 themes + 15 colors
3. **Check console** - No errors or warnings
4. **Document** - Update Knowledge_Base.md if fixing a bug

---

## Theme System Variables

### System Tokens (`--sys-*`)

| Variable | Purpose | Example |
|----------|---------|---------|
| `--sys-surface-base` | Base background | `#0a0a0f` (dark mode) |
| `--sys-surface-panel` | Cards, panels | `#14141a` |
| `--sys-surface-elevated` | Modals, popovers | `#1e1e24` |
| `--sys-text-primary` | Main text | `#ffffff` |
| `--sys-text-secondary` | Subtle text | `#a0a0b0` |
| `--sys-interactive-accent` | Buttons, links | Theme color (e.g., cyan for Cyberpunk) |
| `--sys-border-default` | Standard borders | `rgba(255,255,255,0.1)` |
| `--sys-border-strong` | Emphasized borders | `rgba(255,255,255,0.2)` |

### Component Tokens (`--cmp-*`)

| Variable | Purpose | Example |
|----------|---------|---------|
| `--cmp-button-radius` | Button border-radius | `8px` |
| `--cmp-card-radius` | Card border-radius | `12px` |
| `--cmp-input-radius` | Input border-radius | `8px` |
| `--cmp-card-shadow` | Card shadow | `0 4px 12px rgba(0,0,0,0.2)` |

### Theme Tokens (`--theme-*`)

| Variable | Purpose | Example |
|----------|---------|---------|
| `--theme-motion-fast` | Fast animations | `180ms` |
| `--theme-motion-medium` | Medium animations | `280ms` |
| `--theme-motion-slow` | Slow animations | `400ms` |
| `--theme-motion-easing` | Easing function | `cubic-bezier(0.4, 0, 0.2, 1)` |

---

## Performance Considerations

### What's Disabled:
- Background ambient effects (removed for performance)
- Continuous RAF loops (replaced with CSS animations)
- Heavy particle systems

### What's Enabled:
- Theme-specific control animations (hover, focus, active)
- Theme color transitions (when switching themes)
- Minimal decorative gradients (static, no JS)

### Best Practices:
- Use `will-change` sparingly (only during animation)
- Prefer CSS transforms over layout properties
- Use `requestAnimationFrame` for JS animations
- Debounce/throttle expensive operations

---

## Additional Resources

- [Knowledge_Base.md](../../../../Knowledge_Base.md) - Engineering patterns & rules
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Utility classes
- [MUI Theming](https://mui.com/material-ui/customization/theming/) - Component customization
- CSS Specificity Calculator: https://specificity.keegan.st/

---

## Questions?

If you're unsure about:
- **CSS loading order** → Check this README's "CSS Loading Order" section
- **Token usage** → Check "Theme System Variables" section
- **Conflicts** → Check "Common Pitfalls & Solutions" section
- **Architecture patterns** → Check Knowledge_Base.md
