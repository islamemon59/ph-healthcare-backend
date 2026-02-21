import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import {
  ICreateDoctorSchedule,
  IUpdateDoctorSchedule,
} from "./doctorSchedule.interface";

const createMyDoctorSchedule = async (
  user: IRequestUser,
  payload: ICreateDoctorSchedule,
) => {
  const doctorData = await prisma.user.findUniqueOrThrow({
    where: {
      id: user.userId,
    },
  });

  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => {
    return {
      doctorId: doctorData.id,
      scheduleId,
    };
  });

  await prisma.doctorSchedules.createMany({
    data: doctorScheduleData,
  });

  const result = await prisma.doctorSchedules.findMany({
    where: {
      doctorId: doctorData.id,
      scheduleId: {
        in: payload.scheduleIds,
      },
    },
    include: {
      schedule: true,
    },
  });

  return result;
};

const updateMyDoctorSchedule = async (
  user: IRequestUser,
  payload: IUpdateDoctorSchedule,
) => {
  const doctorData = await prisma.user.findUniqueOrThrow({
    where: {
      id: user.userId,
    },
  });

  const deleteIds = payload.scheduleIds
    .filter((schedule) => schedule.shouldDelete)
    .map((schedule) => schedule.id);
  const createIds = payload.scheduleIds
    .filter((schedule) => !schedule.shouldDelete)
    .map((schedule) => schedule.id);

  const result = await prisma.$transaction(async (tx) => {
    await tx.doctorSchedules.deleteMany({
      where: {
        isBooked: false,
        doctorId: doctorData.id,
        scheduleId: {
          in: deleteIds,
        },
      },
    });

    const doctorScheduleData = createIds.map((scheduleId) => {
      return {
        doctorId: doctorData.id,
        scheduleId,
      };
    });

    const result = await tx.doctorSchedules.createMany({
      data: doctorScheduleData,
    });
    return result;
  });

  return result;
};

export const DoctorScheduleService = {
  createMyDoctorSchedule,
  // getAllDoctorSchedules,
  // getDoctorScheduleById,
  updateMyDoctorSchedule,
  // deleteMyDoctorSchedule,
  // getMyDoctorSchedules
};
