import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { PatientService } from "./patient.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { IRequestUser } from "../../interfaces/requestUser.interface";

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const payload = req.body;

  const result = await PatientService.updateMyProfile(user, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Patient profile updated successfully",
    data: result,
  });
});

export const PatientController = {
  updateMyProfile,
};