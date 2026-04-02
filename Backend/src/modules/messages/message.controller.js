import * as messageService from "./message.service.js";

export const getMessages = async (req, res) => {
    try {
        const channelId = parseInt(req.params.channelId);
        const page  = parseInt(req.query.page  || "1");
        const limit = parseInt(req.query.limit || "50");
        const messages = await messageService.getMesseges(channelId, page, limit);
        res.json(messages);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

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
