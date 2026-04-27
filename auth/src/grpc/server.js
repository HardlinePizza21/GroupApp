import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";
import { verifyToken } from "../utils/jwt.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.resolve(__dirname, "./auth.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

function verifyTokenHandler(call, callback) {
  const { token } = call.request;

  if (!token) {
    callback(null, { valid: false, userId: 0, message: "Token is required" });
    return;
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    const userId = Number(decoded.userId ?? decoded.id ?? 0);

    callback(null, { valid: true, userId, message: "Token is valid" });
  } catch {
    callback(null, { valid: false, userId: 0, message: "Invalid token" });
  }
}

export function startGrpcServer() {
  const server = new grpc.Server();

  server.addService(authProto.AuthGrpc.service, {
    VerifyToken: verifyTokenHandler,
  });

  const grpcPort = process.env.GRPC_PORT || "50051";
  const bindAddress = `0.0.0.0:${grpcPort}`;

  server.bindAsync(bindAddress, grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) {
      console.error("[gRPC] Failed to start Auth gRPC server:", err.message);
      return;
    }

    console.log(`[gRPC] Auth gRPC running on ${bindAddress}`);
  });

  return server;
}
