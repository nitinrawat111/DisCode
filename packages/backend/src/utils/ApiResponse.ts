/**
 * Represents data returned by the API.
 * All responses from the API should be wrapped in this format.
 */
export class ApiResponse<DataType = unknown, ErrorType = unknown> {
  success: boolean;
  message: string;
  data?: DataType;
  errors?: ErrorType;

  constructor(
    statusCode: number,
    message: string = "",
    data?: DataType,
    errors?: ErrorType,
  ) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }
}
