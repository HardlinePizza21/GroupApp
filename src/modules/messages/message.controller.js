import * as messageService from "./message.service.js";

export const sendMessage = async (req, res) => {
    try {
        const channelId = parseInt(req.params.channelId);
        const userId = req.user.userId;

        const { content } = req.body;
        const file = req.file;

        const message = await messageService.createMessage(
            channelId,
            userId,
            content,
            file
        );

        res.status(201).json(message);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};