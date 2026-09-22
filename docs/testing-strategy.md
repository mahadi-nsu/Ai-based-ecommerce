# Testing Strategy

Testing is a core requirement for this project, not a later cleanup task.

## Goals

- Prove tenant isolation.
- Protect checkout, payment, inventory, and order workflows.
- Keep AI-assisted development from changing behavior silently.
- Make refactoring safe while learning advanced backend engineering patterns.

## Test Types

## Unit Tests

Use for pure business logic:

- Price calculation
- Discount rules
- Inventory rules
- Tenant plan limits
- Permission checks
- AI tool authorization logic

## Integration Tests

Use for module behavior with database and framework wiring:

- Tenant resolution
- Auth and RBAC
- Product CRUD
- Cart behavior
- Checkout flow
- Order lifecycle
- Payment webhook handling
- Outbox/event persistence
- Background job handlers

## Tenant Isolation Tests

Mandatory for tenant-owned APIs.

Examples:

- Tenant A cannot read Tenant B products through direct IDs.
- Tenant A admin cannot update Tenant B orders.
- Customer from Tenant A cannot access Tenant B storefront account data.
- Search results are scoped to the active tenant.
- Cache keys cannot leak data across tenants.
- AI tools cannot return another tenant's analytics or orders.

## End-to-End Tests

Use for critical real-world user flows:

- Tenant creates store settings.
- Tenant admin creates product and inventory.
- Customer browses storefront.
- Customer adds item to cart.
- Customer checks out.
- Admin processes order.
- Customer tracks order.

## Contract Tests

Use where API behavior must remain stable:

- Public storefront APIs.
- Admin APIs.
- Webhook endpoints.
- AI tool input/output schemas.

## Regression Tests

Every meaningful bug should get a failing test first when practical.

## Performance and Reliability Tests

Add later when the baseline system exists:

- Product listing under load.
- Checkout concurrency.
- Inventory reservation race conditions.
- Queue retry behavior.
- Outbox publishing recovery.
- Noisy-neighbor tenant scenarios.

## Feature Done Definition

A feature is not done unless:

- Tenant behavior is defined.
- Role permissions are defined.
- Database changes are migrated.
- Unit or integration tests cover the main behavior.
- Tenant isolation tests exist where tenant-owned data is touched.
- Error cases are handled.
- Relevant docs or learning notes are updated.
