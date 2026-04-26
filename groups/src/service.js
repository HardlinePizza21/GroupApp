import prisma from "./config/db.js";
import { isAdmin } from "./utils/prisma.js";

// 🔥 Crear grupo
export const createGroup = async (name, description, userId) => {
  const group = await prisma.group.create({
    data: {
      name,
      description,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: "ADMIN"
        }
      }
    }
  });

  return group;
};

// ✏️ Editar grupo (solo ADMIN)
export const updateGroup = async (groupId, userId, data) => {
  // verificar si es admin
  const membership = await isAdmin(userId, groupId);

  if (!membership) {
    throw new Error("Not authorized");
  }

  return await prisma.group.update({
    where: { id: groupId },
    data
  });
};

export const getMyGroups = async (userId) => {
  const memberships = await prisma.groupMember.findMany({
    where: { userId: userId },
    include: { group: true },
  });
  const groups = memberships.map((m) => ({ ...m.group, role: m.role }));
  return groups;
};

// 👥 Invitar usuario
export const inviteUser = async (groupId, userId, targetUserId) => {

  const membership = await isAdmin(userId, groupId);

  if (!membership) {
    throw new Error("Not authorized");
  }

  // evitar duplicados
  const exists = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId: targetUserId
    }
  });

  if (exists) {
    throw new Error("User already in group");
  }

  return await prisma.groupMember.create({
    data: {
      groupId,
      userId: targetUserId,
      role: "MEMBER"
    }
  });
};

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