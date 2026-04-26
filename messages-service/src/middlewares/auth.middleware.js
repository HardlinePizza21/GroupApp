import { verifyTokenRPC } from "../messaging/rpcClient.js";

/**
 * Middleware de autenticación distribuido.
 * En lugar de verificar el JWT localmente (necesitaría el JWT_SECRET),
 * delega la verificación al servicio de auth via RPC por RabbitMQ.
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.slice(7); // Quitar "Bearer "

  try {
    const decoded = await verifyTokenRPC(token);
    req.user = decoded;  // { userId, iat, exp }
    next();
  } catch (err) {
    console.error("[Auth Middleware] RPC verification failed:", err.message);
    return res.status(401).json({ error: "Unauthorized", message: err.message });
  }
};

export default authMiddleware;
