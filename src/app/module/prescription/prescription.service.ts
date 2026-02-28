/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import { Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../../../config/cloudinary.config";
import {
  ICreatePrescriptionPayload,
  IUpdatePrescriptionPayload,
} from "./prescription.interface";
import { generatePrescriptionPDF } from "./prescription.utils";
import { sendEmail } from "../../utils/email";

const givePrescription = async (
  user: IRequestUser,
  payload: ICreatePrescriptionPayload,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
    include: {
      patient: true,
      doctor: {
        include: {
          specialties: true,
        },
      },
      schedule: {
        include: {
          doctorSchedules: true,
        },
      },
    },
  });

  if (appointmentData.doctorId !== doctorData.id) {
    throw new AppError(status.BAD_REQUEST, "This is not your appointment!");
  }

  const isAlreadyPrescribed = await prisma.prescription.findFirst({
    where: {
      appointmentId: payload.appointmentId,
    },
  });

  if (isAlreadyPrescribed) {
    throw new AppError(
      status.BAD_REQUEST,
      "This appointment is already prescribed!",
    );
  }

  const followUpdate = new Date(payload.followUpDate);

  const result = await prisma.$transaction(
    async (tx) => {
      const result = await tx.prescription.create({
        data: {
          ...payload,
          appointmentId: appointmentData.id,
          patientId: appointmentData.patientId,
          doctorId: appointmentData.doctorId,
          followUpDate: followUpdate,
        },
      });

      const pdfBuffer = await generatePrescriptionPDF({
        doctorName: doctorData.name,
        doctorEmail: doctorData.email,
        patientName: appointmentData.patient.name,
        patientEmail: appointmentData.patient.email,
        followUpDate: followUpdate,
        instructions: payload.instructions,
        prescriptionId: result.id,
        appointmentDate: appointmentData.schedule.startDate,
        createdAt: new Date(),
      });

      const fileName = `Prescription-${Date.now()}.pdf`;

      const uploadedFile = await uploadFileToCloudinary(pdfBuffer, fileName);

      const pdfUrl = uploadedFile.secure_url;

      const updatedPrescription = await tx.prescription.update({
        where: {
          id: result.id,
        },
        data: {
          pdfUrl: pdfUrl,
        },
      });

      try {
        const patient = appointmentData.patient;
        const doctor = appointmentData.doctor;

        await sendEmail({
          to: patient.email,
          subject: `You have received a new prescription from Dr. ${doctor.name}`,
          templateName: "prescription",

          templateData: {
            doctorName: doctor.name,
            patientName: patient.name,
            specialization: doctor.specialties
              .map((s: any) => s.title)
              .join(", "),
            appointmentDate: new Date(
              appointmentData.schedule.startDate,
            ).toLocaleDateString(),
            issueDate: new Date().toLocaleDateString(),
            prescriptionId: result.id,
            instructions: payload.instructions,
            followUpdate: followUpdate.toLocaleDateString(),
            pdfUrl: pdfUrl,
          },
          attachments: [
            {
              filename: fileName,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ],
        });
      } catch (error) {
        console.error(
          "Failed To send email notification for prescription",
          error,
        );
      }
      return updatedPrescription;
    },
    {
      maxWait: 15000,
      timeout: 20000,
    },
  );
  return result;
};

const myPrescriptions = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      email: user?.email,
    },
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (isUserExists.role === Role.DOCTOR) {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        doctor: {
          email: user?.email,
        },
      },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
    });
    return prescriptions;
  }

  if (isUserExists.role === Role.PATIENT) {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        patient: {
          email: user?.email,
        },
      },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
    });
    return prescriptions;
  }
};

const getAllPrescriptions = async () => {
  const result = await prisma.prescription.findMany({
    include: {
      patient: true,
      doctor: true,
      appointment: true,
    },
  });

  return result;
};

const updatePrescription = async (
  user: IRequestUser,
  prescriptionId: string,
  payload: IUpdatePrescriptionPayload,
) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const prescriptionData = await prisma.prescription.findUniqueOrThrow({
    where: {
      id: prescriptionId,
    },
    include: {
      doctor: true,
      patient: true,

      appointment: {
        include: {
          schedule: true,
        },
      },
    },
  });

  if (!(user?.email === prescriptionData.doctor.email)) {
    throw new AppError(status.BAD_REQUEST, "This is not your prescription!");
  }

  const updateInstruction =
    payload.instructions || prescriptionData.instructions;
  const updateFollowUpDate = payload.followUpDate
    ? new Date(payload.followUpDate)
    : prescriptionData.followUpDate;

  const pdfBuffer = await generatePrescriptionPDF({
    doctorName: prescriptionData.doctor.name,
    doctorEmail: prescriptionData.doctor.email,
    patientName: prescriptionData.patient.name,
    patientEmail: prescriptionData.patient.email,
    followUpDate: updateFollowUpDate,
    instructions: updateInstruction,
    prescriptionId: prescriptionData.id,
    appointmentDate: prescriptionData.appointment.schedule.startDate,
    createdAt: new Date(),
  });

  const fileName = `Prescription-${Date.now()}.pdf`;
  const uploadedFile = await uploadFileToCloudinary(pdfBuffer, fileName);

  const newPdfUrl = uploadedFile.secure_url;

  if (prescriptionData.pdfUrl) {
    try {
      await deleteFileFromCloudinary(prescriptionData.pdfUrl);
    } catch (error) {
      console.error("Failed to delete PDF from Cloudinary:", error);
    }
  }

  const result = await prisma.prescription.update({
    where: {
      id: prescriptionId,
    },
    data: {
      pdfUrl: newPdfUrl,
      instructions: updateInstruction,
      followUpDate: updateFollowUpDate,
    },
    include: {
      doctor: true,
      patient: true,
      appointment: {
        include: {
          schedule: true,
        },
      },
    },
  });

  return result;
};

const deletePrescription = async (
  user: IRequestUser,
  prescriptionId: string,
): Promise<void> => {
  // Verify user exists
  const isUserExists = await prisma.user.findUnique({
    where: {
      email: user?.email,
    },
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // Fetch prescription data
  const prescriptionData = await prisma.prescription.findUniqueOrThrow({
    where: {
      id: prescriptionId,
    },
    include: {
      doctor: true,
    },
  });

  // Verify the user is the doctor for this prescription
  if (!(user?.email === prescriptionData.doctor.email)) {
    throw new AppError(status.BAD_REQUEST, "This is not your prescription!");
  }

  // Delete PDF from Cloudinary if it exists
  if (prescriptionData.pdfUrl) {
    try {
      await deleteFileFromCloudinary(prescriptionData.pdfUrl);
    } catch (deleteError) {
      // Log but don't fail - still delete from database
      console.error("Failed to delete PDF from Cloudinary:", deleteError);
    }
  }

  // Delete prescription from database
  await prisma.prescription.delete({
    where: {
      id: prescriptionId,
    },
  });
};

export const PrescriptionService = {
  givePrescription,
  myPrescriptions,
  getAllPrescriptions,
  updatePrescription,
  deletePrescription,
};
