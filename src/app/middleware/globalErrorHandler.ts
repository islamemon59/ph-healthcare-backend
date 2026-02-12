/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";
import status from "http-status";
import z4 from "zod/v4";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface";
import { handleZodError } from "../errorHelpers/handleZodError";
import AppError from "../errorHelpers/AppError";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.error(err);
  }

  let errorSource: TErrorSources[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = err.message || "Internal Server Error";
  let stack: string | undefined = undefined;

  if (err instanceof z4.ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode || status.INTERNAL_SERVER_ERROR;
    message = simplifiedError.message;
    errorSource.push(...(simplifiedError.errorSource || []));
  } else if (err instanceof AppError) {
    statusCode = err.statusCode || status.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
    errorSource = [
      {
        path: "",
        message: err.message,
      },
    ];
  } else if (err instanceof Error) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
  }

  const customError: TErrorResponse = {
    success: false,
    message,
    errorSource,
    stack: envVars.NODE_ENV === "development" ? stack : undefined,
    error: envVars.NODE_ENV === "development" ? err.message : undefined,
  };

  res.status(statusCode).json(customError);
};
