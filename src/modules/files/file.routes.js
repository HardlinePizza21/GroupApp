import { Router } from "express";
import { upload } from "../../utils/storage/local.storage.js";
import { uploadFile } from "./file.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadFile
);

export default router;