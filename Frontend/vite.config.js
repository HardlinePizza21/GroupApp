import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 👈 clave para Docker
    port: 5173,
    proxy: {
      "/auth": "http://localhost:3000",
      "/groups": "http://localhost:3000",
      "/channels": "http://localhost:3000",
      "/upload": "http://localhost:3000",
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
      },
    },
  },
});
