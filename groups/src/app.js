import express from "express";
import cors from "cors";

import groupRoutes from "./routes.js";
import channelRoutes from './channel.routes.js'

const app = express();

app.use(cors());
app.use(express.json());

app.use("/groups", groupRoutes);
app.use("", channelRoutes)

app.get("/", (req, res) => {
  res.send("API running");
});

export default app;