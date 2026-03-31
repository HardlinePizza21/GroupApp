import { Router } from "express";
import * as controller from "./group.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

// 🔐 todas protegidas
router.post("/", authMiddleware, controller.createGroup);
router.put("/:id", authMiddleware, controller.updateGroup);
router.post("/:id/invite", authMiddleware, controller.inviteUser);

export default router;  