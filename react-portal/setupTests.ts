import '@testing-library/jest-dom/vitest';

// Mock scrollTo for jsdom
if (!window.scrollTo) {
  window.scrollTo = () => {};
}
