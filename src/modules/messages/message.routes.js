import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import * as controller from "./message.controller.js";
import { upload } from "../../utils/storage/local.storage.js";

const router = Router();

// enviar mensaje con archivo opcional
router.post(
    "/channels/:channelId/messages",
    authMiddleware,
    upload.single("file"),
    controller.sendMessage
);

export default router;