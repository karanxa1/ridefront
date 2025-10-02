/**
 * Error Handler Utility
 *
 * Provides consistent error handling across the application
 * with proper error classification, logging, and user-friendly messages
 */

import { toast } from 'sonner';

// Error types for classification
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Custom application error class
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly statusCode?: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public context?: Record<string, any>;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    statusCode?: number,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.context = context;

    // Maintains proper stack trace for where error was thrown
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}

// HTTP status code to error type mapping
const statusCodeToErrorType: Record<number, ErrorType> = {
  400: ErrorType.VALIDATION,
  401: ErrorType.AUTHENTICATION,
  403: ErrorType.AUTHORIZATION,
  404: ErrorType.NOT_FOUND,
  408: ErrorType.TIMEOUT,
  500: ErrorType.SERVER,
  502: ErrorType.SERVER,
  503: ErrorType.SERVER,
  504: ErrorType.TIMEOUT,
};

// User-friendly error messages
const errorMessages: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: 'Unable to connect to the server. Please check your internet connection.',
  [ErrorType.AUTHENTICATION]: 'Your session has expired. Please log in again.',
  [ErrorType.AUTHORIZATION]: "You don't have permission to perform this action.",
  [ErrorType.VALIDATION]: 'Please check your input and try again.',
  [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorType.SERVER]: 'Something went wrong on our end. Please try again later.',
  [ErrorType.TIMEOUT]: 'The request took too long. Please try again.',
  [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
};

/**
 * Parse error from various sources and create AppError
 */
export function parseError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Standard Error object
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('Network')) {
      return new AppError(errorMessages[ErrorType.NETWORK], ErrorType.NETWORK, ErrorSeverity.HIGH);
    }

    return new AppError(error.message, ErrorType.UNKNOWN, ErrorSeverity.MEDIUM);
  }

  // API Response error
  if (typeof error === 'object' && error !== null) {
    const err = error as any;

    // Check for status code
    if (err.status || err.statusCode) {
      const statusCode = err.status || err.statusCode;
      const errorType = statusCodeToErrorType[statusCode] || ErrorType.UNKNOWN;
      const message = err.message || err.error || errorMessages[errorType];

      return new AppError(
        message,
        errorType,
        statusCode >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
        statusCode
      );
    }

    // Check for error message
    if (err.message) {
      return new AppError(err.message, ErrorType.UNKNOWN, ErrorSeverity.MEDIUM);
    }
  }

  // String error
  if (typeof error === 'string') {
    return new AppError(error, ErrorType.UNKNOWN, ErrorSeverity.MEDIUM);
  }

  // Unknown error type
  return new AppError('An unexpected error occurred', ErrorType.UNKNOWN, ErrorSeverity.MEDIUM);
}

/**
 * Handle error with appropriate action (logging, notification, etc.)
 */
export function handleError(
  error: unknown,
  options: {
    showToast?: boolean;
    logToConsole?: boolean;
    customMessage?: string;
    context?: Record<string, any>;
  } = {}
): AppError {
  const { showToast = true, logToConsole = true, customMessage, context } = options;

  const appError = parseError(error);

  // Add additional context
  if (context) {
    appError.context = { ...appError.context, ...context };
  }

  // Log to console in development
  if (logToConsole && import.meta.env.DEV) {
    console.group(`🚨 Error [${appError.type}]`);
    console.error('Message:', appError.message);
    console.error('Type:', appError.type);
    console.error('Severity:', appError.severity);
    if (appError.statusCode) {
      console.error('Status Code:', appError.statusCode);
    }
    if (appError.context) {
      console.error('Context:', appError.context);
    }
    console.error('Stack:', appError.stack);
    console.groupEnd();
  }

  // Show toast notification
  if (showToast) {
    const message = customMessage || appError.message;

    switch (appError.severity) {
      case ErrorSeverity.LOW:
        toast.info(message);
        break;
      case ErrorSeverity.MEDIUM:
        toast.warning(message);
        break;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        toast.error(message);
        break;
    }
  }

  // In production, you would send to error tracking service
  // Example: Sentry.captureException(appError);

  return appError;
}

/**
 * Async wrapper for handling errors in async functions
 */
export function asyncErrorHandler<T>(
  promise: Promise<T>,
  errorHandler?: (error: AppError) => void
): Promise<[AppError | null, T | null]> {
  return promise
    .then((data): [null, T] => [null, data])
    .catch((error): [AppError, null] => {
      const appError = parseError(error);
      if (errorHandler) {
        errorHandler(appError);
      }
      return [appError, null];
    });
}

/**
 * Create a retry wrapper for API calls
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: boolean;
    onRetry?: (attempt: number, error: AppError) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000, backoff = true, onRetry } = options;

  let lastError: AppError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = parseError(error);

      // Don't retry on certain error types
      if (
        lastError.type === ErrorType.AUTHENTICATION ||
        lastError.type === ErrorType.AUTHORIZATION ||
        lastError.type === ErrorType.VALIDATION
      ) {
        throw lastError;
      }

      if (attempt < maxRetries) {
        const retryDelay = backoff ? delay * Math.pow(2, attempt - 1) : delay;

        if (onRetry) {
          onRetry(attempt, lastError);
        }

        if (import.meta.env.DEV) {
          console.log(`Retry attempt ${attempt}/${maxRetries} after ${retryDelay}ms`);
        }

        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw lastError!;
}

/**
 * Create error for API responses
 */
export function createApiError(
  statusCode: number,
  message?: string,
  context?: Record<string, any>
): AppError {
  const errorType = statusCodeToErrorType[statusCode] || ErrorType.UNKNOWN;
  const errorMessage = message || errorMessages[errorType];
  const severity = statusCode >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM;

  return new AppError(errorMessage, errorType, severity, statusCode, true, context);
}

/**
 * Validate response and throw error if invalid
 */
export function validateResponse<T>(response: any, validator: (data: any) => boolean): T {
  if (!validator(response)) {
    throw new AppError(
      'Invalid response format from server',
      ErrorType.VALIDATION,
      ErrorSeverity.MEDIUM
    );
  }
  return response as T;
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('Failed to parse JSON:', err);
    }
    return fallback;
  }
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: AppError): boolean {
  return (
    error.isOperational &&
    error.severity !== ErrorSeverity.CRITICAL &&
    error.type !== ErrorType.AUTHENTICATION
  );
}

/**
 * Get user-friendly error message
 */
export function getUserMessage(error: unknown): string {
  const appError = parseError(error);
  return appError.message;
}

/**
 * Log error to external service (placeholder)
 */
export function logErrorToService(_error: AppError): void {
  // In production, integrate with services like:
  // - Sentry
  // - LogRocket
  // - Rollbar
  // - DataDog

  if (import.meta.env.PROD) {
    // Example:
    // Sentry.captureException(error, {
    //   level: error.severity.toLowerCase(),
    //   tags: {
    //     errorType: error.type,
    //   },
    //   extra: error.context,
    // });
  }
}

// Export default handler
export default {
  parseError,
  handleError,
  asyncErrorHandler,
  withRetry,
  createApiError,
  validateResponse,
  safeJsonParse,
  isRecoverableError,
  getUserMessage,
  logErrorToService,
  AppError,
  ErrorType,
  ErrorSeverity,
};
