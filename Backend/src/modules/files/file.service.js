import { s3 } from "../../config/s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const uploadToS3 = async (file) => {
  const key = `uploads/${Date.now()}-${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  });

  await s3.send(command);

  return {
    url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    type: file.mimetype
  };
};