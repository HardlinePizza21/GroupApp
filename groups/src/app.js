import express from "express";
import cors from "cors";

import groupRoutes from "./routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/groups", groupRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

export default app;