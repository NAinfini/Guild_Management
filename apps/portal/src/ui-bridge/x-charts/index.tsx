import React from 'react';

/**
 * Temporary chart shim for phased migration off @/ui-bridge/x-charts.
 */

const ChartShell = ({ children, style, ...rest }: any) => (
  React.createElement('div', { ...rest, style: { minHeight: 160, width: '100%', border: '1px dashed var(--border, rgba(120,120,120,0.4))', borderRadius: 8, ...(style || {}) } }, children)
);

export const LineChart = (props: any) => React.createElement(ChartShell, props);
export const BarChart = (props: any) => React.createElement(ChartShell, props);
export const PieChart = (props: any) => React.createElement(ChartShell, props);
export const ChartsReferenceLine = () => null;
