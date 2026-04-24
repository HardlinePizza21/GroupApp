import "./src/config/env.js";
import http from "http";
import app from "./src/app.js";


const PORT = process.env.PORT || 3001;

async function start() {
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start()