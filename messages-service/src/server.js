import app from "./app.js";
import { getMQChannel } from "./config/rabbitmq.js";

const PORT = process.env.PORT || 3001;

const start = async () => {
  try {
    // Verificar conectividad con RabbitMQ antes de aceptar requests
    // (si no hay broker, el servicio no tiene sentido arrancar)
    await getMQChannel();
    console.log("✓ [RabbitMQ] Connected");

    app.listen(PORT, () => {
      console.log(`✓ [Messages Service] Running on port ${PORT}`);
    });
  } catch (err) {
    console.error("✗ [Startup] Failed to connect to RabbitMQ:", err.message);
    process.exit(1);
  }
};

start();
