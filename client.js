//!Este es un cliente de prueba, eliminar 
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3NDczNDA2MCwiZXhwIjoxNzc0NzM3NjYwfQ.L0TAk-IEkg2naPI5KzB2rJwl8L0VPqjyrpC9U_wVJC8"
  }
});