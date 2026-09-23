import { Injectable } from "@nestjs/common";

type HealthResponse = {
  status: "ok";
  service: "ecommerce-ai-backend";
  timestamp: string;
};

@Injectable()
export class HealthService {
  getHealth(): HealthResponse {
    return {
      status: "ok",
      service: "ecommerce-ai-backend",
      timestamp: new Date().toISOString()
    };
  }
}
