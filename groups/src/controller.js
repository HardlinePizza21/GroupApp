import * as groupService from "./service.js";
import * as emitEvents from "./messaging/emitEvents.js";
import prisma from "./config/db.js";
import { verifyTokenViaGrpc } from "./grpc/authGrpcClient.js";

// POST /groups
export const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if(!name || !description)
        throw new Error("Description or name field missing")

    const userId = req.user.userId; // viene del middleware JWT

    const group = await groupService.createGroup(
      name,
      description,
      userId
    );

    // 🎯 Emitir evento de grupo creado
    try {
      await emitEvents.emitGroupCreatedEvent(
        group.id,
        group.name,
        userId
      );
    } catch (emitError) {
      console.warn('⚠️ Event emission failed, but group was created:', emitError.message);
      // No fallar la respuesta si la emisión de eventos falla
    }

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

    // 🎯 Emitir evento de grupo actualizado
    try {
      await emitEvents.emitGroupUpdatedEvent(
        group.id,
        group.name,
        userId,
        req.body
      );
    } catch (emitError) {
      console.warn('⚠️ Event emission failed, but group was updated:', emitError.message);
    }

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

    // 🎯 Emitir evento de usuario invitado
    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId }
      });

      await emitEvents.emitUserInvitedEvent(
        groupId,
        group.name,
        finalUserId,
        finalUserId,
        userId
      );
    } catch (emitError) {
      console.warn('⚠️ Event emission failed, but user was invited:', emitError.message);
    }

    res.json(result);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /groups/:groupId/channels
export const createChannel = async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        const userId = req.user.userId;

        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                error: "Channel name is required"
            });
        }

        const channel = await groupService.createChannel(
            groupId,
            userId,
            name
        );

        try{
          await emitEvents.emitChannelCreatedEvent();

        }catch(emitError){
          console.warn('⚠️ Event emission failed, but channel was created:', emitError.message);
        }

        res.status(201).json(channel);

    } catch (err) {
        res.status(403).json({ error: err.message });
    }
};

// GET /groups/:groupId/channels
export const getChannels = async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        const userId = req.user.userId;

        const channels = await groupService.getChannels(
            groupId,
            userId
        );

        res.json(channels);

    } catch (err) {
        res.status(403).json({ error: err.message });
    }
};

// POST /groups/grpc/verify-token
export const verifyTokenGrpc = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "token is required" });
    }

    const result = await verifyTokenViaGrpc(token);
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: "gRPC auth call failed", message: err.message });
  }
};