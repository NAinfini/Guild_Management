# Animation Quick Reference Guide

Quick reference for all theme-specific animations and how to use them in the Guild Management portal.

---

## Button Animations

### Cyberpunk Theme
```tsx
<Button>Cyberpunk Button</Button>
// Hover: Glitch effect (±2px translation, 200ms)
// Focus: Neon pulse (8-24px glow, 1.5s infinite)
```

### Neo-Brutalism Theme
```tsx
<Button>Neo Button</Button>
// Click: Stamp in (scale 1.05→1, rotate 0.5deg→0, 140ms)
// Shadow: 3px→6px on press
```

### Royal Theme
```tsx
<Button>Royal Button</Button>
// Hover: Shimmer sweep (linear gradient, 800ms)
// Press: Velvet effect
```

### Chibi Theme
```tsx
<Button>Chibi Button</Button>
// Click: Bounce (-3px→+1px→-1px→0, 320ms)
// Success event: Add data-success-event="true"
```

### Minimalistic Theme
```tsx
<Button>Minimalistic Button</Button>
// Click: Ripple from center (scale 0→2.5, 500ms)
// Hover: Letter spacing expansion
```

### Steampunk Theme
```tsx
<Button>Steampunk Button</Button>
// Click: Steam puff (rises 20px, 600ms)
// Hover: Continuous steam rise
```

### Post-Apocalyptic Theme
```tsx
<Button>Wasteland Button</Button>
// Click: Dust shake (±2px vibration, 300ms)
// Impact event: Add data-glow-event="true"
```

---

## Input Field Animations

### Focus Animations by Theme

**Cyberpunk**: Scan line sweep (vertical gradient, 800ms)
```tsx
<Input placeholder="Cyberpunk input" />
```

**Neo-Brutalism**: Stamp in (border 4px→3px, 160ms)
```tsx
<Input placeholder="Neo input" />
```

**Royal**: Golden glow expansion (0→4px glow, 320ms)
```tsx
<Input placeholder="Royal input" />
```

**Chibi**: Pop in (scale 0.98→1.02→1, 240ms)
```tsx
<Input placeholder="Chibi input" />
```

**Minimalistic**: Underline sweep (bottom border, 300ms)
```tsx
<Input placeholder="Minimalistic input" />
```

**Steampunk**: Pressure build (shadow oscillation, 400ms)
```tsx
<Input placeholder="Steampunk input" />
```

**Post-Apocalyptic**: Crack spread (radial gradient, 240ms)
```tsx
<Input placeholder="Wasteland input" />
```

---

## Checkbox Animations

### Check Animations by Theme

**Cyberpunk**: Digital flicker (opacity pulse, 160ms)
**Neo-Brutalism**: Stamp check (scale 0→1.2→1, rotate, 220ms)
**Royal**: Elegant fade-in (opacity + scale, 280ms)
**Chibi**: Bouncy check (scale 0→1.3→0.9→1.1→1, 360ms) ⭐ Most playful
**Minimalistic**: Smooth scale (0→1, 200ms)
**Steampunk**: Gear rotation (rotate -90deg→0, 340ms)
**Post-Apocalyptic**: Rusty check (rotate + brightness shift, 260ms)

```tsx
<Checkbox />
// Automatically uses theme-specific animation on check/uncheck
```

---

## Switch Animations

### Toggle Animations by Theme

**Cyberpunk**: Electric arc (glow pulse, 180ms)
**Neo-Brutalism**: Clunk slide (translateX with bounce, 200ms)
**Royal**: Smooth glide with glow (shadow upgrade, 280ms)
**Chibi**: Wiggle toggle (rotate ±5deg, 300ms)
**Minimalistic**: Linear transition (240ms, smooth)
**Steampunk**: Mechanical ratchet (stepped animation, 280ms, 4 steps)
**Post-Apocalyptic**: Jerky slide (irregular timing, 320ms)

```tsx
<Switch />
// Automatically uses theme-specific animation on toggle
```

---

## Slider Animations

