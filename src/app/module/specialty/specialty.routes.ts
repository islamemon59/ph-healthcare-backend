import { Router } from "express";
import { specialtyController } from "./specialty.controller";

const router = Router();

router.post("/", specialtyController.createSpecialty);

export const specialtyRouter = router;