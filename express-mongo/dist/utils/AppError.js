export class AppError extends Error {
    statusCode;
    message;
    isOperational;
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
export class ValidationError extends AppError {
    errors;
    constructor(errors, message = "Validation failed") {
        super(400, message);
        this.errors = errors;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(401, message);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}
export class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(403, message);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}
export class NotFoundError extends AppError {
    constructor(message = "Not found") {
        super(404, message);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
export class ConflictError extends AppError {
    constructor(message = "Conflict") {
        super(409, message);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
//# sourceMappingURL=AppError.js.map