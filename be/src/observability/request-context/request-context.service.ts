import { AsyncLocalStorage } from "node:async_hooks";

import { Injectable } from "@nestjs/common";

export type RequestContext = {
  requestId: string;
  traceParent?: string;
  traceId?: string;
  tenantId?: string;
  userId?: string;
  role?: string;
};

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  run<T>(context: RequestContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  getStore(): RequestContext | undefined {
    return this.storage.getStore();
  }

  getRequestId(): string | undefined {
    return this.getStore()?.requestId;
  }

  merge(context: Partial<RequestContext>) {
    const store = this.storage.getStore();

    if (!store) {
      return;
    }

    Object.assign(store, context);
  }
}
