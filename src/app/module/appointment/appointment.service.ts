import { uuidv7 } from "better-auth";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface";

const bookAppointment = async (
  payload: IBookAppointmentPayload,
  user: IRequestUser,
) => {
  const patientData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorData = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  const scheduleData = await prisma.schedule.findUniqueOrThrow({
    where: {
      id: payload.scheduleId,
    },
  });

  const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: scheduleData.id,
      },
    },
  });

  const videoCallingId = String(uuidv7());

  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        doctorId: payload.doctorId,
        patientId: patientData.id,
        scheduledId: doctorSchedule.scheduleId,
        videoCallingId,
      },
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: scheduleData.id,
        },
      },
      data: {
        isBooked: true,
      },
    });

    // TODO: Payment integration will be here
    return appointmentData;
  });

  return result;
};

export const AppointmentService = {
  bookAppointment,
  // getMyAppointments,
  // changeAppointmentStatus,
  // getMySingleAppointment,
  // getAllAppointments,
  // bookAppointmentWithPayLater,
  // initiatePayment,
  // cancelUnpaidAppointments,
};
