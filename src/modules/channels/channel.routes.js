import { Router } from "express";
import * as controller from "./channel.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

// crear canal
router.post(
  "/groups/:groupId/channels",
  authMiddleware,
  controller.createChannel
);

// listar canales
router.get(
  "/groups/:groupId/channels",
  authMiddleware,
  controller.getChannels
);

export default router;