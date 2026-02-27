import status from "http-status";
import { PaymentStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreateReviewPayload } from "./review.interface";

const giveReview = async (
  user: IRequestUser,
  payload: ICreateReviewPayload,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
  });

  if (appointmentData.paymentStatus !== PaymentStatus.PAID) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only review after payment is done",
    );
  }

  if (appointmentData.patientId !== patientData.id) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only review your own appointment",
    );
  }

  const isReviewed = await prisma.review.findFirst({
    where: {
      patientId: patientData.id,
      doctorId: appointmentData.doctorId,
    },
  });

  if (isReviewed) {
    throw new AppError(
      status.BAD_REQUEST,
      "You have already reviewed this doctor",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        ...payload,
        patientId: patientData.id,
        doctorId: appointmentData.doctorId,
      },
    });

    const avgRating = await tx.review.aggregate({
      where: {
        doctorId: appointmentData.doctorId,
      },
      _avg: {
        rating: true,
      },
    });

    await tx.doctor.update({
      where: {
        id: appointmentData.doctorId,
      },
      data: {
        avgRating: avgRating._avg.rating as number,
      },
    });

    return review;
  });

  return result;
};

export const ReviewService = {
  giveReview,
};
