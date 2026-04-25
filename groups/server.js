import "./src/config/env.js";
import http from "http";
import app from "./src/app.js";
import { initializeEventListeners } from "./src/messaging/receiveEvents.js";


const PORT = process.env.PORT || 3000;

async function start() {
  const server = http.createServer(app);

  // Inicializar listeners de eventos
  try {
    await initializeEventListeners();
  } catch (error) {
    console.error('Failed to initialize event listeners:', error);
    // No detener el servidor si falla la escucha de eventos
  }

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start()