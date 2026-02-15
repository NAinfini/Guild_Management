/**
 * Typed Error Classes
 * Replace string-matching error classification with instanceof checks.
 * The endpoint factory checks instanceof AppError first, then falls back
 * to string matching for backwards compatibility.
 */

export class AppError extends Error {
  readonly statusCode: number;
  readonly errorCode: string;
  readonly details?: unknown;

  constructor(message: string, statusCode: number, errorCode: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Incorrect credentials') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * @deprecated Obsolete candidate: no current references in runtime/tests.
 * Replacement: throw AppError(message, 400, 'VALIDATION_ERROR', details)
 * until a dedicated type is needed again.
 * TODO(remove-by 2026-03-31): remove if still unused.
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/**
 * @deprecated Obsolete candidate: no current references in runtime/tests.
 * Replacement: throw AppError(message, 409, 'CONFLICT')
 * until a dedicated type is needed again.
 * TODO(remove-by 2026-03-31): remove if still unused.
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}
