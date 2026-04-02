import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "";

export function useSocket({ token, onMessage, onConnect, onDisconnect }) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect",    ()    => onConnect?.());
    socket.on("disconnect", ()    => onDisconnect?.());
    socket.on("receive_message", (msg) => onMessage?.(msg));

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const joinChannel = useCallback((channelId) => {
    socketRef.current?.emit("join_channel", channelId);
  }, []);

  const sendMessage = useCallback((channelId, content) => {
    socketRef.current?.emit("send_message", { channelId, content });
  }, []);

  return { joinChannel, sendMessage, socket: socketRef.current };
}
