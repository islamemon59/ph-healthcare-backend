import { Gender } from "../../../generated/prisma/enums";

export interface IDoctorPayload {
  name: string;
  email: string;
  password: string;
  specialization: string;
  experience: number;
}

export interface IUpdateDoctorSpecialtiesPayload {
  specialtyId: string;
  shouldDelete?: boolean;
}

export interface IUpdateDoctorPayload {
  doctor?: {
    name?: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
    experience?: number;
    registrationNumber?: string;
    gender?: Gender;
    appointmentFee?: number;
    qualifications?: string;
    currentWorkplace?: string;
    designation?: string;
  };
  specialties?: IUpdateDoctorSpecialtiesPayload[];
}
