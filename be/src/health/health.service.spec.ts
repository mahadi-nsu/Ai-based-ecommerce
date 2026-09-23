import { HealthService } from "./health.service.js";

describe("HealthService", () => {
  it("returns service health", () => {
    const service = new HealthService();

    const result = service.getHealth();

    expect(result.status).toBe("ok");
    expect(result.service).toBe("ecommerce-ai-backend");
    expect(result.timestamp).toEqual(expect.any(String));
  });
});
