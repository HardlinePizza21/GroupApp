import { verifyToken } from "../utils/jwt.js";

export default function authSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      // const decoded = verifyToken(token, process.env.JWT_SECRET);
      //!Para pruebas
      // socket.user = decoded;
      socket.user = {
        userId: 1
      }
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });
}