export interface ICreatePrescriptionPayload {
  appointmentId: string;
  followUpDate: Date;
  instructions: string;
}

export interface IUpdatePrescriptionPayload {
  followUpDate?: Date;
  instructions?: string;
}

export interface IPrescriptionData {
  doctorName: string;
  doctorEmail: string;
  patientName: string;
  patientEmail: string;
  followUpDate: Date;
  instructions: string;
  prescriptionId: string;
  appointmentDate: Date;
  createdAt: Date;
}

