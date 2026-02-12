import z4 from "zod/v4";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface";
import status from "http-status";

export const handleZodError = (err: z4.ZodError): TErrorResponse => {
  const statusCode = status.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSource: TErrorSources[] = [];

  err.issues.forEach((issue) => {
    errorSource.push({
      path: issue.path.join("."),
      message: issue.message,
    });
  });

  return {
    success: false,
    message,
    errorSource,
    statusCode,
  };
};
