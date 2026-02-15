import React, { forwardRef } from 'react';

/**
 * Generic default export shim for @/ui-bridge/material/<Component> subpath imports.
 */

const GenericMaterialComponent = forwardRef<any, any>(function GenericMaterialComponent(props, ref) {
  const { component, as, children, sx, style, ...rest } = props || {};
  const Element: any = as || component || 'div';
  const sxStyle = Array.isArray(sx) ? Object.assign({}, ...sx.filter((v: any) => v && typeof v === 'object')) : (sx && typeof sx === 'object' ? sx : {});
  return React.createElement(Element, { ref, ...rest, style: { ...(sxStyle || {}), ...(style || {}) } }, children);
});

export default GenericMaterialComponent;
