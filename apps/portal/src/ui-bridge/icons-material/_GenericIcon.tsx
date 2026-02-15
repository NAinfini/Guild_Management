import React, { forwardRef } from 'react';

/**
 * Generic default export shim for @/ui-bridge/icons-material/<Name> subpath imports.
 */

const Icon = forwardRef<SVGSVGElement, any>(function MuiIconSubpathShim(props, ref) {
  const { titleAccess = 'Icon', children, style, ...rest } = props || {};
  return (
    React.createElement('svg', {
      ref,
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'currentColor',
      role: 'img',
      'aria-label': titleAccess,
      ...rest,
      style,
    },
    React.createElement('title', null, titleAccess),
    React.createElement('rect', { x: 4, y: 4, width: 16, height: 16, rx: 2, ry: 2 }),
    children)
  );
});

export default Icon;
