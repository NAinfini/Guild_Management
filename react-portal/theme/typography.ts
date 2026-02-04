
export const typography = {
  // Headings favor a display font; body stays highly legible.
  fontFamily: [
    '"Space Grotesk"',
    'Inter',
    'system-ui',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  fontSize: 16,
  h1: { fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  h2: { fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  h3: { fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.04em' },
  body1: { lineHeight: 1.6 },
  body2: { lineHeight: 1.55 },
  button: { fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
};
