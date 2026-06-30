export class PayonifyError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "PayonifyError";
    this.status = status;
    this.code = code;
  }
}

export class AuthenticationError extends PayonifyError {
  constructor(message = "Invalid API key provided") {
    super(message, 401, "authentication_error");
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends PayonifyError {
  constructor(message = "Resource not found") {
    super(message, 404, "not_found");
    this.name = "NotFoundError";
  }
}

export class ValidationError extends PayonifyError {
  readonly errors?: Record<string, string>;

  constructor(
    message = "Validation failed",
    errors?: Record<string, string>,
  ) {
    super(message, 400, "validation_error");
    this.name = "ValidationError";
    this.errors = errors;
  }
}

export class RateLimitError extends PayonifyError {
  constructor(message = "Too many requests") {
    super(message, 429, "rate_limit_exceeded");
    this.name = "RateLimitError";
  }
}
