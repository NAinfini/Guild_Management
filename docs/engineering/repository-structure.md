# Repository Structure Standard

## Canonical Layout

- `apps/portal`: React portal application.
- `apps/worker`: Cloudflare worker application.
- `packages/shared-api`: shared contracts and endpoint definitions.
- `packages/shared-utils`: shared runtime-safe utilities.
- `packages/ui-tokens`: optional shared UI tokens package.
- `config/*`: centralized tool configuration.
- `docs/product`: product-facing docs.
- `docs/engineering`: engineering architecture and migration docs.
- `infra/cloudflare`, `infra/database`: deployment and database artifacts.

## Compatibility Policy

- Keep `.kilocode`, `.gsd`, and `.claude` at repo root.
- Keep external API behavior backward compatible during structure-only migrations.
- Prefer additive shims only when required for short-term migration safety.
