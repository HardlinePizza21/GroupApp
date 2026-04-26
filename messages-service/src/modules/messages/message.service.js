import prisma from "../../config/db.js";
import { getFileUrl, uploadToS3 } from "../files/file.service.js";
import { emitMessageSentEvent } from "../../messaging/emitEvents.js";

/* ── Obtener un mensaje por id ── */
export const getMessage = async (messageId) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      sender: { select: { id: true, username: true } },
    },
  });

  if (!message) throw new Error("Message not found");

  return {
    ...message,
    fileUrl: message.fileUrl ? await getFileUrl(message.fileUrl) : null,
  };
};

/* ── Listar mensajes de un canal con paginación ── */
export const getMessages = async (channelId, page = 1, limit = 50) => {
  const messages = await prisma.message.findMany({
    where:   { channelId: parseInt(channelId) },
    include: { sender: { select: { id: true, username: true } } },
    orderBy: { createdAt: "asc" },
    skip:    (page - 1) * limit,
    take:    limit,
  });

  return Promise.all(
    messages.map(async (msg) => ({
      ...msg,
      fileUrl: msg.fileUrl ? await getFileUrl(msg.fileUrl) : null,
    }))
  );
};

/* ── Crear mensaje (texto y/o archivo) ── */
export const createMessage = async (channelId, userId, content, file) => {
  let fileData = null;
  let publicUrl = null;

  // 1. Si hay archivo → subir a S3 (o local en dev)
  if (file) {
    const result = await uploadToS3(file);
    fileData  = { fileUrl: result.key, fileType: result.type };
    publicUrl = result.url;   // URL firmada para devolver al cliente y al evento
  }

  // 2. Persistir en DB
  const message = await prisma.message.create({
    data: {
      content,
      senderId:  userId,
      channelId,
      ...fileData,
    },
    include: {
      sender: { select: { id: true, username: true } },
    },
  });

  // 3. Construir objeto completo con URL pública (no el key interno)
  const messageForEvent = {
    ...message,
    fileUrl: publicUrl ?? null,
  };

  // 4. Publicar evento en RabbitMQ para que Socket.IO notifique a los clientes
  //    No esperamos a que falle — el HTTP response no debe depender del broker
  emitMessageSentEvent(channelId, messageForEvent).catch((err) =>
    console.error("[Service] Could not emit message.sent event:", err.message)
  );

  return messageForEvent;
};
