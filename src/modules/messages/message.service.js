import prisma from "../../config/db.js";

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