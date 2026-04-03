import { s3 } from "../../config/s3.js";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const uploadToS3 = async (file) => {
  const key = `uploads/${Date.now()}-${file.originalname}`;

  // 1. Subir archivo
  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3.send(uploadCommand);

  // 2. Generar URL firmada para lectura
  const getCommand = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3, getCommand, {
    expiresIn: 3600, // 1 hora
  });

  return {
    url: signedUrl,
    key, // 🔥 importante guardar esto en DB
    type: file.mimetype,
  };
};

export const getFileUrl = async (key) => {
  const getCommand = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3, getCommand, {
    expiresIn: 3600, // 1 hora
  });

  return signedUrl;
}