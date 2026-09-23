import { randomUUID } from "node:crypto";

import { Injectable, NestMiddleware } from "@nestjs/common";

import { RequestContextService } from "./request-context.service.js";

type RequestLike = {
  id?: string;
  headers: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  header?: (name: string, value: string) => void;
  setHeader?: (name: string, value: string) => void;
};

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly requestContextService: RequestContextService) {}

  use(req: RequestLike, res: ResponseLike, next: () => void) {
    const requestId = readHeader(req.headers, "x-request-id") ?? req.id ?? randomUUID();
    const traceParent = readHeader(req.headers, "traceparent");

    req.id = requestId;
    setResponseHeader(res, "x-request-id", requestId);

    this.requestContextService.run(
      {
        requestId,
        traceParent
      },
      next
    );
  }
}

function readHeader(headers: Record<string, string | string[] | undefined>, name: string): string | undefined {
  const value = headers[name];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function setResponseHeader(response: ResponseLike, name: string, value: string) {
  if (response.header) {
    response.header(name, value);
    return;
  }

  response.setHeader?.(name, value);
}
