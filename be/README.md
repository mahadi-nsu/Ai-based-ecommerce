# Backend

Planned backend: multi-tenant modular monolith ecommerce SaaS API.

Recommended stack:

- NestJS
- Fastify adapter
- TypeScript strict mode
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

Current setup:

- NestJS 12
- ESM project
- Fastify platform adapter
- TypeScript 6 with strict compiler settings
- ESLint flat config
- Pino structured request logging
- Request context foundation through `AsyncLocalStorage`
- Jest unit tests
- Fastify `app.inject()` e2e tests
- Global validation pipe
- `/api/health` endpoint

Commands:

```bash
npm run start:dev
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

Database/ORM, Docker services, Redis, queue, and first domain module are intentionally not added yet. They should be decided through the pre-feature grill and architecture discussion.
