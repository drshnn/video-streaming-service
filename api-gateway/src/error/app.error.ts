class AppError extends Error {
    public statusCode: number = 500;
    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;

        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);
    }
}

class BadRequestError extends AppError {
    constructor(message: string = 'Bad Request') {
        super(message, 400);
    }
}

class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401);
    }
}

class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(message, 403);
    }
}

class NotFoundError extends AppError {
    constructor(message: string = 'Not Found') {
        super(message, 404);
    }
}

class MethodNotAllowedError extends AppError {
    constructor(message: string = 'Method Not Allowed') {
        super(message, 405);
    }
}

class ConflictError extends AppError {
    constructor(message: string = 'Conflict') {
        super(message, 409);
    }
}

class InternalServerError extends AppError {
    constructor(message: string = 'Internal Server Error') {
        super(message, 500);
    }
}

export {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    MethodNotAllowedError,
    ConflictError,
    InternalServerError
};
