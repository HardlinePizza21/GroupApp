import { s3 } from "../../config/s3.js";

export const uploadToS3 = async (file) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    const result = await s3.upload(params).promise();

    return {
        url: result.Location,
        type: file.mimetype
    };
};