Sliders have complex theme-specific styling already implemented in [Slider.tsx](apps/portal/src/components/input/Slider.tsx#L226-L231):

```tsx
<Slider
  min={0}
  max={100}
  value={value}
  onChange={handleChange}
/>
// Theme-specific attributes:
// - data-neo-segmented-slider (Neo-Brutalism)
// - data-royal-glass-orb (Royal)
// - data-minimal-slider-orbit (Minimalistic)
// - data-chibi-candy-tube (Chibi)
// - data-wasteland-metal-thumb (Post-Apocalyptic)
```

---

## Card Animations

### Hover Effects by Theme

**Cyberpunk**: Scan line (vertical gradient sweep, 600ms)
```tsx
<Card>Cyberpunk Card</Card>
```

**Neo-Brutalism**: Lift shadow (3px→5px, translateY -2px, 160ms)
```tsx
<Card>Neo Card</Card>
```

**Royal**: Shimmer reveal (gradient sweep, 800ms)
```tsx
<Card>Royal Card</Card>
```

**Chibi**: Gentle float (±4px vertical, 600ms infinite) ⭐ Continuous
```tsx
<Card>Chibi Card</Card>
```

**Minimalistic**: Subtle lift (-2px, shadow upgrade, 200ms)
```tsx
<Card>Minimalistic Card</Card>
```

**Steampunk**: Steam rise (continuous, inherited)
```tsx
<Card>Steampunk Card</Card>
```

**Post-Apocalyptic**: Dust settle (radial gradient pulse, 800ms)
```tsx
<Card>Wasteland Card</Card>
```

---

## Tab Animations

Each theme has unique tab selection and indicator animations:

**Cyberpunk**: Digital transition (blur + slide, 200ms)
**Neo-Brutalism**: Bold underline slide (scaleX 0→1, 240ms)
**Royal**: Elegant glow (text-shadow, 320ms)
**Chibi**: Pop select (scale 1→1.08→1, 280ms)
**Minimalistic**: Smooth fade (opacity 0.6→1, 200ms)
**Steampunk**: Mechanical click (translateY bounce, 180ms)
**Post-Apocalyptic**: Rough transition (shake effect, 280ms)

```tsx
<Tabs value={activeTab} onChange={handleChange}>
  <Tab label="Tab 1" />
  <Tab label="Tab 2" />
</Tabs>
```

---

## Theme Transitions

### Smooth Theme Switching

Automatically applied when theme changes:

```typescript
// Theme change triggers smooth transition
setTheme('cyberpunk'); // 600ms color morph + overlay fade
```

**Features**:
- Color morphing via CSS @property
- 30% opacity overlay during transition
- Stagger animations for child elements (50ms delays)
- Scroll position preserved
- Loading indicator for long transitions

**Manual Control**:
```typescript
// Show transition overlay
document.body.classList.add('theme-transitioning');

// After 600ms
setTimeout(() => {
  document.body.classList.remove('theme-transitioning');
}, 600);
```

---

## Theme Customization

### Setting Custom Values

```javascript
// Adjust saturation (0.0 - 2.0)
document.documentElement.style.setProperty('--custom-saturation', '1.2');

// Adjust animation speed (0.0 - 2.0)
document.documentElement.style.setProperty('--custom-animation-speed', '0.8');

// Adjust pattern intensity (0.0 - 2.0)
document.documentElement.style.setProperty('--custom-pattern-intensity', '1.5');

// Adjust shadow intensity (0.0 - 2.0)
document.documentElement.style.setProperty('--custom-shadow-intensity', '1.3');

// Adjust border intensity (0.0 - 2.0)
document.documentElement.style.setProperty('--custom-border-intensity', '1.2');
```

### Preset Levels

```javascript
// Set customization level
document.documentElement.setAttribute('data-customization-level', 'intense');
// Options: 'minimal', 'moderate', 'intense'
```

**Preset Effects**:
- **Minimal**: 70% saturation, 30% patterns, 50% speed, 50% shadows
- **Moderate**: 100% all (default)
- **Intense**: 130% saturation, 120% patterns, 150% speed, 130% shadows

### Motion Preferences

```javascript
// Set motion preference
document.documentElement.setAttribute('data-motion-preference', 'enhanced');
// Options: 'none', 'reduced', 'standard', 'enhanced'
```

**Effects**:
- **None**: All animations disabled
- **Reduced**: 50% speed, minimal movement
- **Standard**: 100% (default)
- **Enhanced**: 150% speed, amplified effects

---

## Context-Aware Features

### Time-Based Theming

```javascript
// Auto-detect time of day
const hour = new Date().getHours();
const mode =
  hour < 6 ? 'night' :
  hour < 12 ? 'morning' :
  hour < 18 ? 'afternoon' : 'evening';

document.documentElement.setAttribute('data-time-mode', mode);
```

**Effects**:
- **Morning**: +10% saturation, +5% brightness
- **Afternoon**: Standard
- **Evening**: Warmer tint (sepia 8%)
- **Night**: Blue light reduction (sepia 15%, -25% saturation)

### Event-Based Accents

```javascript
// Set event type for contextual styling
document.documentElement.setAttribute('data-event-type', 'war');
// Options: 'war', 'raid', 'social', 'training'

document.documentElement.setAttribute('data-event-urgency', 'critical');
// Options: 'critical', 'high', 'medium', 'low'
```

**Effects**:
- **War**: Red accent (#ff4444)
- **Raid**: Purple accent (#8844ff)
- **Social**: Green accent (#44ff88)
- **Training**: Orange accent (#ffaa44)

**Urgency**:
- **Critical**: Pulsing animation
- **High**: 4px accent left border
- **Medium**: 2px accent left border (60% opacity)

### Activity Level

```javascript
// Track user activity
document.documentElement.setAttribute('data-activity-level', 'high');
// Options: 'high', 'normal', 'idle'
```

**Effects**:
- **High**: 130% animation speed, 120% patterns
- **Normal**: 100% (default)
- **Idle**: 70% speed, 60% patterns, 85% saturation

### Battery Saver Mode

```javascript
// Enable battery saving
document.documentElement.setAttribute('data-battery-saver', 'true');
```

**Effects**:
- 30% animation speed
- 20% pattern intensity
- 50% shadow intensity
- Disables ::before/::after pseudo-elements
- Removes all non-critical animations

---

## Accessibility Features

### High Contrast Mode

```javascript
document.documentElement.setAttribute('data-high-contrast', 'true');
```

**Effects**:
- 130% contrast
- 140% saturation
- 150% border thickness
- 4px focus rings

### Large Text Mode

```javascript
document.documentElement.setAttribute('data-large-text', 'true');
```

**Effects**:
- 125% font scale
- 120% line-height

### Dyslexia-Friendly Mode

```javascript
document.documentElement.setAttribute('data-dyslexia-friendly', 'true');
```

**Effects**:
- OpenDyslexic font family
- +0.05em letter spacing
- 130% line-height

### Reduced Motion

Automatically respects system preferences:

```css
@media (prefers-reduced-motion: reduce) {
  /* All animations disabled */
}
```

**Manual Override**:
```javascript
document.documentElement.setAttribute('data-motion-mode', 'off');
// Options: 'off', 'toned-down', 'standard'
```

---

## Performance Tips

### GPU Acceleration

All animations use GPU-accelerated properties:
- `transform` ✅ (GPU)
- `opacity` ✅ (GPU)
- ❌ Avoid: `width`, `height`, `top`, `left`, `margin`, `padding`

### will-change Management

Automatically applied on hover, removed when not needed:

```css
.ui-button:hover {
  will-change: transform, opacity;
}

.ui-button:not(:hover) {
  will-change: auto; /* Reset for performance */
}
```

### Containment

Cards and complex components use CSS containment:

```css
.ui-card {
  contain: layout style paint; /* Limits repaints */
}
```

### Mobile Optimization

Automatically applied on mobile:
- 70% animation duration
- Simplified shadows
- Reduced overlay opacity

---

## Common Patterns

### Success Feedback

```tsx
const [success, setSuccess] = useState(false);

<Button
  onClick={() => {
    // Perform action
    setSuccess(true);
    setTimeout(() => setSuccess(false), 300);
  }}
  data-success-event={success}
>
  Submit
</Button>
```

### Impact Feedback (Destructive Actions)

```tsx
const [impact, setImpact] = useState(false);

<Button
  variant="destructive"
  onClick={() => {
    setImpact(true);
    setTimeout(() => setImpact(false), 300);
    // Perform delete
  }}
  data-glow-event={impact}
>
  Delete
</Button>
```

### Loading States

```tsx
<div className="theme-loading show">
  Switching theme...
</div>
```

### Preference Saved Toast

```tsx
<div data-preferences-saved="true">
  {/* Toast appears automatically */}
</div>
```

---

## Debugging

### Check Current Theme

```javascript
const theme = document.documentElement.getAttribute('data-theme');
console.log('Current theme:', theme);
```

### Check Animation Performance

```javascript
// Open DevTools → Performance tab
// Record interaction
// Check for:
// - 60fps frame rate
// - GPU acceleration (green layers)
// - No layout thrashing
```

### Verify Reduced Motion

```javascript
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
console.log('Reduced motion:', reducedMotion);
```

### Check Custom Properties

```javascript
const root = document.documentElement;
const saturation = getComputedStyle(root).getPropertyValue('--custom-saturation');
const speed = getComputedStyle(root).getPropertyValue('--custom-animation-speed');
console.log('Saturation:', saturation, 'Speed:', speed);
```

---

## Best Practices

1. **Always respect reduced motion** - Check before triggering animations
2. **Use GPU properties** - Transform and opacity only
3. **Clean up timers** - Clear timeouts on unmount
4. **Test on mobile** - Verify performance on low-end devices
5. **Provide alternatives** - Ensure functionality without animations
6. **Monitor performance** - Keep animations at 60fps
7. **Use theme-specific data attributes** - Let CSS handle theme differences
8. **Avoid animation conflicts** - One animation per element at a time

---

## Reference Links

- [Button Component](apps/portal/src/components/button/Button.tsx)
- [Input Component](apps/portal/src/components/input/Input.tsx)
- [Slider Component](apps/portal/src/components/input/Slider.tsx)
- [Checkbox Component](apps/portal/src/components/input/Checkbox.tsx)
- [Switch Component](apps/portal/src/components/input/Switch.tsx)
- [Card Component](apps/portal/src/components/layout/Card.tsx)
- [Control Animations](apps/portal/src/theme/presets/_control-animations.css)
- [Theme Transitions](apps/portal/src/theme/presets/_theme-transitions.css)
- [Customization System](apps/portal/src/theme/presets/_theme-customization.css)
- [Context-Aware Theming](apps/portal/src/theme/presets/_context-aware-theming.css)
- [Performance Optimizations](apps/portal/src/theme/presets/_performance-optimizations.css)
