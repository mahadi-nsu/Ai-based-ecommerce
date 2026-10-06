import { jest } from "@jest/globals";

import { ApiErrorCode } from "../common/api-response/api-error-code.js";
import type { TenantContextService } from "../tenant-context/tenant-context.service.js";
import { CategoriesService } from "./categories.service.js";

type TenantContextMock = Pick<TenantContextService, "getRequiredTenantId"> & {
  getRequiredTenantId: jest.Mock<() => string>;
};

describe("CategoriesService", () => {
  it.each([
    ["createCategory", () => service.createCategory({ name: "Electronics", slug: "electronics" })],
    ["listCategories", () => service.listCategories()],
    ["getCategoryById", () => service.getCategoryById("6b74484b-bc91-4516-a479-04cdb5dc34f2")],
    [
      "updateCategory",
      () => service.updateCategory("6b74484b-bc91-4516-a479-04cdb5dc34f2", { name: "Updated" })
    ],
    ["deleteCategory", () => service.deleteCategory("6b74484b-bc91-4516-a479-04cdb5dc34f2")]
  ])("%s requires tenant context before placeholder logic", (_name, act) => {
    const tenantContext = createTenantContextMock();
    service = new CategoriesService(tenantContext as unknown as TenantContextService);

    expect(readThrownApiErrorCode(act)).toBe(ApiErrorCode.CategoryCrudNotImplemented);
    expect(tenantContext.getRequiredTenantId).toHaveBeenCalledTimes(1);
  });
});

let service: CategoriesService;

function createTenantContextMock() {
  return {
    getRequiredTenantId: jest.fn(() => "tenant-id")
  } satisfies TenantContextMock;
}

function readThrownApiErrorCode(act: () => unknown) {
  try {
    act();
    return undefined;
  } catch (error) {
    return readApiErrorCode(error);
  }
}

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
