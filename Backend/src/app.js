import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes.js";
import groupRoutes from "./modules/groups/group.routes.js";
import channelRoutes from "./modules/channels/channel.routes.js";
import messageRoutes from "./modules/messages/message.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/groups", groupRoutes);
app.use("", channelRoutes);
app.use("", messageRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

export default app;