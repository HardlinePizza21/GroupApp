import express from "express";
import cors from "cors";
import messageRoutes from "./modules/messages/message.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health check — útil para Docker/ECS health checks
app.get("/health", (req, res) => res.json({ status: "ok", service: "messages" }));

app.use("/", messageRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

export default app;
