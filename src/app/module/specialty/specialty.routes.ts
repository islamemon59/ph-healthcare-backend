import { Router } from "express";
import { specialtyController } from "./specialty.controller";
import { multerUpload } from "../../../config/multer.config";
import { validateRequest } from "../../middleware/validateRequest";
import { specialtyValidation } from "./specialty.validation";

const router = Router();

router.post(
  "/",
  multerUpload.single("file"),
  validateRequest(specialtyValidation.createSpecialtyZodSchema),
  specialtyController.createSpecialty,
);
router.get("/", specialtyController.getAllSpecialty);
router.delete("/:id", specialtyController.deleteSpecialty);
router.patch("/:id", specialtyController.updateSpecialty);

export const specialtyRouter = router;
