export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export class AIAPIError extends AIError {
  constructor(
    message: string,
    public statusCode?: number,
    details?: unknown
  ) {
    super(message, 'AI_API_ERROR', details);
    this.name = 'AIAPIError';
  }
}

export class AIRateLimitError extends AIError {
  constructor(message: string = 'Rate limit exceeded', details?: unknown) {
    super(message, 'AI_RATE_LIMIT_ERROR', details);
    this.name = 'AIRateLimitError';
  }
}

export class AITimeoutError extends AIError {
  constructor(message: string = 'AI request timed out', details?: unknown) {
    super(message, 'AI_TIMEOUT_ERROR', details);
    this.name = 'AITimeoutError';
  }
}

export class AIValidationError extends AIError {
  constructor(message: string, details?: unknown) {
    super(message, 'AI_VALIDATION_ERROR', details);
    this.name = 'AIValidationError';
  }
}
