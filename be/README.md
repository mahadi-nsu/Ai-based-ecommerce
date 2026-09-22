# Backend

Planned backend: multi-tenant modular monolith ecommerce SaaS API.

Recommended stack:

- NestJS
- PostgreSQL
- Prisma or TypeORM
- Redis
- BullMQ
- OpenSearch or Meilisearch
- OpenAI tool-calling for the AI assistant

Primary modules:

- Tenants
- Tenant Domains
- Tenant Settings
- Plans and Subscriptions
- Auth
- Users
- Roles and Permissions
- Products
- Categories
- Inventory
- Cart
- Checkout
- Orders
- Payments
- Shipping
- Refunds
- Promotions
- Reviews
- Search
- Notifications
- Analytics
- AI Assistant
- Audit Logs

Core rule: tenant-owned data must always be accessed through trusted tenant context. Events, jobs, cache keys, search indexes, audit logs, and AI tools must all carry tenant scope.
