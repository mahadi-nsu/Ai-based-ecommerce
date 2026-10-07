import { Module } from "@nestjs/common";

import { CloudinaryModule } from "../cloudinary/cloudinary.module.js";
import { TenantContextModule } from "../tenant-context/tenant-context.module.js";
import { MediaController } from "./media.controller.js";
import { MediaService } from "./media.service.js";

@Module({
  imports: [CloudinaryModule, TenantContextModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService]
})
export class MediaModule {}
