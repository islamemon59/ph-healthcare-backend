import { Router } from "express";
import { specialtyController } from "./specialty.controller";

const router = Router();

router.post("/", specialtyController.createSpecialty);
router.get("/", specialtyController.getAllSpecialty);
router.delete("/:id", specialtyController.deleteSpecialty);
router.patch("/:id", specialtyController.updateSpecialty);

export const specialtyRouter = router;