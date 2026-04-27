import "./src/config/env.js";
import http from "http";
import app from "./src/app.js";
import { startJWTRpcConsumer } from "./src/messaging/receiveEvents.js";
import { startGrpcServer } from "./src/grpc/server.js";

const PORT = process.env.PORT || 3000;

async function start() {
  const server = http.createServer(app);
  try{
    await startJWTRpcConsumer()
  }catch(error){
    console.log(error)
  }
  startGrpcServer();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start()