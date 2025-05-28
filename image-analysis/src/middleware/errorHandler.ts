import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`❌ Error ${statusCode}: ${message}`);
  console.error("Stack:", err.stack);

  if (process.env.NODE_ENV === "development") {
    res.status(statusCode).json({
      success: false,
      error: {
        message,
        stack: err.stack,
        statusCode,
      },
    });
  } else {
    res.status(statusCode).json({
      success: false,
      error: {
        message: statusCode >= 500 ? "Internal Server Error" : message,
        statusCode,
      },
    });
  }
};
