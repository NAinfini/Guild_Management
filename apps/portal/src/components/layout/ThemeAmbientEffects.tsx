import React from 'react';

interface ThemeAmbientEffectsProps {
  theme: string;
  reducedMotion?: boolean;
  motionIntensity?: number;
}

/**
 * ThemeAmbientEffects - Placeholder component
 *
 * All background effects and animations have been removed for performance.
 * This component is kept to maintain API compatibility.
 */
export function ThemeAmbientEffects({
  theme,
  reducedMotion = false,
}: ThemeAmbientEffectsProps) {
  const reducedProfile = reducedMotion ? theme : null;

  return (
    <div
      aria-hidden="true"
      className="theme-ambient-layer"
      data-theme={theme}
      data-ambient-reduced-profile={reducedProfile ?? undefined}
      data-ambient-render-mode="disabled"
      style={{ display: 'none' }}
    >
      {reducedProfile ? (
        <span
          data-ambient-reduced-profile-theme={reducedProfile}
          style={{ display: 'none' }}
        />
      ) : null}
    </div>
  );
}

export default ThemeAmbientEffects;
