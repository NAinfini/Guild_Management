import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

function AppNotFound() {
  const { t } = useTranslation();

  return (
    <main
      data-testid="app-not-found-state"
      className="min-h-screen px-6 py-16 flex items-center justify-center"
      style={{ background: 'var(--sys-surface-canvas, var(--sys-surface-base, #0b0d14))' }}
    >
      <section
        className="w-full max-w-xl rounded-2xl border p-8 text-center space-y-4"
        style={{
          borderColor: 'var(--cmp-card-border, color-mix(in srgb, var(--sys-text-primary, #fff) 15%, transparent))',
          background:
            'linear-gradient(155deg, color-mix(in srgb, var(--sys-surface-panel, #111827) 90%, transparent), color-mix(in srgb, var(--sys-surface-raised, #1f2937) 82%, transparent))',
        }}
      >
        <p className="text-xs font-black tracking-[0.24em] uppercase text-[color:var(--sys-text-secondary,#a1a1aa)]">404</p>
        <h1 className="text-3xl font-black text-[color:var(--sys-text-primary,#f8fafc)]">{t('errors.NOT_FOUND')}</h1>
        <p className="text-sm text-[color:var(--sys-text-secondary,#a1a1aa)]">{t('common.placeholder_msg')}</p>
        <div data-testid="app-not-found-actions" className="pt-2 flex justify-center">
          {/* Home action routes users back to dashboard from any unknown URL branch. */}
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-black uppercase tracking-[0.08em]"
            style={{
              borderColor: 'var(--cmp-button-primary-border, color-mix(in srgb, var(--sys-interactive-accent,#22d3ee) 60%, transparent))',
              background:
                'var(--cmp-button-primary-bg, color-mix(in srgb, var(--sys-interactive-accent,#22d3ee) 22%, transparent))',
              color: 'var(--cmp-button-primary-text, var(--sys-text-primary,#f8fafc))',
            }}
          >
            {t('nav.dashboard')}
          </Link>
        </div>
      </section>
    </main>
  );
}

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
    </>
  ),
  notFoundComponent: AppNotFound,
});
