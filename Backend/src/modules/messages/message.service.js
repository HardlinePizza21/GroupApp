import prisma from "../../config/db.js";

export const getMesseges = async (channelId, page = 1, limit = 50) => {
    const messages = await prisma.message.findMany({
        where: { channelId: parseInt(channelId) },
        include: { sender: { select: { id: true, username: true } } },
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
    });
    return messages;
};

export const createMessage = async (
    channelId,
    userId,
    content,
    file
) => {
    let fileData = null;

    if (file) {
        fileData = {
            fileUrl: `/uploads/${file.filename}`,
            fileType: file.mimetype
        };
    }

    const message = await prisma.message.create({
        data: {
            content,
            senderId: userId,
            channelId,
            ...fileData
        }
    });

    return message;
};