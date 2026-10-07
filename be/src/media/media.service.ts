import { HttpStatus, Injectable } from "@nestjs/common";
import type { MultipartFile } from "@fastify/multipart";

import { CloudinaryService } from "../cloudinary/cloudinary.service.js";
import { ApiErrorCode } from "../common/api-response/api-error-code.js";
import { ApiException } from "../common/api-response/api-exception.js";
import { TenantContextService } from "../tenant-context/tenant-context.service.js";
import type { UploadedImageResponse } from "./media.types.js";

@Injectable()
export class MediaService {
  constructor(
    private readonly cloudinary: CloudinaryService,
    private readonly tenantContext: TenantContextService
  ) {}

  async uploadImage(file: MultipartFile | undefined): Promise<UploadedImageResponse> {
    const tenant = this.tenantContext.getRequiredTenant();

    if (!file) {
      throw new ApiException(HttpStatus.BAD_REQUEST, {
        code: ApiErrorCode.MediaImageRequired,
        message: "Image file is required"
      });
    }

    if (!file.mimetype.startsWith("image/")) {
      throw new ApiException(HttpStatus.BAD_REQUEST, {
        code: ApiErrorCode.MediaInvalidImageType,
        message: "Only image uploads are allowed"
      });
    }

    if (!this.cloudinary.isConfigured()) {
      throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, {
        code: ApiErrorCode.MediaUploadNotConfigured,
        message: "Image upload is not configured"
      });
    }

    const result = await this.cloudinary.uploadImage(await file.toBuffer(), {
      folder: `tenants/${tenant.id}/images`,
      use_filename: true,
      unique_filename: true,
      overwrite: false
    });

    return {
      imageUrl: result.secure_url,
      imagePublicId: result.public_id
    };
  }
}
