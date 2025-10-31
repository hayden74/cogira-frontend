export class AppError extends Error {
  status: number
  code?: string
  details?: unknown
  constructor(status: number, message: string, options?: { code?: string; details?: unknown; cause?: unknown }) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = options?.code
    this.details = options?.details
    if (options?.cause) (this as any).cause = options.cause
  }
  static badRequest(message = 'Bad Request', details?: unknown) {
    return new AppError(400, message, { code: 'bad_request', details })
  }
  static unauthorized(message = 'Unauthorized', details?: unknown) {
    return new AppError(401, message, { code: 'unauthorized', details })
  }
  static forbidden(message = 'Forbidden', details?: unknown) {
    return new AppError(403, message, { code: 'forbidden', details })
  }
  static notFound(message = 'Not Found', details?: unknown) {
    return new AppError(404, message, { code: 'not_found', details })
  }
  static conflict(message = 'Conflict', details?: unknown) {
    return new AppError(409, message, { code: 'conflict', details })
  }
  static unprocessable(message = 'Unprocessable Entity', details?: unknown) {
    return new AppError(422, message, { code: 'unprocessable_entity', details })
  }
}

export const isAppError = (err: unknown): err is AppError => {
  return !!err && typeof err === 'object' && (err as any).name === 'AppError' && typeof (err as any).status === 'number'
}

