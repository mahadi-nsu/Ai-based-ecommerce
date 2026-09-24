import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";

import { CreateTenantDto } from "./dto/create-tenant.dto.js";
import { UpdateTenantStatusDto } from "./dto/update-tenant-status.dto.js";
import { mapTenantToResponse } from "./tenant.mapper.js";
import { TenantsService } from "./tenants.service.js";

@Controller("platform/tenants")
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  async createTenant(@Body() dto: CreateTenantDto) {
    const tenant = await this.tenantsService.createTenant(dto);

    return mapTenantToResponse(tenant);
  }

  @Get()
  async listTenants() {
    const tenants = await this.tenantsService.listTenants();

    return tenants.map(mapTenantToResponse);
  }

  @Get("by-slug/:slug")
  async getTenantBySlug(@Param("slug") slug: string) {
    const tenant = await this.tenantsService.getTenantBySlug(slug);

    return mapTenantToResponse(tenant);
  }

  @Get(":id")
  async getTenantById(@Param("id", new ParseUUIDPipe()) id: string) {
    const tenant = await this.tenantsService.getTenantById(id);

    return mapTenantToResponse(tenant);
  }

  @Patch(":id/status")
  async updateTenantStatus(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTenantStatusDto
  ) {
    const tenant = await this.tenantsService.updateTenantStatus(id, dto.status);

    return mapTenantToResponse(tenant);
  }
}
