import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

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

const target = process.env.AUTH_GRPC_HOST || "auth-service:50051";
const client = new authProto.AuthGrpc(target, grpc.credentials.createInsecure());

export function verifyTokenViaGrpc(token) {
  return new Promise((resolve, reject) => {
    client.VerifyToken({ token }, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(response);
    });
  });
}
