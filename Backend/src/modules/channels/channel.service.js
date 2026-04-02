import prisma from "../../config/db.js";
import { isAdmin } from "../../utils/prisma.js";

// 🔥 Crear canal
export const createChannel = async (groupId, userId, name) => {
  // verificar admin
  const admin = await isAdmin(userId, groupId);

  if (!admin) {
    throw new Error("Not authorized");
  }

  // evitar duplicados en el mismo grupo
  const existing = await prisma.channel.findFirst({
    where: {
      groupId,
      name
    }
  });

  if (existing) {
    throw new Error("Channel already exists");
  }

  const channel = await prisma.channel.create({
    data: {
      name,
      groupId
    }
  });

  return channel;
};

// 📜 Listar canales
export const getChannels = async (groupId, userId) => {
  // verificar que el usuario pertenezca al grupo
  const membership = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId
    }
  });

  if (!membership) {
    throw new Error("Not authorized");
  }

  return await prisma.channel.findMany({
    where: { groupId },
    orderBy: { createdAt: "asc" }
  });
};