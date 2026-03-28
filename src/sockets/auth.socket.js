import { verifyToken } from "../utils/jwt.js";

export default function authSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      const decoded = verifyToken(token);

      socket.user = decoded;

      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });
}