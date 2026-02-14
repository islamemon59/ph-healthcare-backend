import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { IRequestUser } from "../../interfaces/requestUser.interface";

interface IRegisterPatientPayload {
  name: string;
  email: string;
  password: string;
}

const registerPatient = async (payload: IRegisterPatientPayload) => {
  const { name, email, password } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Failed to register patient");
  }

  try {
    const patient = await prisma.$transaction(async (tx) => {
      const createdPatient = await tx.patient.create({
        data: {
          userId: data.user.id,
          name: payload.name,
          email: payload.email,
        },
      });
      return createdPatient;
    });

    const accessToken = tokenUtils.getAccessToken({
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
      userId: data.user.id,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
      userId: data.user.id,
    });
    return { ...data, patient, accessToken, refreshToken };
  } catch (error) {
    await prisma.user.delete({
      where: { id: data.user.id },
    });
    console.log("Transaction error:", error);
    throw error;
  }
};

const loginPatient = async (payload: IRegisterPatientPayload) => {
  const { email, password } = payload;

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "User is blocked");
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError(status.GONE, "User is deleted");
  }

  const accessToken = tokenUtils.getAccessToken({
    name: data.user.name,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
    userId: data.user.id,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    name: data.user.name,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
    userId: data.user.id,
  });

  return { ...data, accessToken, refreshToken };
};

const getMe = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: { id: user.userId },
    include: {
      patient: {
        include: {
          appointments: true,
          prescriptions: true,
          reviews: true,
          patientHealthData: true,
        }
      },
      doctor: {
        include: {
          specialties:true,
          appointments: true,
          reviews: true,
        }
      },
      admin: true,

    }
  });

  if(!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  return isUserExists;
};

export const authService = {
  registerPatient,
  loginPatient,
  getMe,
};
