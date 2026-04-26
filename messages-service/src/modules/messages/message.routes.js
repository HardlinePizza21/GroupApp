import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import * as controller from "./message.controller.js";
import multer from "multer";

// Mantener archivos en memoria para subirlos directo a S3 sin tocar disco
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// Obtener un mensaje por id
router.get(
  "/messages/:messageId",
  authMiddleware,
  controller.getMessage
);

// Listar mensajes de un canal (paginado)
router.get(
  "/channels/:channelId/messages",
  authMiddleware,
  controller.getMessages
);

// Enviar mensaje (texto y/o archivo adjunto)
router.post(
  "/channels/:channelId/messages",
  authMiddleware,
  upload.single("file"),
  controller.sendMessage
);

export default router;
