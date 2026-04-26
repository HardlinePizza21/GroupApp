import { io } from "socket.io-client";

const socket = io("http://localhost:3003", {
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3NzIzMTUyOCwiZXhwIjoxNzc3MjM1MTI4fQ.O4raPrxfcK8y37yGUnjyeg70tfRyPt6lpmTtnxZriPI", // si luego validas JWT
    },
});

socket.on("connect", () => {
    console.log("✅ Conectado:", socket.id);

    const channelId = 1;

    // Unirse al canal
    socket.emit("join_channel", channelId);


});

// Escuchar TODO (útil para debug)
socket.onAny((event, ...args) => {
    console.log("📩 Evento recibido:", event, args);
});

// Eventos específicos (los que tú definiste / usarás)
socket.on("notification:message", (data) => {
    console.log("🔔 Nueva notificación:", data);
});

socket.on("disconnect", () => {
    console.log("❌ Desconectado");
});