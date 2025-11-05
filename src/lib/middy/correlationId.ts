import type { MiddlewareObj } from '@middy/core';
import { v4 as uuidv4 } from 'uuid';

export const correlationId = (): MiddlewareObj<any, any> => ({
  before: async (request: any) => {
    const event = request.event || {};
    const headers = event.headers || {};
    let cid = '';
    for (const [k, v] of Object.entries(headers)) {
      if (
        k.toLowerCase() === 'x-correlation-id' &&
        typeof v === 'string' &&
        v
      ) {
        cid = v;
        break;
      }
    }
    if (!cid) cid = event.requestContext?.requestId || uuidv4();
    request.internal = request.internal || {};
    request.internal.correlationId = cid;
  },
  after: async (request: any) => {
    const cid = request.internal?.correlationId;
    request.response = request.response || {};
    request.response.headers = {
      ...(request.response.headers || {}),
      'X-Correlation-Id': cid,
    };
  },
});
