import { Router } from "express";
import { specialtyRouter } from "../module/specialty/specialty.routes";
import { authRoutes } from "../module/auth/auth.routes";
import { UserRoute } from "../module/user/user.route";
import { DoctorRoutes } from "../module/doctor/doctor.route";
import { scheduleRoutes } from "../module/schedule/schedule.routes";
import { DoctorScheduleRoutes } from "../module/doctorSchedule/doctorSchedule.routes";

const router = Router();

router.use("/auth", authRoutes);

router.use("/specialties", specialtyRouter);

router.use("/users/", UserRoute);

router.use("/doctors", DoctorRoutes);

router.use("/schedules", scheduleRoutes);

router.use("/doctor-schedules", DoctorScheduleRoutes);

export const indexRoutes = router;
