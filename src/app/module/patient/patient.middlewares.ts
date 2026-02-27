import { NextFunction, Request, Response } from "express";
import {
  IUpdatePatientInfoPayload,
  IUpdatePatientProfilePayload,
} from "./patient.interface";

export const updatePatientProfileMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body.data) {
    req.body = JSON.parse(req.body.data);
  }

  const payload: IUpdatePatientProfilePayload = req.body;

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[] | undefined;
  };

  if (files?.profilePhoto?.[0]) {
    if (!payload.patientInfo) {
      payload.patientInfo = {} as IUpdatePatientInfoPayload;
    }
    payload.patientInfo.profilePhoto = files.profilePhoto[0].path;
  }

  if (
    files?.medicalReports &&
    files.medicalReports.length > 0 &&
    Array.isArray(files.medicalReports)
  ) {
    const newReports = files.medicalReports.map((file) => ({
      reportName: file.originalname,
      reportLink: file.path,
    }));
    if (payload.medicalReports && Array.isArray(payload.medicalReports)) {
      payload.medicalReports = [...payload.medicalReports, ...newReports];
    } else {
      payload.medicalReports = newReports;
    }
  }
  console.log(payload);

  req.body = payload;

  console.log(req.body);

  next();
};
