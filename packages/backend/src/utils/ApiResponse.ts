// Represents the API response object
export class ApiResponse<DataType = unknown, ErrorType = unknown> {
  success: boolean;
  message: string;
  data: DataType;
  errors: ErrorType;

  constructor(
    statusCode: number,
    message: string = "",
    data: DataType = undefined,
    errors: ErrorType = undefined,
  ) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }
}
