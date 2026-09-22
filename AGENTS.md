# Ecommerce AI Agent Rules

These rules guide AI-assisted development for this repository.

## Project Direction

- Build a multi-tenant ecommerce SaaS platform.
- Use a modular monolith backend first.
- Use shared PostgreSQL database and shared schema initially.
- All tenant-owned data must be scoped by trusted tenant context.
- Multi-vendor marketplace behavior is not part of the default scope.

## Mandatory Pre-Feature Grill

Before implementing any feature, run a short grill-me review with the user.

Ask sharp questions about:

- What problem the feature solves.
- Which user role needs it.
- Which tenant boundary applies.
- What data model changes are needed.
- What can go wrong in real life.
- Which tests prove it works.
- Whether cache, background jobs, cron, events, or search are actually needed now.

Do not start feature implementation until the feature scope, tenant behavior, edge cases, and testing target are clear enough.

## Backend Rules

- Every tenant-owned query must be tenant-scoped.
- Every tenant-owned table must include `tenant_id`, unless a documented exception exists.
- Tenant-scoped unique constraints should include `tenant_id`.
- Events, jobs, cache keys, logs, metrics, search documents, and AI tools must carry tenant scope.
- Controllers should stay thin; domain/application services own business behavior.
- Critical writes need validation, authorization, transaction boundaries, and tests.
- Checkout, payment, refund, webhook, and order mutation APIs need idempotency.
- External side effects should run through jobs/events unless synchronous behavior is required.

## Frontend Rules

- Use Next.js App Router.
- Prefer React Server Components and server-side data fetching by default.
- Prefer SSR for tenant-aware, authenticated, dashboard, cart, checkout, and business-critical pages.
- Consider ISR for public storefront pages only when caching is safe and freshness requirements are clear.
- Use Client Components only for interactive islands that need browser state, event handlers, effects, or browser APIs, unless there is a clear reason.
- Discuss SSR vs ISR vs client-side rendering before implementing each frontend feature.
- Keep `app/` route files thin: metadata, layout composition, permission gating, and calls to feature page components.
- Put feature implementation under `features/feature-name/`.
- Feature folders should expose public API through `index.ts`.
- Tenant, auth, and permission checks should happen server-side whenever possible.
- Tenant-owned query keys, cache keys, and client state must include tenant scope.

## Testing Rules

- Add tests with every feature.
- Tenant isolation tests are mandatory for tenant-owned APIs.
- Critical business workflows need integration tests.
- Edge cases must be tested, not just the happy path.
- Bugs should first get a failing regression test when practical.
- Do not treat a feature as done until relevant tests pass.

## AI Assistant Rules

- AI tools must enforce tenant context and role-based access control.
- Customer AI tools can only access that customer's tenant and own account data.
- Tenant admin AI tools can only access their tenant's operational data.
- Platform super-admin AI tools may access platform data, but actions must be audited.
- Never expose cross-tenant data through chat responses, logs, tool output, or analytics.
