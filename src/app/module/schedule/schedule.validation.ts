import z4 from "zod";

const createScheduleZodSchema = z4.object({
  startDate: z4.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  endDate: z4.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  startTime: z4
    .string()
    .refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
      message: "Invalid time format",
    }),
  endTime: z4
    .string()
    .refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
      message: "Invalid time format",
    }),
});

const updateScheduleZodSchema = z4.object({
  startDate: z4
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .optional(),
  endDate: z4
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .optional(),
  startTime: z4
    .string()
    .refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
      message: "Invalid time format",
    })
    .optional(),
  endTime: z4
    .string()
    .refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
      message: "Invalid time format",
    })
    .optional(),
});

export const ScheduleValidation = {
  createScheduleZodSchema,
  updateScheduleZodSchema,
};
