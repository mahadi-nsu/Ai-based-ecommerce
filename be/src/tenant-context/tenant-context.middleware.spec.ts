import { jest } from "@jest/globals";
import { TenantStatus } from "@prisma/client";

import { ApiErrorCode } from "../common/api-response/api-error-code.js";
import type { PrismaService } from "../database/prisma.service.js";
import { RequestContextService } from "../observability/request-context/request-context.service.js";
import { TENANT_SLUG_HEADER } from "./tenant-context.constants.js";
import { TenantContextMiddleware } from "./tenant-context.middleware.js";

type TenantLookup = {
  id: string;
  slug: string;
  status: TenantStatus;
};

describe("TenantContextMiddleware", () => {
  it("skips health and platform routes", async () => {
    const { middleware, findUnique, next } = createMiddleware();

    await middleware.use(
      {
        headers: {},
        url: "/api/health"
      },
      {},
      next
    );

    await middleware.use(
      {
        headers: {},
        url: "/api/platform/tenants"
      },
      {},
      next
    );

    expect(findUnique).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenNthCalledWith(1);
    expect(next).toHaveBeenNthCalledWith(2);
  });

  it("rejects tenant-owned routes without tenant header", async () => {
    const { middleware, findUnique, next } = createMiddleware();

    await middleware.use(
      {
        headers: {},
        url: "/api/products"
      },
      {},
      next
    );

    expect(readNextErrorCode(next)).toBe(ApiErrorCode.TenantRequired);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("rejects unknown tenant slugs", async () => {
    const { middleware, findUnique, next } = createMiddleware();
    findUnique.mockResolvedValue(null);

    await middleware.use(
      {
        headers: {
          [TENANT_SLUG_HEADER]: "missing-shop"
        },
        url: "/api/products"
      },
      {},
      next
    );

    expect(readNextErrorCode(next)).toBe(ApiErrorCode.TenantNotFound);
  });

  it("rejects inactive tenants", async () => {
    const { middleware, findUnique, next } = createMiddleware();
    findUnique.mockResolvedValue({
      id: "tenant-id",
      slug: "demo-shop",
      status: TenantStatus.SUSPENDED
    });

    await middleware.use(
      {
        headers: {
          [TENANT_SLUG_HEADER]: "demo-shop"
        },
        url: "/api/products"
      },
      {},
      next
    );

    expect(readNextErrorCode(next)).toBe(ApiErrorCode.TenantInactive);
  });

  it("sets tenant context for active tenants", async () => {
    const { middleware, requestContextService, findUnique, next } = createMiddleware();
    let contextAfterMiddleware: unknown;
    findUnique.mockResolvedValue({
      id: "tenant-id",
      slug: "demo-shop",
      status: TenantStatus.ACTIVE
    });

    await requestContextService.run(
      {
        requestId: "req_test"
      },
      () =>
        middleware.use(
          {
            headers: {
              [TENANT_SLUG_HEADER]: "demo-shop"
            },
            url: "/api/products"
          },
          {},
          next
        ).then(() => {
          contextAfterMiddleware = requestContextService.getStore();
        })
    );

    expect(contextAfterMiddleware).toMatchObject({
      tenantId: "tenant-id",
      tenantSlug: "demo-shop",
      tenantStatus: TenantStatus.ACTIVE
    });
    expect(next).toHaveBeenCalledWith();
  });
});

function createMiddleware() {
  const findUnique = jest.fn<(args: unknown) => Promise<TenantLookup | null>>();
  const prisma = {
    tenant: {
      findUnique
    }
  } as unknown as PrismaService;
  const requestContextService = new RequestContextService();
  const middleware = new TenantContextMiddleware(prisma, requestContextService);
  const next = jest.fn<(error?: unknown) => void>();

  return {
    middleware,
    requestContextService,
    findUnique,
    next
  };
}

function readNextErrorCode(next: jest.Mock<(error?: unknown) => void>) {
  const error = next.mock.calls[0]?.[0];

  if (!error || typeof error !== "object" || !("response" in error)) {
    return undefined;
  }

  const response = error.response;

  if (!response || typeof response !== "object" || !("code" in response)) {
    return undefined;
  }

  return response.code;
}
