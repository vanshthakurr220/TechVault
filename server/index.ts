import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import express from "express";

import app from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

await connectDB();

const server = createServer(app);

const staticPath =
  process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "public")
    : path.resolve(__dirname, "..", "dist", "public");

app.use(express.static(staticPath));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({
      message: "API route not found",
    });
  }

  res.sendFile(path.join(staticPath, "index.html"));
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
