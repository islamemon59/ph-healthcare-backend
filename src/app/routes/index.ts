import { Router } from "express";
import { specialtyRouter } from "../module/specialty/specialty.routes";

const router = Router()

router.use("/specialties", specialtyRouter);


export const indexRoutes = router;