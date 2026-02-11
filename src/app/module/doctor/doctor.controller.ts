import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { DoctorService } from "./doctor.service";
import { sendResponse } from "../../shared/sendResponse";
import { statusCodes } from "better-auth";

const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
  const result = await DoctorService.getAllDoctors();
  sendResponse(res, {
    httpStatusCode: statusCodes.OK,
    success: true,
    message: "Doctors retrieved successfully",
    data: result,
  });
});

const getDoctorById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DoctorService.getDoctorById(id as string);
  sendResponse(res, {
    httpStatusCode: statusCodes.OK,
    success: true,
    message: "Doctor retrieved successfully",
    data: result,
  });
});

export const DoctorController = {
  getAllDoctors,
    getDoctorById
};
