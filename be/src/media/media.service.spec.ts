import { jest } from "@jest/globals";

import type { CloudinaryService } from "../cloudinary/cloudinary.service.js";
import { ApiErrorCode } from "../common/api-response/api-error-code.js";
import type { CurrentTenant, TenantContextService } from "../tenant-context/tenant-context.service.js";
import { MediaService } from "./media.service.js";

type CloudinaryUploadImage = CloudinaryService["uploadImage"];

type CloudinaryMock = Pick<CloudinaryService, "isConfigured" | "uploadImage"> & {
  isConfigured: jest.Mock<() => boolean>;
  uploadImage: jest.Mock<CloudinaryUploadImage>;
};

type TenantContextMock = Pick<TenantContextService, "getRequiredTenant"> & {
  getRequiredTenant: jest.Mock<() => CurrentTenant>;
};

type UploadFile = NonNullable<Parameters<MediaService["uploadImage"]>[0]>;

type UploadFileMock = UploadFile & {
  toBuffer: jest.Mock<() => Promise<Buffer>>;
};

describe("MediaService", () => {
  let cloudinary: CloudinaryMock;
  let tenantContext: TenantContextMock;
  let service: MediaService;

  beforeEach(() => {
    cloudinary = createCloudinaryMock();
    tenantContext = createTenantContextMock();
    service = new MediaService(
      cloudinary as unknown as CloudinaryService,
      tenantContext as unknown as TenantContextService
    );
  });

  it("uploads an image to a tenant-scoped Cloudinary folder", async () => {
    const file = createUploadFile();
    cloudinary.uploadImage.mockResolvedValue({
      secure_url: "https://res.cloudinary.com/demo/image/upload/tenants/tenant-id/images/logo.png",
      public_id: "tenants/tenant-id/images/logo"
    } as Awaited<ReturnType<CloudinaryUploadImage>>);

    await expect(service.uploadImage(file)).resolves.toEqual({
      imageUrl: "https://res.cloudinary.com/demo/image/upload/tenants/tenant-id/images/logo.png",
      imagePublicId: "tenants/tenant-id/images/logo"
    });
    expect(tenantContext.getRequiredTenant).toHaveBeenCalledTimes(1);
    expect(file.toBuffer).toHaveBeenCalledTimes(1);
    expect(cloudinary.uploadImage).toHaveBeenCalledWith(Buffer.from("image-bytes"), {
      folder: "tenants/tenant-id/images",
      use_filename: true,
      unique_filename: true,
      overwrite: false
    });
  });

  it("rejects requests without a file", async () => {
    await expect(service.uploadImage(undefined)).rejects.toMatchObject({
      response: {
        code: ApiErrorCode.MediaImageRequired,
        message: "Image file is required"
      }
    });
    expect(cloudinary.uploadImage).not.toHaveBeenCalled();
  });

  it("rejects non-image files", async () => {
    await expect(service.uploadImage(createUploadFile("application/pdf"))).rejects.toMatchObject({
      response: {
        code: ApiErrorCode.MediaInvalidImageType,
        message: "Only image uploads are allowed"
      }
    });
    expect(cloudinary.uploadImage).not.toHaveBeenCalled();
  });

  it("fails clearly when Cloudinary environment variables are missing", async () => {
    cloudinary.isConfigured.mockReturnValue(false);

    await expect(service.uploadImage(createUploadFile())).rejects.toMatchObject({
      response: {
        code: ApiErrorCode.MediaUploadNotConfigured,
        message: "Image upload is not configured"
      }
    });
    expect(cloudinary.uploadImage).not.toHaveBeenCalled();
  });
});

function createCloudinaryMock() {
  return {
    isConfigured: jest.fn(() => true),
    uploadImage: jest.fn<CloudinaryUploadImage>()
  } satisfies CloudinaryMock;
}

function createTenantContextMock() {
  return {
    getRequiredTenant: jest.fn(() => ({
      id: "tenant-id",
      slug: "demo-shop",
      status: "ACTIVE"
    }))
  } satisfies TenantContextMock;
}

function createUploadFile(mimetype = "image/png"): UploadFileMock {
  return {
    mimetype,
    toBuffer: jest.fn(() => Promise.resolve(Buffer.from("image-bytes")))
  } as UploadFileMock;
}
