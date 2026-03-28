import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VSWQiOjEsImlhdCI6MTc3NDcyOTM3MCwiZXhwIjoxNzc0NzMyOTcwfQ.MOAdOXcAQDxMEdhmU3WzprinFyUWen2SyF2o8iFFR-4"
  }
});