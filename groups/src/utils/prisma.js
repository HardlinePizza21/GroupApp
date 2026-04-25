import prisma from "../config/db.js";

export const isAdmin = async (userId, groupId) => {
  const member = await prisma.groupMember.findFirst({
    where: {
      userId,
      groupId
    }
  });

  return member?.role === "ADMIN";
};