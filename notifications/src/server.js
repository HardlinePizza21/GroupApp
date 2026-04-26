import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { getMQChannel } from "./config/rabbitmq.js";
import { verifyToken } from "./config/jwt.js";
import { setupSocket } from "./socket/index.js";
import { consumeMessageEvents } from "./messaging/consumeEvents.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware de autenticación para Socket.IO
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Auth token missing"));
  }

  try {
    const decoded = verifyToken(token);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    console.error("[Auth] JWT verification failed:", err.message);
    next(new Error("Invalid token"));
  }
});

setupSocket(io);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "notifications" });
});

const start = async () => {
  try {
    // Verificar RabbitMQ
    await getMQChannel();
    console.log("✓ [RabbitMQ] Connected");

    // Iniciar consumo de eventos
    await consumeMessageEvents(io);
    console.log("✓ [RabbitMQ] Listening to message.sent events");

    httpServer.listen(PORT, () => {
      console.log(`✓ [Notifications Service] Socket.IO running on port ${PORT}`);
    });
  } catch (err) {
    console.error("✗ [Startup] Error:", err.message);
    process.exit(1);
  }
};

start();
