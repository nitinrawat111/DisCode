// Represents a custom thrown error for the API
export class ApiError<ErrorType = unknown> extends Error {
  statusCode: number;
  message: string;
  errors: ErrorType;

  constructor(
    statusCode: number = 500,
    message: string = "Internal Server Error",
    errors: ErrorType = undefined,
  ) {
    super();
    this.name = "ApiError"; // To specifically indicate an ApiError (not general node.js Error), when logging
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
  }
}
