import { s3 } from "../../config/s3.js";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, "../../../../uploads");

const hasS3Config = () =>
  Boolean(process.env.AWS_BUCKET_NAME) &&
  !process.env.AWS_BUCKET_NAME.includes("placeholder");

const getPublicBaseUrl = () =>
  process.env.BACKEND_PUBLIC_URL || "http://localhost:3001";

/* ── Fallback: guardar en disco local (dev sin S3) ── */
const uploadToLocal = async (file) => {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const safeName = `${Date.now()}-${file.originalname}`.replace(/\s+/g, "_");
  const key      = `uploads/${safeName}`;
  const absPath  = path.join(UPLOADS_DIR, safeName);

  await fs.writeFile(absPath, file.buffer);

  return {
    url:  `${getPublicBaseUrl()}/${key}`,
    key,
    type: file.mimetype,
  };
};

/* ── Subir archivo (S3 o local según config) ── */
export const uploadToS3 = async (file) => {
  if (!hasS3Config()) return uploadToLocal(file);

  const key = `uploads/${Date.now()}-${file.originalname}`;

  await s3.send(
    new PutObjectCommand({
      Bucket:      process.env.AWS_BUCKET_NAME,
      Key:         key,
      Body:        file.buffer,
      ContentType: file.mimetype,
    })
  );

  const signedUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }),
    { expiresIn: 3600 }
  );

  return { url: signedUrl, key, type: file.mimetype };
};

/* ── Obtener URL firmada a partir del key guardado en DB ── */
export const getFileUrl = async (key) => {
  if (!key) return null;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;

  if (!hasS3Config()) return `${getPublicBaseUrl()}/${key}`;

  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }),
    { expiresIn: 3600 }
  );
};
