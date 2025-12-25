import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    const statusCode = err.statusCode || 500;
    const message = err.isOperational
        ? err.message
        : 'An unexpected error occurred. Please try again later.';

    res.status(statusCode).json({
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

export const createError = (
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
): AppError => {
    const error: AppError = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = isOperational;
    return error;
};
