import * as groupService from "./group.service.js";
import prisma from "../../config/db.js";

// POST /groups
export const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    const userId = req.user.userId; // viene del middleware JWT

    const group = await groupService.createGroup(
      name,
      description,
      userId
    );

    res.status(201).json(group);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /groups/:id
export const updateGroup = async (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const userId = req.user.userId;

    const group = await groupService.updateGroup(
      groupId,
      userId,
      req.body
    );

    res.json(group);

  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

// GET /groups/my
export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groups = await groupService.getMyGroups(userId);
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /groups/:id/invite
export const inviteUser = async (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const userId = req.user.userId;

    const { email, userId: targetUserId } = req.body;

    let finalUserId = targetUserId;

    // si envían email, buscar usuario
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      finalUserId = user.id;
    }

    const result = await groupService.inviteUser(
      groupId,
      userId,
      finalUserId
    );

    res.json(result);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};