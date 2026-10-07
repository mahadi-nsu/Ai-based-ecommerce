import { Injectable } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";
import type { ConfigOptions, UploadApiOptions, UploadApiResponse } from "cloudinary";

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config(this.getConfig());
  }

  getConfig(): ConfigOptions {
    return {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    };
  }

  isConfigured() {
    return Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );
  }

  uploadImage(buffer: Buffer, options: UploadApiOptions): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          ...options,
          resource_type: "image"
        },
        (error, result) => {
          if (error) {
            reject(toUploadError(error));
            return;
          }

          if (!result) {
            reject(new Error("Cloudinary upload did not return a result"));
            return;
          }

          resolve(result);
        }
      );

      uploadStream.end(buffer);
    });
  }
}

function toUploadError(error: unknown) {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  if (hasErrorMessage(error)) {
    return new Error(error.message);
  }

  return new Error("Cloudinary upload failed");
}

function hasErrorMessage(error: unknown): error is { message: string } {
  return (
    error !== null &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  );
}
