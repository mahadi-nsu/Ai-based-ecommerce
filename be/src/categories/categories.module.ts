import { Module } from "@nestjs/common";

import { TenantContextModule } from "../tenant-context/tenant-context.module.js";
import { CategoriesController } from "./categories.controller.js";
import { CategoriesService } from "./categories.service.js";
import { DatabaseModule } from "@app/database/database.module.js";

@Module({
  imports: [DatabaseModule , TenantContextModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService]
})
export class CategoriesModule {}
