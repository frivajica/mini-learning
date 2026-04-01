import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../utils/AppError.js";

function isOperationalError(err: Error): err is Error & {
  statusCode: number;
  errors?: Record<string, string[]>;
  isOperational: true;
} {
  return (
    (err as any).isOperational === true &&
    typeof (err as any).statusCode === "number"
  );
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const requestId = (req.headers["x-request-id"] as string) || "unknown";

  if (err instanceof AppError) {
    const response: Record<string, unknown> = {
      message: err.message,
      statusCode: err.statusCode,
      status: err.statusCode >= 400 && err.statusCode < 500 ? "fail" : "error",
    };

    if (err instanceof ValidationError) {
      response.errors = err.errors;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  if (
    isOperationalError(err) &&
    err.statusCode >= 400 &&
    err.statusCode < 500
  ) {
    res.status(err.statusCode).json({
      message: err.message,
      statusCode: err.statusCode,
      status: "fail",
      errors: err.errors,
    });
    return;
  }

  console.error({ err, requestId }, "Unhandled error");

  res.status(500).json({
    message: "Internal server error",
    statusCode: 500,
    status: "error",
  });
}
