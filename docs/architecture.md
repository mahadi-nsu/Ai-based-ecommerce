# Architecture

## Decision

Build a multi-tenant ecommerce SaaS platform as a modular monolith.

This keeps the project practical while still allowing advanced backend engineering patterns: tenant isolation, domain boundaries, event-driven workflows, cache strategy, background jobs, search indexing, observability, and reliable data consistency.

## Tenancy Model

The app is multi-tenant, not multi-vendor by default.

Multi-tenant means many independent stores/businesses run on the same software platform. Each tenant has its own products, customers, orders, settings, theme, policies, analytics, and admins.

Multi-vendor means one marketplace contains many sellers inside the same storefront. That is not the current direction.

The target product is closer to Shopify/Dukaan-style ecommerce SaaS than Daraz/Amazon Marketplace.

## Database Tenancy

Start with shared database and shared schema.

- Tenant-owned tables must include `tenant_id`.
- Every tenant-scoped query must filter by tenant context.
- Database indexes should include `tenant_id` for high-volume tenant-scoped reads.
- Unique constraints should usually be tenant-scoped, for example `(tenant_id, slug)`.
- Platform-level tables such as tenants, plans, subscriptions, and platform users may not belong to a tenant.
- The architecture should leave room for moving large enterprise tenants to a dedicated database later.

Potential future models:

- Shared DB, shared schema for most tenants.
- Dedicated DB for enterprise tenants with stronger isolation or compliance needs.

Use Prisma as the backend ORM and migration tool for the first version.

## Tenant Resolution

Tenant context can be resolved from:

- Subdomain, for example `store-a.example.com`.
- Custom domain, for example `store-a.com`.
- Internal admin route context.
- Signed auth/session claims.

Every request should produce a trusted tenant context before reaching tenant-owned business logic.

## Roles

- Customer: belongs to a tenant storefront and can only access that tenant's catalog, cart, orders, and support flows.
- Tenant staff/admin: manages only one tenant's products, inventory, orders, promotions, settings, analytics, and AI tools.
- Platform super-admin: manages tenants, plans, billing, usage, system health, and platform-level operations.

## Core Modules

- Tenant management
- Subscription and billing
- Domain and storefront routing
- Identity and access control
- Customer profile
- Store settings
- Theme and branding
- Product catalog
- Category and collection
- Inventory
- Pricing and promotion
- Cart
- Checkout
- Order
- Payment
- Shipment
- Refund and return
- Review and rating
- Notification
- Search
- AI assistant
- Analytics
- Audit log
- Admin back office

## Backend Style

- One deployable backend application.
- Strong module boundaries.
- Each module owns its domain logic.
- Modules communicate through application services and domain events.
- Tenant context is required for tenant-owned modules.
- Database writes happen through transactions where consistency matters.
- Slow or external work runs in background jobs.

## Event-Driven Workflows

Important actions emit domain events:

- `TenantCreated`
- `TenantPlanChanged`
- `TenantSuspended`
- `ProductCreated`
- `ProductUpdated`
- `InventoryAdjusted`
- `CartCheckedOut`
- `OrderPlaced`
- `PaymentAuthorized`
- `PaymentCaptured`
- `PaymentFailed`
- `OrderConfirmed`
- `OrderCancelled`
- `ShipmentCreated`
- `RefundRequested`
- `RefundCompleted`

Every tenant-owned event must include `tenant_id`.

Events power async behaviors:

- Email/SMS notifications
- Search index updates
- Analytics updates
- Inventory alerts
- Invoice generation
- Audit trails
- AI assistant context refresh
- Tenant usage metering
- Billing/subscription updates

## AI Assistant

The chatbot must be tool-based and permission-aware.

Customer tools:

- Search products
- Check product availability
- Compare products
- Add item to cart
- Read own order status
- Explain return/refund policy

Tenant admin tools:

- Read sales analytics
- Read inventory status
- Find low-stock products
- Inspect order trends
- Summarize refunds/cancellations
- Search customers/orders

Platform super-admin tools:

- Search tenants
- Inspect tenant usage
- Review billing/subscription state
- Identify unhealthy tenants or failed jobs
- Compare platform-level revenue and growth metrics

Every AI tool must enforce tenant context and role-based access control before returning data. A customer can never see admin analytics. A tenant admin can never see another tenant's data. A platform super-admin can use platform-level tools, but those actions must be audited.

## Reliability

- Outbox pattern for publishing events after DB commits.
- Idempotency keys for checkout, payment, refund, and webhook APIs.
- Tenant-scoped idempotency keys for tenant-owned writes.
- Retry with backoff for recoverable job failures.
- Dead-letter queue for failed async jobs.
- Audit logs for sensitive admin actions.
- Optimistic locking or transactional row locks for inventory-sensitive flows.
- Tenant-aware job payloads, retry policies, and dead-letter inspection.
- Noisy-neighbor protections with rate limits and usage quotas.

## Scalability Path

Start as modular monolith. Extract later only if pressure justifies it:

- Tenant provisioning worker
- Notification worker
- Search indexing worker
- AI assistant service
- Analytics/read-model service
- Payment processing worker
- Billing/usage metering worker

The first version should be built so these can be split later without rewriting the whole application.
