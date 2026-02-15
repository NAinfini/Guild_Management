import React, { forwardRef } from 'react';

/**
 * Subpath shim for @/ui-bridge/material/Slider.
 * Exposes a semantic range input while preserving basic MUI-like callback signatures.
 */

type AnyProps = Record<string, any>;

const toStyleObject = (sx: any): React.CSSProperties => {
  if (!sx) return {};
  if (Array.isArray(sx)) return Object.assign({}, ...sx.filter((s) => s && typeof s === 'object'));
  if (typeof sx === 'object') return sx as React.CSSProperties;
  return {};
};

const toNumericValue = (raw: unknown, fallback: number): number => {
  if (Array.isArray(raw)) {
    const first = raw[0];
    const num = Number(first);
    return Number.isFinite(num) ? num : fallback;
  }
  const num = Number(raw);
  return Number.isFinite(num) ? num : fallback;
};

const Slider = forwardRef<HTMLInputElement, AnyProps>(function Slider(props, ref) {
  const {
    className,
    style,
    sx,
    value,
    defaultValue,
    min = 0,
    max = 100,
    step = 1,
    disabled,
    onChange,
    onChangeCommitted,
    onMouseDown,
    onMouseUp,
    onBlur,
    ...rest
  } = props || {};

  const controlled = value !== undefined;
  const resolvedValue = toNumericValue(controlled ? value : defaultValue, Number(min));
  const range = Math.max(Number(max) - Number(min), 1);
  const progress = Math.max(0, Math.min(1, (resolvedValue - Number(min)) / range));

  const rootProps: AnyProps = {};
  const inputA11yProps: AnyProps = {};

  for (const [key, val] of Object.entries(rest)) {
    if (
      key.startsWith('aria-') ||
      key === 'id' ||
      key === 'name' ||
      key === 'tabIndex' ||
      key === 'title'
    ) {
      inputA11yProps[key] = val;
    } else {
      rootProps[key] = val;
    }
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const next = Number(event.currentTarget.value);
    onChange?.(event, next, 0);
  };

  const commitValue = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const target = event.currentTarget;
    const next = Number(target.value);
    onChangeCommitted?.(event, next);
  };

  const handleMouseUp: React.MouseEventHandler<HTMLInputElement> = (event) => {
    commitValue(event);
    onMouseUp?.(event);
  };

  const handleKeyUp: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    commitValue(event);
  };

  return React.createElement(
    'div',
    {
      ...rootProps,
      className: ['MuiSlider-root', className, disabled ? 'Mui-disabled' : null].filter(Boolean).join(' '),
      style: {
        position: 'relative',
        display: 'inline-flex',
        width: '100%',
        alignItems: 'center',
        ...toStyleObject(sx),
        ...(style || {}),
      },
    },
    React.createElement('span', {
      'aria-hidden': true,
      className: 'MuiSlider-rail',
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 4,
        borderRadius: 999,
        background: 'color-mix(in srgb, currentColor 28%, transparent)',
      },
    }),
    React.createElement('span', {
      'aria-hidden': true,
      className: 'MuiSlider-track',
      style: {
        position: 'absolute',
        left: 0,
        height: 4,
        borderRadius: 999,
        width: `${progress * 100}%`,
        background: 'currentColor',
      },
    }),
    React.createElement('input', {
      ...inputA11yProps,
      ref,
      type: 'range',
      className: 'MuiSlider-input',
      min,
      max,
      step,
      disabled,
      ...(controlled ? { value: resolvedValue } : { defaultValue: resolvedValue }),
      onChange: handleChange,
      onMouseDown,
      onMouseUp: handleMouseUp,
      onBlur,
      onKeyUp: handleKeyUp,
      style: {
        width: '100%',
        margin: 0,
        background: 'transparent',
      },
    }),
  );
});

export default Slider;
export * from './index';
