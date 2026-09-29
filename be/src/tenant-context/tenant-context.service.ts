import { HttpStatus, Injectable } from "@nestjs/common";

import { ApiErrorCode } from "../common/api-response/api-error-code.js";
import { ApiException } from "../common/api-response/api-exception.js";
import { RequestContextService } from "../observability/request-context/request-context.service.js";

export type CurrentTenant = {
  id: string;
  slug: string;
  status: string;
};

@Injectable()
export class TenantContextService {
  constructor(private readonly requestContextService: RequestContextService) {}

  getCurrentTenant(): CurrentTenant | undefined {
    const context = this.requestContextService.getStore();

    if (!context?.tenantId || !context.tenantSlug || !context.tenantStatus) {
      return undefined;
    }

    return {
      id: context.tenantId,
      slug: context.tenantSlug,
      status: context.tenantStatus
    };
  }

  getRequiredTenant(): CurrentTenant {
    const tenant = this.getCurrentTenant();

    if (!tenant) {
      throw new ApiException(HttpStatus.BAD_REQUEST, {
        code: ApiErrorCode.TenantRequired,
        message: "Tenant context is required"
      });
    }

    return tenant;
  }

  getRequiredTenantId() {
    return this.getRequiredTenant().id;
  }
}
