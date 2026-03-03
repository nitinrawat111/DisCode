// Represents the API response object
export default class ApiResponse {
  success: boolean;
  message: string;
  data: any;
  errors: any;

  constructor(
    statusCode: number,
    message: string = "",
    data: any = undefined,
    errors: any = undefined,
  ) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }
}
