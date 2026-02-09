import { Request, Response } from "express";
import { specialtyServices } from "./specialty.service";
import { catchAsync } from "../../shared/catchAsync";

const createSpecialty = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await specialtyServices.createSpecialty(payload);
  res.status(201).json({
    success: true,
    message: "Specialty created successfully",
    data: result,
  });
});

const getAllSpecialty = catchAsync(async (req: Request, res: Response) => {
  const result = await specialtyServices.getAllSpecialty();
  res.status(200).json({
    success: false,
    message: "Specialties fetched successfully",
    data: result,
  });
});

const deleteSpecialty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await specialtyServices.deleteSpecialty(id as string);

  res.status(200).json({
    success: true,
    message: "Specialty delete successfully",
    data: result,
  });
});

const updateSpecialty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await specialtyServices.updateSpecialty(id as string, payload);

  res.status(200).json({
    success: true,
    message: "Specialty update successfully",
    data: result,
  });
});

export const specialtyController = {
  createSpecialty,
  getAllSpecialty,
  deleteSpecialty,
  updateSpecialty,
};
