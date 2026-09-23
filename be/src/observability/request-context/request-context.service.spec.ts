import { RequestContextService } from "./request-context.service.js";

describe("RequestContextService", () => {
  it("stores request context inside async local storage", () => {
    const service = new RequestContextService();

    service.run({ requestId: "req_test" }, () => {
      expect(service.getRequestId()).toBe("req_test");
    });
  });

  it("merges additional context into the current request scope", () => {
    const service = new RequestContextService();

    service.run({ requestId: "req_test" }, () => {
      service.merge({
        tenantId: "tenant_test",
        userId: "user_test"
      });

      expect(service.getStore()).toMatchObject({
        requestId: "req_test",
        tenantId: "tenant_test",
        userId: "user_test"
      });
    });
  });
});
