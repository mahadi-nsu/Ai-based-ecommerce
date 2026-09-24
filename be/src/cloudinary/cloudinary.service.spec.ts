import { CloudinaryService } from "./cloudinary.service.js";

describe("CloudinaryService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      CLOUDINARY_CLOUD_NAME: "demo-cloud",
      CLOUDINARY_API_KEY: "demo-key",
      CLOUDINARY_API_SECRET: "demo-secret"
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("reads Cloudinary config from environment variables", () => {
    const service = new CloudinaryService();

    expect(service.getConfig()).toMatchObject({
      cloud_name: "demo-cloud",
      api_key: "demo-key",
      api_secret: "demo-secret",
      secure: true
    });
  });

  it("reports whether Cloudinary is configured", () => {
    const service = new CloudinaryService();

    expect(service.isConfigured()).toBe(true);
  });
});
