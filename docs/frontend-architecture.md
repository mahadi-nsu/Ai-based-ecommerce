# Frontend Architecture

## Direction

Use Next.js App Router with a server-first and SSR-preferred approach.

Default to React Server Components and server-side data fetching. Prefer SSR whenever fresh, tenant-aware, personalized, permission-sensitive, or business-critical data is involved. Use ISR or Client Components when they are the better fit, but discuss that decision before implementing a feature.

## Rendering Rules

- Prefer Server Components by default.
- Prefer SSR for tenant-aware pages, authenticated pages, dashboards, carts, checkout, and pages where data should be fresh per request.
- Consider ISR for public storefront pages that can be cached safely, such as product details, category pages, collection pages, landing pages, and CMS/policy pages.
- Use client-side rendering only for interactive islands, not whole pages by default, unless there is a clear reason.
- Discuss SSR vs ISR vs client-side rendering during the pre-feature grill before implementation.
- Keep tenant, auth, and permission checks on the server whenever possible.
- Do not fetch protected tenant data directly from Client Components unless the API is explicitly designed for that role and tenant context.

## App Router Rule

Routes live in the `app/` folder.

Route files should stay thin. They can handle:

- Metadata
- Layout composition
- Tenant resolution usage
- Auth/permission gating
- Calling feature-level page components
- Route-level loading/error/not-found boundaries

Avoid putting business logic, large UI trees, API details, or reusable feature logic directly in route files.

## Feature Structure

Feature implementation should live under `features/`.

```txt
features/
  feature-name/
    index.ts
    components/
    api/
    hooks/
    utils/
    constants/
    pages/
```

## Folder Responsibilities

- `index.ts`: public exports for the feature.
- `components/`: feature-specific UI components.
- `api/`: server actions, API clients, query functions, and feature-specific service calls.
- `hooks/`: feature hooks, only when client-side behavior is needed.
- `utils/`: feature-local helpers.
- `constants/`: feature-local constants.
- `pages/`: route-level page components imported by `app/` routes.

Shared UI primitives should live outside feature folders, for example under `components/` or `shared/ui/` after the frontend scaffold exists.

## Multi-Tenant Frontend Rules

- Every storefront route must resolve tenant context.
- Tenant branding/theme/settings should be fetched server-side.
- Tenant admin routes must enforce tenant membership and role permissions server-side.
- Platform super-admin routes must be separate from tenant admin routes.
- Cache keys and query keys must include tenant scope when data is tenant-owned.
- Never reuse tenant-owned data across tenants through global client state.

## Data Fetching Rules

- Server data fetching is the default for initial page data.
- Use TanStack Query for client-side mutations, interactive refetching, optimistic updates, and long-lived dashboard interactions.
- Use server actions only where they keep the flow simpler and still preserve validation, auth, tenant context, and error handling.
- Keep API response schemas typed and validated.

## Testing Rules

- Component tests for complex feature components.
- Integration tests for route permission behavior.
- End-to-end tests for storefront, tenant admin, and platform admin flows.
- Tenant isolation tests for frontend-visible data boundaries.
