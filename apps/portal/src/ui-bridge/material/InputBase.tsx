import React, { forwardRef } from 'react';

/**
 * Subpath shim for @/ui-bridge/material/InputBase.
 * Renders a semantic input and keeps basic adornment support used by wrappers.
 */

const toStyleObject = (sx: any): React.CSSProperties => {
  if (!sx) return {};
  if (Array.isArray(sx)) return Object.assign({}, ...sx.filter((s) => s && typeof s === 'object'));
  if (typeof sx === 'object') return sx as React.CSSProperties;
  return {};
};

const InputBase = forwardRef<HTMLDivElement, any>(function InputBase(props, ref) {
  const {
    className,
    style,
    sx,
    startAdornment,
    endAdornment,
    inputProps,
    disabled,
    type = 'text',
    children,
    ['data-ui']: dataUi,
    ...rest
  } = props || {};

  const rootClassName = ['MuiInputBase-root', className, disabled ? 'Mui-disabled' : null]
    .filter(Boolean)
    .join(' ');
  const inputClassName = ['MuiInputBase-input', inputProps?.className].filter(Boolean).join(' ');
  const mergedStyle = { ...toStyleObject(sx), ...(style || {}) };

  return React.createElement(
    'div',
    {
      ref,
      className: rootClassName,
      style: mergedStyle,
      'data-ui': dataUi,
    },
    startAdornment ? React.createElement('span', { className: 'MuiInputAdornment-root' }, startAdornment) : null,
    React.createElement('input', {
      ...rest,
      ...(inputProps || {}),
      type,
      disabled,
      className: inputClassName,
    }),
    endAdornment ? React.createElement('span', { className: 'MuiInputAdornment-root' }, endAdornment) : null,
    children,
  );
});

export default InputBase;
export * from './index';
