import { Controller, Get } from "@nestjs/common";

import { SkipApiResponseWrap } from "../common/api-response/api-response.decorator.js";
import { HealthService } from "./health.service.js";

@Controller("health")
@SkipApiResponseWrap()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth() {
    return this.healthService.getHealth();
  }
}
