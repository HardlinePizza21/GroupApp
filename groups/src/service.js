import prisma from "../../config/db.js";
import { isAdmin } from "../../utils/prisma.js";

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