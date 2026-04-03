import prisma from "../../config/db.js";
import { uploadToS3 } from "../files/file.service.js";

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
        // 🔥 subir a S3
        const result = await uploadToS3(file);

        fileData = {
            fileUrl: result.key,
            fileType: result.type
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