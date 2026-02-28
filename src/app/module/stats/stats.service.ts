import { PaymentStatus, Role } from "../../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { prisma } from "../../lib/prisma";

const getDashboardStatsData = async (user: IRequestUser) => {
  let statsData;

  switch (user.role) {
    case Role.SUPER_ADMIN:
      statsData = await getSuperAdminStatsData();
      break;
    case Role.ADMIN:
      statsData = await getAdminStatsData();
      break;
    case Role.DOCTOR:
      statsData = await getDoctorStatsData(user);
      break;
    case Role.PATIENT:
      statsData = await getPatientStatsData(user);
      break;
    default:
      throw new AppError(status.BAD_REQUEST, "Invalid role");
  }

  return statsData;
};

const getSuperAdminStatsData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const doctorCount = await prisma.doctor.count();
  const patientCount = await prisma.patient.count();
  const paymentCount = await prisma.payment.count();
  const userCount = await prisma.user.count();
  const adminCount = await prisma.admin.count();
  const superAdminCount = await prisma.user.count({
    where: {
      role: Role.SUPER_ADMIN,
    },
  });

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
    },
  });

  const pieChartData = await getPieChartData();
  const barChartData = await getBarChartData();

  return {
    appointmentCount,
    doctorCount,
    patientCount,
    paymentCount,
    userCount,
    adminCount,
    superAdminCount,
    totalRevenue,
    pieChartData,
    barChartData,
  };
};

const getAdminStatsData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const doctorCount = await prisma.doctor.count();
  const patientCount = await prisma.patient.count();
  const paymentCount = await prisma.payment.count();
  const userCount = await prisma.user.count();
  const adminCount = await prisma.admin.count();

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
    },
  });

  const pieChartData = await getPieChartData();
  const barChartData = await getBarChartData();

  return {
    appointmentCount,
    patientCount,
    doctorCount,
    paymentCount,
    userCount,
    adminCount,
    totalRevenue,
    pieChartData,
    barChartData,
  };
};

const getDoctorStatsData = async (user: IRequestUser) => {
  const doctorData = await prisma.doctor.findUnique({
    where: {
      id: user.userId,
    },
    include: {
      appointments: true,
      reviews: true,
      user: true,
    },
  });

  const reviewCount = await prisma.review.count({
    where: {
      doctorId: user.userId,
    },
  });

  const patientCount = await prisma.appointment.groupBy({
    by: ["patientId"],
    where: {
      doctorId: user.userId,
    },
    _count: {
      id: true,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: {
      doctorId: user.userId,
    },
  });

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
      appointment: {
        doctorId: user.userId,
      },
    },
  });

  const appointStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    where: {
      doctorId: doctorData?.id,
    },
    _count: {
      id: true,
    },
  });

  const formattedAppointmentDistribution = appointStatusDistribution.map(
    ({ status, _count }) => ({
      status,
      count: _count.id,
    }),
  );

  return {
    reviewCount,
    patientCount: patientCount.length,
    appointmentCount,
    totalRevenue,
    appointStatusDistribution: formattedAppointmentDistribution,
  };
};

const getPatientStatsData = async (user: IRequestUser) => {
  const patientData = await prisma.patient.findUnique({
    where: {
      id: user.userId,
    },
  });

  const reviewCount = await prisma.review.count({
    where: {
      patientId: patientData?.id,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: {
      patientId: patientData?.id,
    },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    where: {
      patientId: patientData?.id,
    },
    _count: {
      id: true,
    },
  });

  const formattedAppointmentDistribution = appointmentStatusDistribution.map(
    ({ status, _count }) => ({
      status,
      count: _count.id,
    }),
  );

  return {
    reviewCount,
    appointmentCount,
    formattedAppointmentDistribution,
  };
};

const getPieChartData = async () => {
  const appointmentStatusData = await prisma.appointment.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });
  const formattedAppointmentStatusData = appointmentStatusData.map(
    ({ status, _count }) => ({
      status,
      count: _count.id,
    }),
  );
  return formattedAppointmentStatusData;
};

const getBarChartData = async () => {
  interface AppointmentCountByMonth {
    month: Date;
    count: bigint;
  }

  const appointmentCountByMonth: AppointmentCountByMonth[] =
    await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "createdAt") AS month,
    CAST(COUNT(*) AS INTEGER) AS count
    FROM "appointments"
    WHERE EXTRACT(YEAR FROM "createdAt") = EXTRACT(YEAR FROM CURRENT_DATE)
    GROUP BY month
    ORDER BY month ASC;
    `;

  return appointmentCountByMonth;
};

export const StatsService = {
  getDashboardStatsData,
};
