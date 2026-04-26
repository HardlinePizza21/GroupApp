import { io } from "socket.io-client";

// 🔐 Pega aquí un JWT válido de tu auth-service
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3NzIzNDQyMywiZXhwIjoxNzc3MjM4MDIzfQ.WCqPVcDre8G6fTTboVnTQzK1sTUP5ZbUJeOja-SRSvs";

const socket = io("http://localhost:3003", {
  auth: {
    token: TOKEN,
  },
});

const CHANNEL_ID = 1;

socket.on("connect", () => {
  console.log("✅ Conectado:", socket.id);

  // Unirse al canal
  socket.emit("join_channel", CHANNEL_ID);
  console.log(`📡 Unido a channel:${CHANNEL_ID}`);
});

// 🔥 Evento clave (el que emite tu notifications-service)
socket.on("receive_message", (data) => {
  console.log("📩 Mensaje recibido:", data);
});

// Debug total (opcional pero útil)
socket.onAny((event, ...args) => {
  console.log("🛰️ Evento:", event, args);
});

socket.on("disconnect", () => {
  console.log("❌ Desconectado");
});