import prisma from "../../config/db.js";
import { getFileUrl, uploadToS3 } from "../files/file.service.js";

export const getMessage = async (messageId) => {

    const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
            sender: {
                select: { id: true, username: true }
            }
        }
    });

    if (!message) {
        throw new Error("Message not found");
    }

    let fileUrl = null;

    if (message.fileUrl) {
        fileUrl = await getFileUrl(message.fileUrl);
    }

    return {
        ...message,
        fileUrl
    };
};

export const getMesseges = async (channelId, page = 1, limit = 50) => {
    const messages = await prisma.message.findMany({
        where: { channelId: parseInt(channelId) },
        include: { sender: { select: { id: true, username: true } } },
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
    });

    const messagesWithUrls = await Promise.all(
        messages.map(async (msg) => {
            const url = msg.fileUrl ? await getFileUrl(msg.fileUrl) : null;
            return {
                ...msg,
                fileUrl: url,
            };

        })
    );

    return messagesWithUrls;
};

export const createMessage = async (
    channelId,
    userId,
    content,
    file
) => {
    let fileData = null;
    let result = { url: null };



    if (file) {
        // 🔥 subir a S3
        result = await uploadToS3(file);

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

    console.log(message)
    if (result?.url) {
        message.fileUrl = result.url;
    }

    return message;
};