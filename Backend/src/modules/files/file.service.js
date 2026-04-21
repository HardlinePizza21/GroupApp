import { s3 } from "../../config/s3.js";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, "../../../uploads");

const hasS3Config = () =>
  Boolean(process.env.AWS_BUCKET_NAME) &&
  !process.env.AWS_BUCKET_NAME.includes("placeholder");

const getPublicBaseUrl = () => process.env.BACKEND_PUBLIC_URL || "http://localhost:3000";

const uploadToLocal = async (file) => {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const safeName = `${Date.now()}-${file.originalname}`.replace(/\s+/g, "_");
  const key = `uploads/${safeName}`;
  const absolutePath = path.join(UPLOADS_DIR, safeName);

  await fs.writeFile(absolutePath, file.buffer);

  return {
    url: `${getPublicBaseUrl()}/${key}`,
    key,
    type: file.mimetype,
  };
};

export const uploadToS3 = async (file) => {
  if (!hasS3Config()) {
    return uploadToLocal(file);
  }

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
  if (!key) return null;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  if (!hasS3Config()) {
    return `${getPublicBaseUrl()}/${key}`;
  }

  const getCommand = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3, getCommand, {
    expiresIn: 3600, // 1 hora
  });

  return signedUrl;
}