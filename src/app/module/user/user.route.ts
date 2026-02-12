import { NextFunction, Request, Response, Router } from "express";
import { UserController } from "./user.controller";
import z4 from "zod/v4";
import { Gender } from "../../../generated/prisma/enums";

const router = Router();

/*
 
 {
    "password": "123456789",
    "doctor": {
        "name": "Dr. Sarah Ahmed",
        "email": "sarah.ahmed@example.com",
        "profilePhoto": "https://example.com/images/dr-sarah.jpg",
        "contactNumber": "+8801712345678",
        "address": "House 12, Road 5, Dhanmondi, Dhaka",
        "registrationNumber": "BMDC-2024-56789",
        "experience": 8,
        "gender": "FEMALE",
        "appointmentFee": 1200.0,
        "qualification": "MBBS, FCPS (Medicine)",
        "currentWorkingPlace": "Square Hospital, Dhaka",
        "designation": "Consultant Medicine Specialist",
        "avgRating": 4.6
    },
    "specialties": [
        "019c4143-9197-772e-a76a-5b5d36c81e89",
        "019c4fa2-a916-72e4-a291-96ec70c7dd39"
    ]
}
 */

const createDoctorZodSchema = z4.object({
  password: z4
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(16, "Password must be at most 16 characters long"),
  doctor: z4.object({
    name: z4
      .string()
      .min(3, "Name must be at least 3 characters long")
      .max(100, "Name must be at most 100 characters long"),
    email: z4.string().email("Invalid email format"),
    profilePhoto: z4.string().url("Invalid URL format").optional(),
    contactNumber: z4
      .string()
      .min(10, "Contact number must be at least 10 digits long")
      .max(15, "Contact number must be at most 15 digits long")
      .optional(),
    address: z4
      .string()
      .min(10, "Address must be at least 10 characters long")
      .max(200, "Address must be at most 200 characters long"),
    registrationNumber: z4
      .string()
      .min(5, "Registration number must be at least 5 characters long")
      .max(20, "Registration number must be at most 20 characters long"),
    experience: z4
      .number()
      .min(0, "Experience must be a positive number")
      .max(50, "Experience must be less than or equal to 50 years"),
    gender: z4.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]),
    appointmentFee: z4
      .number()
      .min(0, "Appointment fee must be a positive number")
      .max(10000, "Appointment fee must be less than or equal to 10000"),
    qualification: z4
      .string()
      .min(5, "Qualification must be at least 5 characters long")
      .max(100, "Qualification must be at most 100 characters long"),
    currentWorkingPlace: z4
      .string()
      .min(5, "Current working place must be at least 5 characters long")
      .max(100, "Current working place must be at most 100 characters long"),
    designation: z4
      .string()
      .min(5, "Designation must be at least 5 characters long")
      .max(100, "Designation must be at most 100 characters long"),
    avgRating: z4
      .number()
      .min(0, "Average rating must be a positive number")
      .max(5, "Average rating must be less than or equal to 5"),
  }),
  specialties: z4.array(z4.string().uuid("Invalid specialty ID format")),
});

router.post(
  "/create-doctor",
  (req: Request, res: Response, next: NextFunction) => {
    const parsedResult = createDoctorZodSchema.safeParse(req.body);

    if (!parsedResult.success) {
      console.log(parsedResult.error);
      next(parsedResult.error);
    }

    req.body = parsedResult.data;

    next();
  },
  UserController.createDoctor,
);

export const UserRoute = router;
