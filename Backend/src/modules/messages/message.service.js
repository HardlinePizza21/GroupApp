import prisma from "../../config/db.js";
import { getFileUrl, uploadToS3 } from "../files/file.service.js";


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
            const url = await getFileUrl(msg.fileUrl);
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
    let result = null;



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
    message.fileUrl = result.url

    return message;
};