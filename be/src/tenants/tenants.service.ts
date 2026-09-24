import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, TenantStatus } from "@prisma/client";

import { PrismaService } from "../database/prisma.service.js";
import type { CreateTenantDto } from "./dto/create-tenant.dto.js";

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTenant(dto: CreateTenantDto) {
    try {
      return await this.prisma.tenant.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          logoUrl: dto.logoUrl,
          logoPublicId: dto.logoPublicId
        }
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException("Tenant slug already exists");
      }

      throw error;
    }
  }

  async listTenants() {
    return this.prisma.tenant.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async getTenantById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: {
        id
      }
    });

    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    return tenant;
  }

  async getTenantBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: {
        slug
      }
    });

    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    return tenant;
  }

  async updateTenantStatus(id: string, status: TenantStatus) {
    try {
      return await this.prisma.tenant.update({
        where: {
          id
        },
        data: {
          status
        }
      });
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new NotFoundException("Tenant not found");
      }

      throw error;
    }
  }
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function isNotFoundError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}
