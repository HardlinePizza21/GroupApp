import { uploadToS3 } from "./file.service.js";

export const uploadFile = async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                error: "No file provided"
            });
        }

        const result = await uploadToS3(file);

        res.status(201).json(result);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};