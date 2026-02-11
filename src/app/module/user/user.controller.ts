import { statusCodes } from "better-auth";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UserServices } from "./user.service";
import { Request, Response } from "express";

const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await UserServices.createDoctor(payload);

  sendResponse(res, {
    httpStatusCode: statusCodes.CREATED,
    success: true,
    message: "Doctor created successfully",
    data: result,
  });
});
export const UserController = { createDoctor };
