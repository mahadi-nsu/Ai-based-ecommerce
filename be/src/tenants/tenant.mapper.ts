import type { Tenant } from "@prisma/client";

export type TenantResponse = {
  id: string;
  name: string;
  slug: string;
  status: string;
  logoUrl: string | null;
  logoPublicId: string | null;
  createdAt: string;
  updatedAt: string;
};

export function mapTenantToResponse(tenant: Tenant): TenantResponse {
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    status: tenant.status,
    logoUrl: tenant.logoUrl,
    logoPublicId: tenant.logoPublicId,
    createdAt: tenant.createdAt.toISOString(),
    updatedAt: tenant.updatedAt.toISOString()
  };
}
