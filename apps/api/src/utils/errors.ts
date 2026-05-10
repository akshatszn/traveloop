export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const unauthorized = (message = "Authentication required") =>
  new AppError(401, "UNAUTHORIZED", message);

export const forbidden = (message = "You do not have access to this resource") =>
  new AppError(403, "FORBIDDEN", message);

export const notFound = (resource = "Resource") => new AppError(404, "NOT_FOUND", `${resource} not found`);

export const validationError = (details: unknown) =>
  new AppError(422, "VALIDATION_ERROR", "The request payload is invalid", details);
