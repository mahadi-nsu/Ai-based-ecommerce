import { HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { TenantStatus } from "@prisma/client";

import { ApiErrorCode } from "../common/api-response/api-error-code.js";
import { ApiException } from "../common/api-response/api-exception.js";
import { PrismaService } from "../database/prisma.service.js";
import { RequestContextService } from "../observability/request-context/request-context.service.js";
import { TENANT_SLUG_HEADER } from "./tenant-context.constants.js";

type RequestLike = {
  headers: Record<string, string | string[] | undefined>;
  url?: string;
  originalUrl?: string;
};

type NextFunction = (error?: unknown) => void;

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly requestContextService: RequestContextService
  ) {}

  async use(req: RequestLike, _res: unknown, next: NextFunction) {
    try {
      await this.resolveTenant(req);
      next();
    } catch (error) {
      next(error);
    }
  }

  private async resolveTenant(req: RequestLike) {
    if (shouldSkipTenantResolution(req)) {
      return;
    }

    const tenantSlug = readHeader(req.headers, TENANT_SLUG_HEADER)?.trim();

    if (!tenantSlug) {
      throw new ApiException(HttpStatus.BAD_REQUEST, {
        code: ApiErrorCode.TenantRequired,
        message: "Tenant context is required"
      });
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: {
        slug: tenantSlug
      },
      select: {
        id: true,
        slug: true,
        status: true
      }
    });

    if (!tenant) {
      throw new ApiException(HttpStatus.NOT_FOUND, {
        code: ApiErrorCode.TenantNotFound,
        message: "Tenant not found"
      });
    }

    if (tenant.status !== TenantStatus.ACTIVE) {
      throw new ApiException(HttpStatus.FORBIDDEN, {
        code: ApiErrorCode.TenantInactive,
        message: "Tenant is not active",
        details: {
          status: tenant.status
        }
      });
    }

    this.requestContextService.merge({
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantStatus: tenant.status
    });
  }
}

function shouldSkipTenantResolution(request: RequestLike) {
  const path = stripGlobalPrefix(request.originalUrl ?? request.url ?? "");

  return path === "/health" || path.startsWith("/platform/");
}

function stripGlobalPrefix(path: string) {
  if (path.startsWith("/api/")) {
    return path.slice("/api".length);
  }

  if (path === "/api") {
    return "/";
  }

  return path;
}

function readHeader(headers: Record<string, string | string[] | undefined>, name: string): string | undefined {
  const value = headers[name];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
