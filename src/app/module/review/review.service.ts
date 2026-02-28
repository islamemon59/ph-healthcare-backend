import status from "http-status";
import { PaymentStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreateReviewPayload, IUpdateReviewPayload } from "./review.interface";

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

const getAllReviews = async () => {
  const reviews = await prisma.review.findMany({
    include: {
      patient: true,
      doctor: true,
      appointment: true,
    },
  });
  return reviews;
};

const myReviews = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!isUserExists) {
    throw new AppError(
      status.BAD_REQUEST,
      "Only patients can view their reviews",
    );
  }

  if (isUserExists.role === Role.DOCTOR) {
    return await prisma.review.findMany({
      where: {
        doctorId: isUserExists.id,
      },
      include: {
        patient: true,
        appointment: true,
      },
    });
  }

  if (isUserExists.role === Role.PATIENT) {
    return await prisma.review.findMany({
      where: {
        patientId: isUserExists.id,
      },
      include: {
        doctor: true,
        appointment: true,
      },
    });
  }
};

const updateReview = async (
  user: IRequestUser,
  reviewId: string,
  payload: IUpdateReviewPayload,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });
  const reviewData = await prisma.review.findUniqueOrThrow({
    where: {
      id: reviewId,
    },
  });
  if (!(patientData.id === reviewData.patientId)) {
    throw new AppError(status.BAD_REQUEST, "This is not your review!");
  }
  const result = await prisma.$transaction(async (tx) => {
    const updatedReview = await tx.review.update({
      where: {
        id: reviewId,
      },
      data: {
        ...payload,
      },
    });

    const averageRating = await tx.review.aggregate({
      where: {
        doctorId: reviewData.doctorId,
      },
      _avg: {
        rating: true,
      },
    });

    await tx.doctor.update({
      where: {
        id: updatedReview.doctorId,
      },
      data: {
        avgRating: averageRating._avg.rating as number,
      },
    });

    return updatedReview;
  });

  return result;
};

const deleteReview = async (user: IRequestUser, reviewId: string) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });
  const reviewData = await prisma.review.findUniqueOrThrow({
    where: {
      id: reviewId,
    },
  });
  if (!(patientData.id === reviewData.patientId)) {
    throw new AppError(status.BAD_REQUEST, "This is not your review!");
  }

  const result = await prisma.$transaction(async (tx) => {
    const deletedReview = await tx.review.delete({
      where: {
        id: reviewId,
      },
    });

    const averageRating = await tx.review.aggregate({
      where: {
        doctorId: deletedReview.doctorId,
      },
      _avg: {
        rating: true,
      },
    });

    await tx.doctor.update({
      where: {
        id: deletedReview.doctorId,
      },
      data: {
        avgRating: averageRating._avg.rating as number,
      },
    });
    return deletedReview;
  });

  return result;
};

export const ReviewService = {
  giveReview,
  getAllReviews,
  myReviews,
  updateReview,
  deleteReview,
};
