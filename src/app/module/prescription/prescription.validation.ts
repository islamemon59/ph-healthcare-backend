import z4 from "zod/v4";

const createPrescriptionZodSchema = z4.object({
  appointmentId: z4.string("Appointment ID is required"),
  instruction: z4
    .string("Instruction is required")
    .min(1, "Instruction cannot be empty"),
  followUpDate: z4.date("Follow-up date is required").optional(),
});

const updatePrescriptionZodSchema = z4.object({
  instruction: z4
    .string("Instruction is required")
    .min(1, "Instruction cannot be empty")
    .optional(),
  followUpDate: z4.date("Follow-up date is required").optional(),
});


export const PrescriptionValidation = {
  createPrescriptionZodSchema,
  updatePrescriptionZodSchema,
};