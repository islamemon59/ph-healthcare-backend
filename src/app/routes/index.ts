import { Router } from "express";
import { specialtyRouter } from "../module/specialty/specialty.routes";
import { authRoutes } from "../module/auth/auth.routes";

const router = Router()

router.use("/auth", authRoutes);

router.use("/specialties", specialtyRouter);


export const indexRoutes = router;