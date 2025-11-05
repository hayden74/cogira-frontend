import type { MiddlewareObj } from '@middy/core';
import { buildResponse } from '../http';
import { isAppError } from '../errors';

export const errorHandler = (): MiddlewareObj<any, any> => ({
  onError: async (request: any) => {
    const err = request.error;
    const cid = request.internal?.correlationId;

    if (isAppError(err)) {
      console.error(
        JSON.stringify({
          level: 'error',
          msg: 'handled.error',
          correlationId: cid,
          code: err.code,
          status: err.status,
          error: err.message,
        })
      );
      request.response = buildResponse(
        err.status,
        { message: err.message, code: err.code, details: err.details },
        { 'X-Correlation-Id': cid }
      );
      return;
    }

    if (err instanceof SyntaxError) {
      console.error(
        JSON.stringify({
          level: 'error',
          msg: 'malformed.json',
          correlationId: cid,
        })
      );
      request.response = buildResponse(
        400,
        { message: 'Malformed JSON' },
        { 'X-Correlation-Id': cid }
      );
      return;
    }

    console.error(
      JSON.stringify({
        level: 'error',
        msg: 'unhandled.error',
        correlationId: cid,
        error: String(err),
      })
    );
    request.response = buildResponse(
      500,
      { message: 'Internal Server Error' },
      { 'X-Correlation-Id': cid }
    );
  },
});
