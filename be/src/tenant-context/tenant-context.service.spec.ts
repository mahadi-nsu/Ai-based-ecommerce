import { ApiErrorCode } from "../common/api-response/api-error-code.js";
import { RequestContextService } from "../observability/request-context/request-context.service.js";
import { TenantContextService } from "./tenant-context.service.js";

describe("TenantContextService", () => {
  it("returns the current tenant from request context", () => {
    const requestContextService = new RequestContextService();
    const service = new TenantContextService(requestContextService);

    const tenant = requestContextService.run(
      {
        requestId: "req_test",
        tenantId: "tenant-id",
        tenantSlug: "demo-shop",
        tenantStatus: "ACTIVE"
      },
      () => service.getRequiredTenant()
    );

    expect(tenant).toEqual({
      id: "tenant-id",
      slug: "demo-shop",
      status: "ACTIVE"
    });
  });

  it("throws when tenant context is missing", () => {
    const requestContextService = new RequestContextService();
    const service = new TenantContextService(requestContextService);

    try {
      requestContextService.run(
        {
          requestId: "req_test"
        },
        () => service.getRequiredTenant()
      );
      throw new Error("Expected getRequiredTenant to throw");
    } catch (error) {
      expect(readApiErrorCode(error)).toBe(ApiErrorCode.TenantRequired);
    }
  });
});

function readApiErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return undefined;
  }

  const response = error.response;

  if (!response || typeof response !== "object" || !("code" in response)) {
    return undefined;
  }

  return response.code;
}
