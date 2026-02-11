import { prisma } from "../../lib/prisma";

const getAllDoctors = async () => {
  return await prisma.doctor.findMany({
    select: {
      user: true,
      specialties: {
        select: {
          specialty: true,
        },
      },
    },
  });
};

const getDoctorById = async (id: string) => {
  return await prisma.doctor.findUnique({
    where: {id},
    select: {
      user: true,
        specialties: {
            select: {
                specialty: true,
            },
        },
    },
  });
}

export const DoctorService = {
  getAllDoctors,
  getDoctorById
};
