# Backend Engineering Checklist

## API

- REST API with versioning.
- Tenant resolution middleware/guard.
- Tenant context attached to every request.
- Request validation.
- Response serialization.
- Global error handling.
- Pagination, filtering, and sorting.
- Idempotency support for critical writes.
- Tenant-aware rate limiting.
- API documentation.

## AI-Assisted Development Loop

- Run a short grill-me review before every feature.
- Define feature scope, target role, tenant behavior, edge cases, and tests before implementation.
- Decide explicitly whether cache, background jobs, cron, events, search, or AI tools are needed now.
- Keep implementation, tests, and learning notes in sync.

## Multi-Tenancy

- Tenant table for store identity, status, plan, domains, and settings.
- Shared database and shared schema for the first version.
- `tenant_id` on all tenant-owned tables.
- Tenant-scoped unique constraints.
- Tenant-aware repositories/query helpers.
- Tenant isolation tests for critical APIs.
- Support for subdomain and custom-domain tenant resolution.
- Tenant lifecycle: create, activate, suspend, archive.
- Per-tenant settings, branding, currency, locale, tax, shipping, and policy configuration.
- Platform super-admin APIs separated from tenant-admin APIs.
- Future path for dedicated database per enterprise tenant.

## Database

- PostgreSQL schema design.
- Database migrations.
- Proper indexes.
- Compound indexes starting with `tenant_id` for tenant-scoped high-volume queries.
- Cursor pagination for large lists.
- Transaction boundaries for checkout/order/payment/inventory.
- Soft delete where business history matters.
- Audit table for admin-sensitive actions.
- Tenant-scoped audit logs.
- Seed data for development.

## Caching

- Tenant-prefixed cache keys.
- Cache-aside product/category reads.
- Redis-backed cart/session cache where appropriate.
- Cache invalidation through domain events.
- Rate-limit counters.
- Per-tenant usage counters.
- Distributed locks only where truly needed.

## Events and Jobs

- Domain events inside the monolith.
- `tenant_id` included on all tenant-owned events.
- Outbox table.
- Outbox publisher worker.
- Background job queue.
- Retry policy with exponential backoff.
- Dead-letter queue.
- Job idempotency.
- Tenant-aware queue names, job payloads, or job metadata.
- Per-tenant job observability and failure inspection.

## Order Workflow

- Inventory reservation.
- Payment authorization.
- Order confirmation.
- Payment capture.
- Stock deduction.
- Shipment creation.
- Cancellation/refund paths.
- Saga-style compensation where needed.

## Search

- Tenant-scoped product search index.
- Filters for category, price, stock, rating, and attributes.
- Search index sync from product/inventory events.
- Reindex command.
- Per-tenant reindex support.

## Security

- Role-based access control.
- Platform super-admin, tenant admin/staff, and customer separation.
- Tenant isolation enforcement.
- Secure password hashing.
- JWT or secure session strategy.
- Tenant and role claims in auth context.
- CSRF strategy if cookie auth is used.
- Input validation and output filtering.
- Secrets through environment variables.
- Webhook signature verification.
- Audit logs for tenant admin and platform super-admin actions.

## Observability

- Structured logging.
- Request IDs.
- Tenant IDs in logs, traces, and metrics where safe.
- Metrics.
- Distributed tracing-ready instrumentation.
- Health checks.
- Readiness checks.
- Error reporting hook.
- Per-tenant usage and noisy-neighbor monitoring.

## AI Assistant

- Tool-calling architecture.
- Tenant-scoped and role-scoped tool permissions.
- Conversation history.
- Tenant-specific product/order/policy retrieval.
- Guardrails against leaking admin data or cross-tenant data.
- Tenant admin analytics tools.
- Platform super-admin tenant/usage/billing tools.
- Customer shopping tools.
- Audit logs for assistant-triggered actions.

## DevOps

- Docker Compose for local development.
- Separate app, database, Redis, worker, and search containers.
- CI checks.
- Test database setup.
- Environment variable examples.
- Backup/restore plan.
- Tenant export plan.
- Future dedicated-tenant database migration plan.

## Testing

- Extensive tests are required for production-level learning.
- Unit tests for business rules and permission logic.
- Integration tests for module behavior with database/framework wiring.
- Tenant isolation tests for every tenant-owned API.
- End-to-end tests for critical storefront/admin flows.
- Contract tests for public APIs, webhooks, and AI tool schemas.
- Regression tests for meaningful bugs.
