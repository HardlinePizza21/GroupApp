import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./modules/auth/auth.routes.js";
import groupRoutes from "./modules/groups/group.routes.js";
import channelRoutes from "./modules/channels/channel.routes.js";
import messageRoutes from "./modules/messages/message.routes.js";
import fileRoutes from "./modules/files/file.routes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.resolve(__dirname, "../uploads");

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsPath));

app.use("/auth", authRoutes);
app.use("/groups", groupRoutes);
app.use("", channelRoutes);
app.use("", messageRoutes);
app.use("", fileRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

export default app;