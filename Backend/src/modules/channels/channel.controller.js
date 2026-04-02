import * as channelService from "./channel.service.js";

// POST /groups/:groupId/channels
export const createChannel = async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        const userId = req.user.userId;

        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                error: "Channel name is required"
            });
        }

        const channel = await channelService.createChannel(
            groupId,
            userId,
            name
        );

        res.status(201).json(channel);

    } catch (err) {
        res.status(403).json({ error: err.message });
    }
};

// GET /groups/:groupId/channels
export const getChannels = async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        const userId = req.user.userId;

        const channels = await channelService.getChannels(
            groupId,
            userId
        );

        res.json(channels);

    } catch (err) {
        res.status(403).json({ error: err.message });
    }
};