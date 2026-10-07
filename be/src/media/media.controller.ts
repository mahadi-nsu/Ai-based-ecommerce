import { Controller, Post, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { MediaService } from "./media.service.js";

@Controller("media")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post("images")
  async uploadImage(@Req() request: FastifyRequest) {
    const file = request.isMultipart() ? await request.file() : undefined;

    return this.mediaService.uploadImage(file);
  }
}
