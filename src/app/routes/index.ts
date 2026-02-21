import { Router } from "express";
import { specialtyRouter } from "../module/specialty/specialty.routes";
import { authRoutes } from "../module/auth/auth.routes";
import { UserRoute } from "../module/user/user.route";
import { DoctorRoutes } from "../module/doctor/doctor.route";
import { scheduleRoutes } from "../module/schedule/schedule.routes";

const router = Router();

router.use("/auth", authRoutes);

router.use("/specialties", specialtyRouter);

router.use("/users/", UserRoute);

router.use("/doctors", DoctorRoutes);

router.use("/schedules", scheduleRoutes)

export const indexRoutes = router;
