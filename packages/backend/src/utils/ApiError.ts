/**
 * Represents a custom thrown error.
 * Will be parsed automatically the application's global error handler.
 *  - this does NOT represent the actual response sent to the client. 
 *  - all responses should be wrapped in the ApiResponse format, 
 *  - and this error will be parsed to fit that format by the global error handler.
 */
export class ApiError<ErrorType = unknown> extends Error {
  statusCode: number;
  message: string;
  errors?: ErrorType;

  constructor(
    statusCode: number = 500,
    message: string = "Internal Server Error",
    errors?: ErrorType,
  ) {
    super();
    this.name = "ApiError"; // To specifically indicate an ApiError (not general node.js Error), when logging
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
  }
}
