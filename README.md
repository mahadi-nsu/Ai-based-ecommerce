# Ecommerce AI

Multi-tenant ecommerce SaaS platform with an advanced modular-monolith backend and a role-aware AI shopping/admin assistant.

## Product Scope

- Multi-tenant ecommerce platform: many independent stores run on one shared application.
- Each tenant is a separate ecommerce business with its own products, customers, orders, settings, theme, and analytics.
- This is not a multi-vendor marketplace by default. Each tenant/store sells its own products.
- Customer storefront with products, categories, cart, checkout, orders, reviews, and support flows.
- Tenant admin back office for product, inventory, order, payment, refund, promotion, and analytics management.
- Platform super-admin back office for tenant onboarding, billing, subscriptions, usage, and system health.
- Role-based AI chatbot for customers, tenant admins, and platform super-admins.

## Architecture Direction

- Modular monolith first.
- Shared PostgreSQL database and shared schema to start, with `tenant_id` on tenant-owned tables.
- Tenant resolution through subdomain, custom domain, or request context.
- Tenant-aware authentication, authorization, caching, events, jobs, search, logs, analytics, and AI tools.
- Event-driven internals using domain events.
- PostgreSQL as the source-of-truth database.
- Redis for cache, rate limiting, locks, sessions, and queues.
- Background workers for async work.
- Search index for product discovery.
- Outbox pattern for reliable event publishing.
- Saga-style order workflow for checkout, payment, inventory, and fulfillment.
- Future hybrid tenancy path: keep small tenants in shared schema, but allow large enterprise tenants to move to a dedicated database later.

See [docs/architecture.md](docs/architecture.md), [docs/frontend-architecture.md](docs/frontend-architecture.md), and [docs/backend-engineering-checklist.md](docs/backend-engineering-checklist.md).

Development rules live in [AGENTS.md](AGENTS.md). Testing strategy lives in [docs/testing-strategy.md](docs/testing-strategy.md).
