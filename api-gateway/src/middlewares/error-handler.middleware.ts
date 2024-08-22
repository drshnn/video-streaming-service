import { NextFunction, Request, Response } from "express";
import { AppError } from "../error/app.error";

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const name = err.name || 'InternalServerError';

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        name
    });
};

export default errorHandler;
