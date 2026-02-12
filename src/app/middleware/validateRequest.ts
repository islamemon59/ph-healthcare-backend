import { NextFunction, Request, Response } from "express";
import z4 from "zod/v4";

export const validateRequest = (zodSchema: z4.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsedResult = zodSchema.safeParse(req.body);

    if (!parsedResult.success) {
      next(parsedResult.error);
    }
    req.body = parsedResult.data;
    next();
  };
};
