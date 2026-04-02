//!Este es un cliente de prueba, eliminar 
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc3NDkwNjI2MCwiZXhwIjoxNzc0OTA5ODYwfQ.vGFpWL3hjREwuhUxvgGScGV3Mcgc3E9xMn5clcN-Pyg"
  }
});