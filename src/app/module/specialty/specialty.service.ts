import { Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSpecialty = async (payload: Specialty): Promise<Specialty> => {
  return await prisma.specialty.create({
    data: payload,
  });
};

export const specialtyServices = {
  createSpecialty,
};
