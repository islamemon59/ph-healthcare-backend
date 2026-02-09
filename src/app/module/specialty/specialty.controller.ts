import { Request, Response } from "express";
import { specialtyServices } from "./specialty.service";

const createSpecialty = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const result = await specialtyServices.createSpecialty(payload);

    res.status(201).json({
      success: true,
      message: "Specialty created successfully",
      data: result,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create specialties",
      error: error.message,
    });
  }
};

const getAllSpecialty = async (req: Request, res: Response) => {
  try {
    const result = await specialtyServices.getAllSpecialty();

    res.status(201).json({
      success: true,
      message: "Specialty fetched successfully",
      data: result,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetched specialties",
      error: error.message,
    });
  }
};

const deleteSpecialty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const result = await specialtyServices.updateSpecialty(
      id as string,
      payload,
    );

    res.status(200).json({
      success: true,
      message: "Specialty delete successfully",
      data: result,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete specialties",
      error: error.message,
    });
  }
};

const updateSpecialty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await specialtyServices.deleteSpecialty(id as string);

    res.status(200).json({
      success: true,
      message: "Specialty update successfully",
      data: result,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update specialties",
      error: error.message,
    });
  }
};

export const specialtyController = {
  createSpecialty,
  getAllSpecialty,
  deleteSpecialty,
  updateSpecialty,
};
