import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const portalSrc = path.resolve(__dirname, '../../src');

describe('Theme background effects contracts', () => {
  it('renders ambient theme background effects in app shell', () => {
    const appShellPath = path.resolve(portalSrc, 'layouts/AppShell.tsx');
    const appShellSource = fs.readFileSync(appShellPath, 'utf8');

    expect(appShellSource).toContain('ThemeAmbientEffects');
  });

  it('does not render decorative background overlays on login page', () => {
    const loginPath = path.resolve(portalSrc, 'features/Auth/Login.tsx');
    const loginSource = fs.readFileSync(loginPath, 'utf8');

    expect(loginSource).not.toContain('DecorativeBackground');
  });

  it('does not render decorative background overlays on dashboard page', () => {
    const dashboardPath = path.resolve(portalSrc, 'features/Dashboard/index.tsx');
    const dashboardSource = fs.readFileSync(dashboardPath, 'utf8');

    expect(dashboardSource).not.toContain('DecorativeBackground');
  });
});
