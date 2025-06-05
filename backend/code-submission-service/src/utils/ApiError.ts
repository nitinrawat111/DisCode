export default class ApiError extends Error {
    statusCode:  number;
    message: string;
    errors: any;

    constructor(
        statusCode: number = 500, 
        message: string = "Internal Server Error",
        errors: any = undefined
    ) {
        super();
        this.name = "ApiError"; // To specifically indicate an ApiError (not general node.js Error), when logging
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
    }
};