import { Prisma, TenantStatus } from "@prisma/client";

import { ApiErrorCode } from "../common/api-response/api-error-code.js";
import { ApiException } from "../common/api-response/api-exception.js";
import { TenantsService } from "./tenants.service.js";

const sampleTenant = {
  id: "9eb2ad1d-5ac3-46a3-83c0-674303b61de2",
  name: "Gadget Zone",
  slug: "gadget-zone",
  status: TenantStatus.ACTIVE,
  logoUrl: "https://res.cloudinary.com/demo/image/upload/sample.png",
  logoPublicId: "tenants/gadget-zone/logo",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z")
};

describe("TenantsService", () => {
  it("creates a tenant", async () => {
    const prisma = createPrismaMock({
      tenant: {
        create: () => Promise.resolve(sampleTenant)
      }
    });
    const service = new TenantsService(prisma);

    await expect(
      service.createTenant({
        name: "Gadget Zone",
        slug: "gadget-zone",
        logoUrl: "https://res.cloudinary.com/demo/image/upload/sample.png",
        logoPublicId: "tenants/gadget-zone/logo"
      })
    ).resolves.toMatchObject({
      slug: "gadget-zone"
    });
  });

  it("throws conflict for duplicate slug", async () => {
    const prisma = createPrismaMock({
      tenant: {
        create: () => Promise.reject(createPrismaError("P2002"))
      }
    });
    const service = new TenantsService(prisma);

    await expect(
      service.createTenant({
        name: "Gadget Zone",
        slug: "gadget-zone"
      })
    ).rejects.toMatchObject({
      response: {
        code: ApiErrorCode.TenantSlugExists,
        message: "Tenant slug already exists"
      }
    });
  });

  it("finds a tenant by slug", async () => {
    const prisma = createPrismaMock({
      tenant: {
        findUnique: () => Promise.resolve(sampleTenant)
      }
    });
    const service = new TenantsService(prisma);

    await expect(service.getTenantBySlug("gadget-zone")).resolves.toMatchObject({
      slug: "gadget-zone"
    });
  });

  it("throws not found when tenant is missing", async () => {
    const prisma = createPrismaMock({
      tenant: {
        findUnique: () => Promise.resolve(null)
      }
    });
    const service = new TenantsService(prisma);

    await expect(service.getTenantById(sampleTenant.id)).rejects.toBeInstanceOf(ApiException);
    await expect(service.getTenantById(sampleTenant.id)).rejects.toMatchObject({
      response: {
        code: ApiErrorCode.TenantNotFound,
        message: "Tenant not found"
      }
    });
  });
});

function createPrismaMock(overrides: unknown) {
  return overrides as ConstructorParameters<typeof TenantsService>[0];
}

function createPrismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError("Prisma error", {
    code,
    clientVersion: "test"
  });
}
