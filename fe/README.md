# Frontend

Planned frontend: multi-tenant ecommerce storefront, tenant admin back office, and platform super-admin console.

Recommended stack:

- Next.js
- TypeScript
- Tailwind CSS
- TanStack Query
- Zod

Rendering direction:

- Use Next.js App Router.
- Prefer Server Components and server-side data fetching.
- Prefer SSR for tenant-aware, authenticated, dashboard, cart, checkout, and business-critical pages.
- Consider ISR for public storefront pages only when caching is safe and freshness requirements are clear.
- Use Client Components only for interactive islands unless there is a clear reason.
- Discuss SSR vs ISR vs client-side rendering before implementing each frontend feature.

Project structure:

```txt
app/
  ...

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

Route files in `app/` should stay thin. Feature implementation should live under `features/`.

Primary areas:

- Tenant storefront
- Tenant-specific branding/theme
- Product listing
- Product details
- Cart
- Checkout
- Customer account
- Order tracking
- Tenant admin dashboard
- Product management
- Inventory management
- Order management
- Tenant settings
- Platform tenant management
- Platform billing/subscription management
- AI chat assistant

See [../docs/frontend-architecture.md](../docs/frontend-architecture.md).
